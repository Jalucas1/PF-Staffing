"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireAdmin?: boolean;
};

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        window.location.href = "/";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", session.user.id)
        .single();

      if (!profile || profile.status !== "approved") {
        window.location.href = "/pending-approval";
        return;
      }

      if (requireAdmin && profile.role !== "super_user") {
        window.location.href = "/schedule";
        return;
      }

      setAllowed(true);
      setLoading(false);
    }

    checkAccess();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Checking access...</p>
      </main>
    );
  }

  if (!allowed) return null;

  return <>{children}</>;
}