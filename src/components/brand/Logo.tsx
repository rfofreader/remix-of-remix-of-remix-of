/** شعار التطبيق بخط الشعار المخصّص — لا يُستخدم هذا الخط في أي مكان آخر. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`block leading-none text-ink ${className}`}
      style={{ fontFamily: "var(--font-logo)" }}
    >
      رفـــوف
    </span>
  );
}
