"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { createClient } from "@/lib/supabase/client";

type Alert = {
  id: number;
  title: string;
  message: string;
  priority: string;
  created_at: string;
};

export default function AlertsPage() {
  const supabase = createClient();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    message: "",
    priority: "normal",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadAlerts() {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      return;
    }

    setAlerts(data || []);
  }

  async function loadUserRole() {
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

  function startEditing(alert: Alert) {
    setEditingId(alert.id);
    setEditForm({
      title: alert.title,
      message: alert.message,
      priority: alert.priority,
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setEditForm({
      title: "",
      message: "",
      priority: "normal",
    });
  }

  async function saveEdit(id: number) {
    setError("");
    setSuccess("");

    const { error } = await supabase
      .from("alerts")
      .update({
        title: editForm.title,
        message: editForm.message,
        priority: editForm.priority,
      })
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess("Alert updated successfully.");
    cancelEditing();
    loadAlerts();
  }

  async function deleteAlert(id: number) {
    const confirmed = window.confirm("Delete this alert?");
    if (!confirmed) return;

    setError("");
    setSuccess("");

    const { error } = await supabase.from("alerts").delete().eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess("Alert deleted successfully.");
    loadAlerts();
  }

  useEffect(() => {
    loadAlerts();
    loadUserRole();
  }, []);

  function getPriorityStyles(priority: string) {
    if (priority === "urgent") return "bg-red-50 text-red-700";
    if (priority === "high") return "bg-amber-50 text-amber-700";
    return "bg-indigo-50 text-indigo-700";
  }

  return (
    <ProtectedRoute>
      <DashboardLayout
        title="Staff Alerts"
        subtitle="View announcements and important updates from management."
      >
        {error && (
          <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {success && isAdmin && (
          <p className="mb-4 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-700">
            {success}
          </p>
        )}

        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
              No alerts yet.
            </div>
          ) : (
            alerts.map((alert) => {
              const isEditing = editingId === alert.id;

              return (
                <div
                  key={alert.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  {isEditing && isAdmin ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm({ ...editForm, title: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />

                      <textarea
                        rows={4}
                        value={editForm.message}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            message: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />

                      <select
                        value={editForm.priority}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            priority: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      >
                        <option value="normal">Normal Priority</option>
                        <option value="high">High Priority</option>
                        <option value="urgent">Urgent Priority</option>
                      </select>

                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(alert.id)}
                          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                          Save
                        </button>

                        <button
                          onClick={cancelEditing}
                          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-lg font-semibold text-slate-900">
                            {alert.title}
                          </h2>

                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {alert.message}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityStyles(
                            alert.priority
                          )}`}
                        >
                          {alert.priority}
                        </span>
                      </div>

                      <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <p className="text-xs text-slate-400">
                          {new Date(alert.created_at).toLocaleString()}
                        </p>

                        {isAdmin && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditing(alert)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => deleteAlert(alert.id)}
                              className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}