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

type TimeOffRequest = {
  id: number;
  employee_id: string;
  employee_name: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
};

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function RequestOffPage() {
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isAdmin = profile?.role === "super_user";

  async function loadProfileAndRequests() {
    setError("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setError("User session not found.");
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, role, status")
      .eq("id", session.user.id)
      .single();

    if (profileError || !profileData) {
      setError(profileError?.message || "Profile not found.");
      return;
    }

    setProfile(profileData);

    let query = supabase
      .from("time_off_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (profileData.role !== "super_user") {
      query = query.eq("employee_id", profileData.id);
    }

    const { data, error } = await query;

    if (error) {
      setError(error.message);
      return;
    }

    setRequests(data || []);
  }

  async function submitRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!profile) {
      setError("Profile not found.");
      return;
    }

    if (endDate < startDate) {
      setError("End date cannot be before start date.");
      return;
    }

    const { error } = await supabase.from("time_off_requests").insert({
      employee_id: profile.id,
      employee_name: profile.full_name,
      start_date: startDate,
      end_date: endDate,
      reason,
      status: "pending",
    });

    if (error) {
      setError(error.message);
      return;
    }

    setStartDate("");
    setEndDate("");
    setReason("");
    setSuccess("Request submitted successfully.");
    loadProfileAndRequests();
  }

  async function updateStatus(id: number, status: "approved" | "denied") {
    setError("");
    setSuccess("");

    const { error } = await supabase
      .from("time_off_requests")
      .update({ status })
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(`Request ${status}.`);
    loadProfileAndRequests();
  }

  useEffect(() => {
    loadProfileAndRequests();
  }, []);

  return (
    <ProtectedRoute>
      <DashboardLayout
        title={isAdmin ? "Time Off Requests" : "Request Off"}
        subtitle={
          isAdmin
            ? "Approve or deny employee time off requests."
            : "Submit time off requests and view approval status."
        }
        roleLabel={isAdmin ? "Super User" : "Staff Portal"}
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

        {!isAdmin && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Submit Request
            </h2>

            <form onSubmit={submitRequest} className="mt-5 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Start date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    End date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Reason
                </label>
                <textarea
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Optional reason..."
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Submit Request
              </button>
            </form>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              {isAdmin ? "All Requests" : "My Requests"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {requests.length} request{requests.length === 1 ? "" : "s"} found.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {requests.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">
                No time off requests yet.
              </p>
            ) : (
              requests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {request.employee_name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatDate(request.start_date)} –{" "}
                      {formatDate(request.end_date)}
                    </p>
                    {request.reason && (
                      <p className="mt-2 text-sm text-slate-500">
                        {request.reason}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        request.status === "approved"
                          ? "bg-emerald-50 text-emerald-700"
                          : request.status === "denied"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {request.status}
                    </span>

                    {isAdmin && request.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(request.id, "approved")}
                          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => updateStatus(request.id, "denied")}
                          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                        >
                          Deny
                        </button>
                      </>
                    )}
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