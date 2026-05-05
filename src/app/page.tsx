"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);

  async function redirectByRole(userId: string) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("status, role")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      setCheckingSession(false);
      return;
    }

    if (profile.status !== "approved") {
      window.location.href = "/pending-approval";
      return;
    }

    if (profile.role === "super_user") {
      window.location.href = "/admin";
      return;
    }

    window.location.href = "/schedule";
  }

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await redirectByRole(session.user.id);
        return;
      }

      setCheckingSession(false);
    }

    checkSession();
  }, []);

  async function handleLogin(e: any) {
    e.preventDefault();
    setError("");

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      return;
    }

    if (!data.user) {
      setError("User not found after login.");
      return;
    }

    await redirectByRole(data.user.id);
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">
          Staff Portal
        </h1>

        <p className="text-slate-500 mb-6">Sign in to view your schedule</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-slate-600">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            Sign In
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-6 text-center">
          Don’t have an account?{" "}
          <a
            href="/request-access"
            className="text-indigo-600 hover:text-indigo-700"
          >
            Request access
          </a>
        </p>
      </div>
    </main>
  );
}