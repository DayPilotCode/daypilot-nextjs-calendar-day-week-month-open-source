"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

interface Event {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  _count: { shifts: number };
}

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningAlgorithm, setRunningAlgorithm] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
    }
  }

  async function runAlgorithm(eventId: string) {
    if (!confirm("This will replace all existing assignments for this event. Continue?")) {
      return;
    }

    setRunningAlgorithm(true);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.violations && result.violations.length > 0) {
          alert(`Algorithm completed with warnings:\n${result.violations.join("\n")}`);
        } else {
          alert(`Algorithm completed successfully! Created ${result.assignments.length} assignments.`);
        }
        await loadEvents();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to run algorithm");
      }
    } catch (error) {
      console.error("Failed to run algorithm:", error);
      alert("Failed to run algorithm");
    } finally {
      setRunningAlgorithm(false);
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-50">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <Link href="/admin/members" className="block">
            <h3 className="text-lg font-semibold text-slate-50 mb-2">Team Members</h3>
            <p className="text-sm text-slate-400">Manage team member profiles</p>
          </Link>
        </Card>

        <Card>
          <Link href="/admin/shifts" className="block">
            <h3 className="text-lg font-semibold text-slate-50 mb-2">Shifts</h3>
            <p className="text-sm text-slate-400">Configure shifts and schedules</p>
          </Link>
        </Card>

        <Card>
          <Link href="/preferences" className="block">
            <h3 className="text-lg font-semibold text-slate-50 mb-2">Preferences</h3>
            <p className="text-sm text-slate-400">Enter shift preferences</p>
          </Link>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold text-slate-50 mb-4">Events</h2>
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between p-4 border border-shift-border rounded-lg"
            >
              <div>
                <h3 className="font-semibold text-slate-50">{event.name}</h3>
                <p className="text-sm text-slate-400">
                  {new Date(event.startDate).toLocaleDateString()} -{" "}
                  {new Date(event.endDate).toLocaleDateString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {event._count.shifts} shifts • Status: {event.status}
                </p>
              </div>
              <Button
                onClick={() => runAlgorithm(event.id)}
                disabled={runningAlgorithm}
              >
                {runningAlgorithm ? "Running..." : "Run Algorithm"}
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

