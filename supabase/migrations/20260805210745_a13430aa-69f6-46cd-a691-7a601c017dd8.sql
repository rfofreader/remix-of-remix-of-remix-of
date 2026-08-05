-- roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  admin_exists boolean;
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') INTO admin_exists;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN admin_exists THEN 'user'::public.app_role ELSE 'admin'::public.app_role END)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- categories
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories admin write" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- books
CREATE TABLE public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'كتاب بلا عنوان',
  author text NOT NULL DEFAULT '',
  publisher text,
  published_date text,
  page_count int,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  content jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.books TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.books TO authenticated;
GRANT ALL ON public.books TO service_role;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "books public read" ON public.books FOR SELECT USING (true);
CREATE POLICY "books admin write" ON public.books FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER books_touch_updated_at BEFORE UPDATE ON public.books
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- favorites
CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, book_id)
);
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own favorites" ON public.favorites FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- reading history
CREATE TABLE public.reading_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  ratio real NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, book_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_history TO authenticated;
GRANT ALL ON public.reading_history TO service_role;
ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own history" ON public.reading_history FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- seed
INSERT INTO public.categories (name, slug, description, sort_order) VALUES
  ('أدب', 'adab', 'روايات وقصص ونصوص أدبية', 1),
  ('فكر وفلسفة', 'fikr', 'كتب الفكر والتأمل والفلسفة', 2),
  ('تاريخ', 'tarikh', 'كتب التاريخ والسير', 3),
  ('تنمية ذاتية', 'tanmiya', 'كتب التطوير الشخصي والعادات', 4),
  ('شعر', 'shier', 'دواوين ونصوص شعرية', 5);

INSERT INTO public.books (title, author, publisher, published_date, page_count, description, price, category_id, content)
VALUES
  (
    'أثر الهدوء',
    'نورة الشمري',
    'دار السكينة',
    '2024',
    180,
    'رحلة امرأة تبحث عن صوتها الداخلي بين مدينتين، وتكتشف أن الهدوء ليس غياب الصوت بل حضور الانتباه.',
    45.00,
    (SELECT id FROM public.categories WHERE slug = 'adab'),
    '[{"id":"v1","title":"الجزء الأول","markdown":"# بداية الطريق\n\nفي الصباح الذي سبق رحيلها عن المدينة، جلست تُراقب ضوء الشمس وهو يتسلّل من بين شقوق النافذة القديمة، ويرسم على الحائط خطوطاً رقيقة تشبه صفحات كتاب لم يُقرأ بعد.\n\nقالت لها جدّتها مرّة إن الإنسان لا يملك من عمره إلا اللحظات التي أنصت فيها لنفسه. لم تفهم العبارة حين سمعتها لأول مرة.\n\n## الحقيبة\n\nكانت الحقيبة صغيرة، وكل ما فيها لا يتجاوز ثلاث قطع من الملابس، ودفتراً بغلاف بنّي، وقلماً كتبت به أول جملة في حياتها.\n\n### قبل الباب\n\nقبل أن تُغلق الباب، توقّفت لحظة واحدة. لم تكن لحظة وداع، ولا لحظة تردّد، بل كانت شيئاً بين الاثنين.\n\n# مدينة بلا أسماء\n\nوصلت إلى المدينة قبل الغروب. كان الهواء مالحاً، والأصوات متشابكة، وكل شيء يبدو كأنه يتحرّك بسرعة أكبر من قدرتها على الاستيعاب.\n\n## الغرفة الصغيرة\n\nاستأجرت غرفة صغيرة في الطابق الرابع من بناية قديمة. كانت النافذة تطلّ على سطح مجاور، وفي زاوية السطح شجرة نبتت وحدها بين الإسمنت.\n\n## صديق المقهى\n\nقال لها مرّة: الناس يخافون من الوحدة لأنهم لم يجرّبوا أن يكونوا في صحبة أنفسهم. من يعرف نفسه لا يشعر بالفراغ أبداً، بل يشعر بالمساحة."},{"id":"v2","title":"الجزء الثاني","markdown":"# أثر الهدوء\n\nبمرور الأشهر، تعلّمت أن الهدوء ليس غياب الصوت، بل حضور الانتباه. صارت تسمع أصواتاً لم تكن تسمعها من قبل.\n\n## صفحة كل يوم\n\nكانت تكتب كل يوم صفحة واحدة، لا أكثر. ليست القاعدة في الكمّ، بل في الاستمرار.\n\n# العودة\n\nبعد عامين، قرّرت أن تعود. لم تكن عودتها انسحاباً، بل كانت اكتمالاً لدائرة بدأتها في صباح بعيد."}]'::jsonb
  ),
  (
    'رسائل إلى نفسي',
    'خالد المهنا',
    'دار المرايا',
    '2023',
    140,
    'رسائل قصيرة يكتبها صاحبها لنفسه في نهاية كل عام، عن الخوف والرجاء والعادات الصغيرة.',
    35.00,
    (SELECT id FROM public.categories WHERE slug = 'fikr'),
    '[{"id":"v1","title":"الجزء الأول","markdown":"# الرسالة الأولى\n\nاكتب لنفسك كما تكتب لصديق تحبّه: بلا مجاملة وبلا قسوة. الرسائل التي نكتبها لأنفسنا هي أصدق ما نملك.\n\n## عن الخوف\n\nالخوف ليس عدواً، بل حارس قديم نسي أن الحرب انتهت.\n\n# الرسالة الثانية\n\nلا تقس يومك بما أنجزت فيه، بل بما انتبهت له."}]'::jsonb
  ),
  (
    'ما تبقّى من الضوء',
    'سلمى العتيبي',
    'منشورات الأفق',
    '2025',
    96,
    'ديوان شعري قصير عن المدن والغياب والنوافذ التي تُفتح في آخر الليل.',
    28.00,
    (SELECT id FROM public.categories WHERE slug = 'shier'),
    '[{"id":"v1","title":"الجزء الأول","markdown":"# نوافذ\n\nفي آخر الليل تُفتح النوافذ وحدها، كأن البيوت تتنفّس بعد يوم طويل من الصمت.\n\n## غياب\n\nلم يكن الغياب مسافة، كان طريقة أخرى للحضور.\n\n# ما تبقّى\n\nما تبقّى من الضوء يكفي لنقرأ به سطراً واحداً، وسطر واحد يكفي أحياناً."}]'::jsonb
  );