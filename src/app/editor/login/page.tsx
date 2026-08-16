import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function EditorLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-6 dark:bg-neutral-950">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
