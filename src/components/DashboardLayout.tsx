"use client";

import LogoutButton from "@/components/LogoutButton";
import {
  Bell,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Users,
} from "lucide-react";

type DashboardLayoutProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  roleLabel?: string;
};

const navItems = [
  { label: "Schedule", href: "/schedule", icon: CalendarDays },
  { label: "Create Shift", href: "/create-shift", icon: PlusCircle },
  { label: "Manage Schedule", href: "/manage-schedule", icon: ClipboardList },
  { label: "Alerts", href: "/alerts", icon: Bell },
  { label: "Employees", href: "/employees", icon: Users },
  { label: "Admin", href: "/admin", icon: LayoutDashboard },
];

export default function DashboardLayout({
  children,
  title,
  subtitle,
  roleLabel = "Staff Portal",
}: DashboardLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-72 bg-slate-900 p-6 text-slate-200 md:block">
          <div className="mb-8">
            <p className="text-sm text-slate-400">ShiftBoard</p>
            <h2 className="text-xl font-bold text-white">
              Staff Scheduler
            </h2>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-slate-800 hover:text-white"
                >
                  <Icon size={18} />
                  {item.label}
                </a>
              );
            })}
          </nav>

          <LogoutButton />
        </aside>

        {/* Content */}
        <section className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <p className="text-sm font-medium text-indigo-600">
                {roleLabel}
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                {title}
              </h1>

              {subtitle && (
                <p className="mt-2 text-sm text-slate-500">
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