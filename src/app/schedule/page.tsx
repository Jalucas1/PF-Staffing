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
      date,
      isoDate: formatLocalDate(date),
    };
  });
}

function formatTime(time: string) {
  return time.slice(0, 5);
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
        subtitle="24-hour calendar view of all staff shifts."
      >
        {error && (
          <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
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

          <div className="flex gap-2">
            <button
              onClick={() => setWeekOffset((current) => current - 1)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Previous Week
            </button>

            <button
              onClick={() => setWeekOffset(0)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              This Week
            </button>

            <button
              onClick={() => setWeekOffset((current) => current + 1)}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Next Week
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
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
                  {hour}:00
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