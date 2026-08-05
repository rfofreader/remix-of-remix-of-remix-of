import { createFileRoute, redirect } from "@tanstack/react-router";

// The library/home screen comes in the next phase; for now the reader is the app.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/read" });
  },
});
