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
  return date.toLocaleDateString("en-US", { weekday: "long" });
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

  async function createShift(e: any) {
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
        subtitle="Add a new employee shift to a specific date."
        roleLabel="Super User"
      >
        {error && (
          <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {success && (
          <p className="mb-4 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-700">
            {success}
          </p>
        )}

        <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={createShift} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Employee
              </label>
              <select
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.full_name}>
                    {employee.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Shift date
              </label>
              <input
                type="date"
                value={shiftDate}
                onChange={(e) => setShiftDate(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select role</option>
                <option value="Front Desk">Front Desk</option>
                <option value="Overnight">Overnight</option>
                <option value="Opener">Opener</option>
                <option value="Closer">Closer</option>
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Start time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  End time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Create Shift
            </button>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}