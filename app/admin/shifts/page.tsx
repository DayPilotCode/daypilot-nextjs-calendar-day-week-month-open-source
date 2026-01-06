"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ShiftType, ShiftPriority } from "@prisma/client";
import { format } from "date-fns";

interface Shift {
  id: string;
  type: ShiftType;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  priority: ShiftPriority;
  desirabilityScore: number;
  capacity: number;
  event: { name: string };
}

interface Event {
  id: string;
  name: string;
}

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    eventId: "",
    type: "MOBILE_TEAM_1" as ShiftType,
    startTime: "",
    endTime: "",
    durationMinutes: 360,
    priority: "CORE" as ShiftPriority,
    desirabilityScore: 3,
    capacity: 2,
    requiredRoles: [{ role: "TEAM_MEMBER", count: 1 }],
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [shiftsRes, eventsRes] = await Promise.all([
        fetch("/api/shifts"),
        fetch("/api/events"),
      ]);

      if (shiftsRes.ok) {
        const shiftsData = await shiftsRes.json();
        setShifts(shiftsData);
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData);
        if (eventsData.length > 0 && !formData.eventId) {
          setFormData({ ...formData, eventId: eventsData[0].id });
        }
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await loadData();
        setShowForm(false);
        alert("Shift created successfully");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create shift");
      }
    } catch (error) {
      console.error("Failed to create shift:", error);
      alert("Failed to create shift");
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-50">Shifts</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Create Shift"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Event"
              value={formData.eventId}
              onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
              required
            >
              <option value="">Select event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </Select>
            <Select
              label="Shift Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ShiftType })}
            >
              <option value="MOBILE_TEAM_1">Mobile Team 1</option>
              <option value="MOBILE_TEAM_2">Mobile Team 2</option>
              <option value="STATIONARY">Stationary</option>
              <option value="EXECUTIVE">Executive</option>
            </Select>
            <Input
              label="Start Time"
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => {
                const start = new Date(e.target.value);
                const end = new Date(start.getTime() + formData.durationMinutes * 60000);
                setFormData({
                  ...formData,
                  startTime: e.target.value,
                  endTime: end.toISOString().slice(0, 16),
                });
              }}
              required
            />
            <Input
              label="End Time"
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => {
                const start = new Date(formData.startTime);
                const end = new Date(e.target.value);
                const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
                setFormData({
                  ...formData,
                  endTime: e.target.value,
                  durationMinutes: minutes,
                });
              }}
              required
            />
            <Select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as ShiftPriority })}
            >
              <option value="CORE">Core</option>
              <option value="BUFFER">Buffer</option>
            </Select>
            <Input
              label="Desirability Score (1-5)"
              type="number"
              min="1"
              max="5"
              value={formData.desirabilityScore}
              onChange={(e) => setFormData({ ...formData, desirabilityScore: parseInt(e.target.value) })}
              required
            />
            <Input
              label="Capacity"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              required
            />
            <Button type="submit">Create Shift</Button>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {shifts.map((shift) => (
          <Card key={shift.id}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-50">
                  {shift.type.replace("_", " ")} - {shift.event.name}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {format(new Date(shift.startTime), "MMM d, yyyy HH:mm")} -{" "}
                  {format(new Date(shift.endTime), "HH:mm")}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {shift.priority} • Score: {shift.desirabilityScore} • Capacity: {shift.capacity}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

