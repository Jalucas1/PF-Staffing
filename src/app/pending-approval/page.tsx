"use client";

import { createClient } from "@/lib/supabase/client";

export default function PendingApprovalPage() {
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
          <span className="text-3xl">⏳</span>
        </div>

        <p className="mb-2 text-sm font-medium text-indigo-600">
          Staff Scheduling Portal
        </p>

        <h1 className="text-2xl font-semibold text-slate-900">
          Access pending
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Your account has been created, but it needs admin approval before you
          can view the employee schedule.
        </p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
          <p className="text-sm font-medium text-slate-900">
            What happens next?
          </p>
          <p className="mt-1 text-sm text-slate-500">
            A super user will review your request. Once approved, you’ll be able
            to log in and view upcoming shifts and staff alerts.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Sign out and return to sign in
        </button>
      </div>
    </main>
  );
}