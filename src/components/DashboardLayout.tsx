"use client";

import { useState } from "react";
import {
  Bell,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Users,
  X,
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sidebarContent = (
    <>
      <div className="mb-8">
        <p className="text-sm text-slate-400">ShiftBoard</p>
        <h2 className="text-xl font-bold text-white">Staff Scheduler</h2>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white"
            >
              <Icon size={18} />
              {item.label}
            </a>
          );
        })}
      </nav>

      <LogoutButton />
    </>
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 bg-slate-900 p-6 text-slate-200 md:block">
          {sidebarContent}
        </aside>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileMenuOpen(false)}
            />

            <aside className="relative h-full w-80 max-w-[85vw] bg-slate-900 p-6 text-slate-200 shadow-xl">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute right-4 top-4 rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>

              {sidebarContent}
            </aside>
          </div>
        )}

        <section className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4 flex items-center justify-between md:hidden">
              <div>
                <p className="text-sm font-medium text-indigo-600">
                  ShiftBoard
                </p>
                <p className="text-lg font-bold text-slate-900">
                  Staff Scheduler
                </p>
              </div>

              <button
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm"
              >
                <Menu size={20} />
              </button>
            </div>

            <div className="mb-8">
              <p className="text-sm font-medium text-indigo-600">
                {roleLabel}
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                {title}
              </h1>

              {subtitle && (
                <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
              )}
            </div>

            {children}
          </div>
        </section>
      </div>
    </main>
  );
}