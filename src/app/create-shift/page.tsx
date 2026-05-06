"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  full_name: string;
  status: string;
};

function getDayName(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-US", {
    weekday: "long",
  });
}

export default function CreateShiftPage() {
  const supabase = createClient();

  const [employees, setEmployees] = useState<Profile[]>([]);
  const [employeeName, setEmployeeName] = useState("");
  const [role, setRole] = useState("");
  const [shiftDate, setShiftDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadEmployees() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, status")
      .eq("status", "approved")
      .order("full_name", { ascending: true });

    if (error) {
      setError(error.message);
      return;
    }

    setEmployees(data || []);
  }

  async function createShift(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const { error } = await supabase.from("shifts").insert({
      employee_name: employeeName,
      role,
      shift_date: shiftDate,
      shift_day: getDayName(shiftDate),
      start_time: startTime,
      end_time: endTime,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setEmployeeName("");
    setRole("");
    setShiftDate("");
    setStartTime("");
    setEndTime("");

    setSuccess("Shift created successfully.");
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  return (
    <ProtectedRoute requireAdmin>
      <DashboardLayout
        title="Create Shift"
        subtitle="Add a new employee shift to the weekly schedule."
        roleLabel="Super User"
      >
        {error && (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-700">
            {success}
          </div>
        )}

        <div className="max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={createShift} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Employee
              </label>

              <select
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                required
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select employee</option>

                {employees.map((employee) => (
                  <option
                    key={employee.id}
                    value={employee.full_name}
                  >
                    {employee.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Shift Date
              </label>

              <input
                type="date"
                value={shiftDate}
                onChange={(e) => setShiftDate(e.target.value)}
                required
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Role
              </label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select role</option>
                <option value="Front Desk">Front Desk</option>
                <option value="Overnight">Overnight</option>
                <option value="Opener">Opener</option>
                <option value="Closer">Closer</option>
                <option value="Manager">Manager</option>
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Start Time
                </label>

                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  End Time
                </label>

                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.99]"
            >
              Create Shift
            </button>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}