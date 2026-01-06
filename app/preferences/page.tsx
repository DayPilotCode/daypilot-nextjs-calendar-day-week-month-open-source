"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { format } from "date-fns";

interface Shift {
  id: string;
  type: string;
  startTime: string;
  endTime: string;
  priority: string;
  desirabilityScore: number;
  event: { name: string };
}

interface Preference {
  shiftId: string;
  priority: number;
}

export default function PreferencesPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedShifts, setSelectedShifts] = useState<Map<string, number>>(new Map());
  const [members, setMembers] = useState<{ id: string; alias: string }[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [shiftsRes, membersRes] = await Promise.all([
        fetch("/api/shifts"),
        fetch("/api/members"),
      ]);

      if (shiftsRes.ok) {
        const shiftsData = await shiftsRes.json();
        setShifts(shiftsData);
      }

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData);
        if (membersData.length > 0) {
          setSelectedMember(membersData[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }

  function toggleShift(shiftId: string) {
    const newSelected = new Map(selectedShifts);
    if (newSelected.has(shiftId)) {
      newSelected.delete(shiftId);
    } else {
      const priority = newSelected.size + 1;
      newSelected.set(shiftId, priority);
    }
    setSelectedShifts(newSelected);
  }

  function updatePriority(shiftId: string, priority: number) {
    const newSelected = new Map(selectedShifts);
    newSelected.set(shiftId, priority);
    setSelectedShifts(newSelected);
  }

  async function handleSubmit() {
    if (!selectedMember) {
      alert("Please select a team member");
      return;
    }

    if (selectedShifts.size < 2) {
      alert("Please select at least 2 shifts");
      return;
    }

    setSubmitting(true);
    try {
      const preferences = Array.from(selectedShifts.entries()).map(([shiftId, priority]) => ({
        shiftId,
        priority,
      }));

      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamMemberId: selectedMember,
          preferences,
        }),
      });

      if (res.ok) {
        alert("Preferences submitted successfully!");
        setSelectedShifts(new Map());
      } else {
        const error = await res.json();
        alert(error.error || "Failed to submit preferences");
      }
    } catch (error) {
      console.error("Failed to submit preferences:", error);
      alert("Failed to submit preferences");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  const sortedShifts = [...shifts].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-50">Shift Preferences</h1>

      <Card>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Team Member
            </label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full rounded-lg border border-shift-border bg-shift-surface px-4 py-2 text-slate-100"
            >
              <option value="">Select member</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.alias}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedShifts.map((shift) => {
              const isSelected = selectedShifts.has(shift.id);
              const priority = selectedShifts.get(shift.id);

              return (
                <div
                  key={shift.id}
                  onClick={() => toggleShift(shift.id)}
                  className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                    isSelected
                      ? "border-shift-accent bg-shift-accent/10"
                      : "border-shift-border bg-shift-surface hover:border-shift-accent/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-50">
                        {shift.type.replace("_", " ")}
                      </h3>
                      <p className="text-sm text-slate-400 mt-1">
                        {format(new Date(shift.startTime), "MMM d, HH:mm")} -{" "}
                        {format(new Date(shift.endTime), "HH:mm")}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {shift.event.name} • Score: {shift.desirabilityScore}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="text-shift-accent font-bold">
                        #{priority}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <div className="mt-3">
                      <label className="block text-xs text-slate-400 mb-1">
                        Priority (1-5)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={priority}
                        onChange={(e) =>
                          updatePriority(shift.id, parseInt(e.target.value))
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="w-full rounded border border-shift-border bg-shift-surface px-2 py-1 text-sm text-slate-100"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-shift-border">
            <p className="text-sm text-slate-400">
              Selected: {selectedShifts.size} shifts (minimum 2 required)
            </p>
            <Button
              onClick={handleSubmit}
              disabled={selectedShifts.size < 2 || !selectedMember || submitting}
            >
              {submitting ? "Submitting..." : "Submit Preferences"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

