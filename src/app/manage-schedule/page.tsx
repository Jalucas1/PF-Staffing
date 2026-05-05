"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { createClient } from "@/lib/supabase/client";

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
  return time.slice(0, 5);
}

function getDayName(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

export default function ManageSchedulePage() {
  const supabase = createClient();

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    employee_name: "",
    role: "",
    shift_date: "",
    start_time: "",
    end_time: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadShifts() {
    const { data, error } = await supabase
      .from("shifts")
      .select("*")
      .order("shift_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      setError(error.message);
      return;
    }

    setShifts(data || []);
  }

  function startEditing(shift: Shift) {
    setEditingId(shift.id);
    setEditForm({
      employee_name: shift.employee_name,
      role: shift.role,
      shift_date: shift.shift_date,
      start_time: formatTime(shift.start_time),
      end_time: formatTime(shift.end_time),
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setEditForm({
      employee_name: "",
      role: "",
      shift_date: "",
      start_time: "",
      end_time: "",
    });
  }

  async function saveEdit(id: number) {
    setError("");
    setSuccess("");

    const { error } = await supabase
      .from("shifts")
      .update({
        employee_name: editForm.employee_name,
        role: editForm.role,
        shift_date: editForm.shift_date,
        shift_day: getDayName(editForm.shift_date),
        start_time: editForm.start_time,
        end_time: editForm.end_time,
      })
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess("Shift updated successfully.");
    cancelEditing();
    loadShifts();
  }

  async function deleteShift(id: number) {
    const confirmed = window.confirm("Delete this shift?");
    if (!confirmed) return;

    setError("");
    setSuccess("");

    const { error } = await supabase.from("shifts").delete().eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess("Shift deleted successfully.");
    loadShifts();
  }

  useEffect(() => {
    loadShifts();
  }, []);

  return (
    <ProtectedRoute requireAdmin>
      <DashboardLayout
        title="Manage Schedule"
        subtitle="Edit, update, or remove existing employee shifts."
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

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Scheduled Shifts
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Edit or delete shifts from the schedule.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {shifts.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">
                No shifts have been created yet.
              </p>
            ) : (
              shifts.map((shift) => {
                const isEditing = editingId === shift.id;

                return (
                  <div key={shift.id} className="p-6">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <input
                            type="text"
                            value={editForm.employee_name}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                employee_name: e.target.value,
                              })
                            }
                            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                          />

                          <input
                            type="text"
                            value={editForm.role}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                role: e.target.value,
                              })
                            }
                            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                          />

                          <input
                            type="date"
                            value={editForm.shift_date}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                shift_date: e.target.value,
                              })
                            }
                            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                          />

                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="time"
                              value={editForm.start_time}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  start_time: e.target.value,
                                })
                              }
                              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />

                            <input
                              type="time"
                              value={editForm.end_time}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  end_time: e.target.value,
                                })
                              }
                              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(shift.id)}
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
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-medium text-slate-900">
                            {shift.employee_name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {shift.role}
                          </p>
                        </div>

                        <div className="text-sm text-slate-600">
                          {shift.shift_day},{" "}
                          {new Date(
                            `${shift.shift_date}T00:00:00`
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}{" "}
                          · {formatTime(shift.start_time)} –{" "}
                          {formatTime(shift.end_time)}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditing(shift)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => deleteShift(shift.id)}
                            className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}