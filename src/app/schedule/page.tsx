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
  break_start_time: string | null;
  break_end_time: string | null;
};

const hours = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0")
);

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getWeekDates(weekOffset: number) {
  const today = new Date();
  const dayIndex = today.getDay();

  const monday = new Date(today);
  const diff = dayIndex === 0 ? -6 : 1 - dayIndex;
  monday.setDate(today.getDate() + diff + weekOffset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    return {
      name: date.toLocaleDateString("en-US", { weekday: "long" }),
      shortName: date.toLocaleDateString("en-US", { weekday: "short" }),
      date,
      isoDate: formatLocalDate(date),
    };
  });
}

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

function formatHour(hour: string) {
  const date = new Date();
  date.setHours(Number(hour));
  date.setMinutes(0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    hour12: true,
  });
}

function formatBreak(start: string | null, end: string | null) {
  if (!start || !end) return "No break listed";
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export default function SchedulePage() {
  const supabase = createClient();

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [error, setError] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);

  const days = getWeekDates(weekOffset);

  async function loadShifts() {
    const weekStart = days[0].isoDate;
    const weekEnd = days[6].isoDate;

    const { data, error } = await supabase
      .from("shifts")
      .select("*")
      .gte("shift_date", weekStart)
      .lte("shift_date", weekEnd)
      .order("shift_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      setError(error.message);
      return;
    }

    setShifts(data || []);
  }

  useEffect(() => {
    loadShifts();
  }, [weekOffset]);

  return (
    <ProtectedRoute>
      <DashboardLayout
        title="Weekly Schedule"
        subtitle="View all staff shifts for the selected week."
      >
        {error && (
          <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {days[0].date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                –{" "}
                {days[6].date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>

              <p className="text-xs text-slate-500">
                Use the controls to review previous or upcoming schedules.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 md:flex">
              <button
                onClick={() => setWeekOffset((current) => current - 1)}
                className={`rounded-xl px-3 py-2 text-xs font-medium md:px-4 md:text-sm ${
                  weekOffset < 0
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                Previous
              </button>

              <button
                onClick={() => setWeekOffset(0)}
                className={`rounded-xl px-3 py-2 text-xs font-medium md:px-4 md:text-sm ${
                  weekOffset === 0
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                This Week
              </button>

              <button
                onClick={() => setWeekOffset((current) => current + 1)}
                className={`rounded-xl px-3 py-2 text-xs font-medium md:px-4 md:text-sm ${
                  weekOffset > 0
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 md:hidden">
          {days.map((day) => {
            const dayShifts = shifts.filter(
              (shift) => shift.shift_date === day.isoDate
            );

            return (
              <section
                key={day.isoDate}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-base font-bold text-slate-900">
                      {day.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {day.date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {dayShifts.length} shift{dayShifts.length === 1 ? "" : "s"}
                  </span>
                </div>

                {dayShifts.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                    No shifts scheduled.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dayShifts.map((shift) => (
                      <div
                        key={shift.id}
                        className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 shadow-sm"
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {shift.employee_name}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                {shift.role}
                              </p>
                            </div>

                            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-indigo-700">
                              {formatTime(shift.start_time)} –{" "}
                              {formatTime(shift.end_time)}
                            </span>
                          </div>

                          <p className="rounded-xl bg-white/70 px-3 py-2 text-xs font-medium text-slate-600">
                            Break:{" "}
                            {formatBreak(
                              shift.break_start_time,
                              shift.break_end_time
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
          <div className="min-w-[1200px]">
            <div className="grid grid-cols-[90px_repeat(7,1fr)] border-b border-slate-200 bg-slate-50">
              <div className="p-4 text-sm font-semibold text-slate-500">
                Time
              </div>

              {days.map((day) => (
                <div
                  key={day.isoDate}
                  className="border-l border-slate-200 p-4 text-sm"
                >
                  <p className="font-semibold text-slate-700">{day.name}</p>
                  <p className="text-xs text-slate-500">
                    {day.date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>

            {hours.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-[90px_repeat(7,1fr)] border-b border-slate-100 last:border-b-0"
              >
                <div className="bg-slate-50 p-4 text-sm font-medium text-slate-500">
                  {formatHour(hour)}
                </div>

                {days.map((day) => {
                  const dayShifts = shifts.filter(
                    (shift) =>
                      shift.shift_date === day.isoDate &&
                      shift.start_time.slice(0, 2) === hour
                  );

                  return (
                    <div
                      key={`${day.isoDate}-${hour}`}
                      className="min-h-24 border-l border-slate-100 p-3"
                    >
                      <div className="space-y-2">
                        {dayShifts.map((shift) => (
                          <div
                            key={shift.id}
                            className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 shadow-sm"
                          >
                            <p className="text-sm font-semibold text-slate-900">
                              {shift.employee_name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {shift.role}
                            </p>

                            <p className="mt-3 rounded-full bg-white px-3 py-1 text-xs font-medium text-indigo-700">
                              {formatTime(shift.start_time)} –{" "}
                              {formatTime(shift.end_time)}
                            </p>

                            <p className="mt-2 rounded-xl bg-white/70 px-3 py-2 text-xs font-medium text-slate-600">
                              Break:{" "}
                              {formatBreak(
                                shift.break_start_time,
                                shift.break_end_time
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}