"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  full_name: string;
  role: string;
  status: string;
};

type Shift = {
  id: number;
  employee_name: string;
  role: string;
  shift_day: string;
  shift_date: string;
  start_time: string;
  end_time: string;
};

function formatTime(time: string) {
  const [hours, minutes] = time.split(":");

  const date = new Date();
  date.setHours(Number(hours));
  date.setMinutes(Number(minutes));

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MyShiftsPage() {
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [error, setError] = useState("");

  const isAdmin = profile?.role === "super_user";

  async function loadUserAndShifts() {
    setError("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setError("User session not found.");
      return;
    }

    const { data: currentProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, role, status")
      .eq("id", session.user.id)
      .single();

    if (profileError || !currentProfile) {
      setError(profileError?.message || "Profile not found.");
      return;
    }

    setProfile(currentProfile);

    if (currentProfile.role === "super_user") {
      const { data: employeeData, error: employeeError } = await supabase
        .from("profiles")
        .select("id, full_name, role, status")
        .eq("status", "approved")
        .order("full_name", { ascending: true });

      if (employeeError) {
        setError(employeeError.message);
        return;
      }

      setEmployees(employeeData || []);

      if (employeeData && employeeData.length > 0) {
        setSelectedEmployee(employeeData[0].full_name);
        await loadShifts(employeeData[0].full_name);
      }
    } else {
      setSelectedEmployee(currentProfile.full_name);
      await loadShifts(currentProfile.full_name);
    }
  }

  async function loadShifts(employeeName: string) {
    const { data, error } = await supabase
      .from("shifts")
      .select("*")
      .eq("employee_name", employeeName)
      .order("shift_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      setError(error.message);
      return;
    }

    setShifts(data || []);
  }

  async function handleEmployeeChange(employeeName: string) {
    setSelectedEmployee(employeeName);
    await loadShifts(employeeName);
  }

  useEffect(() => {
    loadUserAndShifts();
  }, []);

  return (
    <ProtectedRoute>
      <DashboardLayout
        title={isAdmin ? "Employee Shifts" : "My Shifts"}
        subtitle={
          isAdmin
            ? "Select an employee to view their scheduled shifts."
            : "View your upcoming scheduled shifts."
        }
        roleLabel={isAdmin ? "Super User" : "Staff Portal"}
      >
        {error && (
          <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {isAdmin && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="text-sm font-medium text-slate-700">
              Select employee
            </label>

            <select
              value={selectedEmployee}
              onChange={(e) => handleEmployeeChange(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 md:max-w-md"
            >
              {employees.map((employee) => (
                <option key={employee.id} value={employee.full_name}>
                  {employee.full_name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              {selectedEmployee || "Scheduled Shifts"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {shifts.length} shift{shifts.length === 1 ? "" : "s"} found.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {shifts.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">
                No shifts scheduled.
              </p>
            ) : (
              shifts.map((shift) => (
                <div
                  key={shift.id}
                  className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {formatDate(shift.shift_date)}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {shift.role}
                    </p>
                  </div>

                  <div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
                    {formatTime(shift.start_time)} –{" "}
                    {formatTime(shift.end_time)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}