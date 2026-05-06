"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Menu,
  PlusCircle,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import LogoutButton from "@/components/LogoutButton";
import { createClient } from "@/lib/supabase/client";

type DashboardLayoutProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  roleLabel?: string;
};

const navItems = [
  {
    label: "Schedule",
    href: "/schedule",
    icon: CalendarDays,
  },
  {
    label: "Alerts",
    href: "/alerts",
    icon: Bell,
  },
  {
    label: "Create Shift",
    href: "/create-shift",
    icon: PlusCircle,
    adminOnly: true,
  },
  {
    label: "Manage Schedule",
    href: "/manage-schedule",
    icon: ClipboardList,
    adminOnly: true,
  },
  {
    label: "Employees",
    href: "/employees",
    icon: Users,
    adminOnly: true,
  },
  {
    label: "Admin",
    href: "/admin",
    icon: LayoutDashboard,
    adminOnly: true,
  },
];

export default function DashboardLayout({
  children,
  title,
  subtitle,
  roleLabel = "Staff Portal",
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function loadRole() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      setIsAdmin(profile?.role === "super_user");
    }

    loadRole();
  }, []);

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  const navLinks = (
    <nav className="space-y-2">
      {filteredNavItems.map((item) => {
        const Icon = item.icon;

        return (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <Icon size={18} />
            </span>

            {item.label}
          </a>
        );
      })}
    </nav>
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden w-72 bg-slate-950 p-6 text-slate-200 md:block">
          <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500 text-white">
              <Sparkles size={20} />
            </div>

            <p className="text-sm text-slate-400">PF Staff Schedule</p>

            <h2 className="text-xl font-bold text-white">
              Staff Scheduler
            </h2>
          </div>

          {navLinks}

          <LogoutButton />
        </aside>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            <aside className="relative flex h-full w-80 max-w-[88vw] flex-col bg-slate-950 p-5 text-slate-200 shadow-2xl">
              <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">
                      <Sparkles size={22} />
                    </div>

                    <p className="text-sm text-slate-400">
                      PF Staff Schedule
                    </p>

                    <h2 className="text-xl font-bold text-white">
                      Staff Scheduler
                    </h2>

                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      Manage schedules, alerts, and team access.
                    </p>
                  </div>

                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-2xl bg-white/10 p-2 text-slate-300 hover:bg-white/15 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1">{navLinks}</div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Signed in
                </p>

                <p className="mt-1 text-sm font-semibold text-white">
                  {isAdmin ? "Super User" : "Employee"}
                </p>

                <LogoutButton />
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <section className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-7xl">
            {/* Mobile Header */}
            <div className="sticky top-0 z-40 -mx-4 mb-6 border-b border-slate-200 bg-slate-50/90 px-4 py-4 backdrop-blur md:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <Sparkles size={17} />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-indigo-600">
                      PF Staff Schedule
                    </p>

                    <p className="text-sm font-bold text-slate-900">
                      Staff Scheduler
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm active:scale-95"
                >
                  <Menu size={20} />
                </button>
              </div>
            </div>

            {/* Page Header */}
            <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:border-0 md:bg-transparent md:p-0 md:shadow-none">
              <p className="text-sm font-medium text-indigo-600">
                {roleLabel}
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
                {title}
              </h1>

              {subtitle && (
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {subtitle}
                </p>
              )}
            </div>

            {children}
          </div>
        </section>
      </div>
    </main>
  );
}