"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
};

export default function EmployeesPage() {
  const supabase = createClient();

  const [employees, setEmployees] = useState<Profile[]>([]);
  const [error, setError] = useState("");

  async function loadEmployees() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, status")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      return;
    }

    setEmployees(data || []);
  }

  async function removeAccess(id: string) {
    const { error } = await supabase
      .from("profiles")
      .update({ status: "denied" })
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    loadEmployees();
  }

  async function deleteEmployee(id: string) {
    const confirmed = window.confirm(
      "Delete this employee from the staff list?"
    );

    if (!confirmed) return;

    const { error } = await supabase.from("profiles").delete().eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    loadEmployees();
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  return (
    <ProtectedRoute requireAdmin>
    <DashboardLayout
      title="Employees"
      subtitle="Manage staff accounts, roles, and approval status."
      roleLabel="Super User"
    >
      {error && (
        <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Staff Directory
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Review employee access and account status.
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {employee.full_name}
                </p>
                <p className="text-sm text-gray-500">{employee.email}</p>
              </div>

              <div className="hidden text-sm text-gray-500 md:block">
                {employee.role}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    employee.status === "approved"
                      ? "bg-teal-50 text-teal-700"
                      : employee.status === "denied"
                      ? "bg-red-50 text-red-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {employee.status}
                </span>

                <button
                  onClick={() => removeAccess(employee.id)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Remove Access
                </button>

                <button
                  onClick={() => deleteEmployee(employee.id)}
                  className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  );
}