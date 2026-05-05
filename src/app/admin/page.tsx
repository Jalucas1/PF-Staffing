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

export default function AdminPage() {
  const supabase = createClient();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertPriority, setAlertPriority] = useState("normal");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadProfiles() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, status")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      return;
    }

    setProfiles(data || []);
  }

  async function updateStatus(id: string, status: "approved" | "denied") {
    setError("");
    setSuccess("");

    const { error } = await supabase
      .from("profiles")
      .update({ status })
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(`User ${status}.`);
    loadProfiles();
  }

  async function publishAlert(e: any) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { error } = await supabase.from("alerts").insert({
      title: alertTitle,
      message: alertMessage,
      priority: alertPriority,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setAlertTitle("");
    setAlertMessage("");
    setAlertPriority("normal");
    setSuccess("Alert published successfully.");
  }

  useEffect(() => {
    loadProfiles();
  }, []);

  const pendingUsers = profiles.filter(
    (profile) => profile.status === "pending"
  );

  const stats = [
    { label: "Pending Approvals", value: pendingUsers.length },
    { label: "Employees", value: profiles.length },
    {
      label: "Approved Users",
      value: profiles.filter((p) => p.status === "approved").length,
    },
    {
      label: "Denied Users",
      value: profiles.filter((p) => p.status === "denied").length,
    },
  ];

  return (
    <ProtectedRoute requireAdmin>
    <DashboardLayout
      title="Admin Dashboard"
      subtitle="Manage approvals, schedules, employees, and staff alerts."
      roleLabel="Super User"
    >
      {error && (
        <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {success && (
        <p className="mb-4 rounded-xl bg-teal-50 p-3 text-sm text-teal-700">
          {success}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-gray-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Pending User Approvals
          </h2>

          <div className="mt-5 space-y-4">
            {pendingUsers.length === 0 ? (
              <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                No pending users right now.
              </p>
            ) : (
              pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {user.full_name}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(user.id, "approved")}
                      className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => updateStatus(user.id, "denied")}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                      Deny
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Create Staff Alert
          </h2>

          <form onSubmit={publishAlert} className="mt-5 space-y-4">
            <input
              type="text"
              placeholder="Alert title"
              value={alertTitle}
              onChange={(e) => setAlertTitle(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />

            <textarea
              placeholder="Write an announcement..."
              rows={5}
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />

            <select
              value={alertPriority}
              onChange={(e) => setAlertPriority(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            >
              <option value="normal">Normal Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent Priority</option>
            </select>

            <button
              type="submit"
              className="w-full rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Publish Alert
            </button>
          </form>
        </section>
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  );
}