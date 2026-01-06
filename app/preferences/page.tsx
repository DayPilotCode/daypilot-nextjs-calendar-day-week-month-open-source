"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { format } from "date-fns";

import CalendarView from "@/components/features/Calendar/CalendarView";

interface Shift {
  id: string;
  type: string;
  startTime: string;
  endTime: string;
  priority: string;
  desirabilityScore: number;
  event: { name: string; startDate: string };
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
  const [currentEventDate, setCurrentEventDate] = useState<string>();

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
        if (shiftsData.length > 0) {
          setCurrentEventDate(shiftsData[0].startTime.split("T")[0]);
        }
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
      // Re-index remaining priorities
      const remaining = Array.from(newSelected.entries())
        .sort((a, b) => a[1] - b[1])
        .map(([id], index) => [id, index + 1] as [string, number]);
      setSelectedShifts(new Map(remaining));
    } else {
      const priority = newSelected.size + 1;
      newSelected.set(shiftId, priority);
      setSelectedShifts(newSelected);
    }
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

  const selectedList = shifts
    .filter((s) => selectedShifts.has(s.id))
    .sort((a, b) => (selectedShifts.get(a.id) || 0) - (selectedShifts.get(b.id) || 0));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-50">Shift Preferences</h1>
        <div className="flex items-center space-x-4">
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="rounded-lg border border-shift-border bg-shift-surface px-4 py-2 text-slate-100 text-sm"
          >
            <option value="">Select member</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.alias}
              </option>
            ))}
          </select>
          <Button
            onClick={handleSubmit}
            disabled={selectedShifts.size < 2 || !selectedMember || submitting}
            className="text-sm"
          >
            {submitting ? "Submitting..." : "Submit Selection"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[700px]">
        <div className="lg:col-span-3 flex flex-col">
          <Card className="flex-grow p-0 overflow-hidden">
            <CalendarView
              shifts={shifts}
              onShiftClick={toggleShift}
              selectedShiftIds={new Set(selectedShifts.keys())}
              startDate={currentEventDate}
            />
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-4 overflow-y-auto">
          <Card className="h-full flex flex-col">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Your Selection ({selectedShifts.size})
            </h2>
            
            {selectedList.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                <p className="text-slate-500 text-sm italic">
                  Click shifts on the calendar to select them
                </p>
              </div>
            ) : (
              <div className="flex-grow space-y-3">
                {selectedList.map((shift) => (
                  <div
                    key={shift.id}
                    className="p-3 rounded-lg border border-shift-border bg-shift-surface/50 group hover:border-shift-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-xs">
                        <p className="font-bold text-slate-200">
                          {shift.type.replace("_", " ")}
                        </p>
                        <p className="text-slate-400">
                          {format(new Date(shift.startTime), "MMM d, HH:mm")}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-shift-accent">
                        #{selectedShifts.get(shift.id)}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleShift(shift.id)}
                      className="mt-2 text-[10px] text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-shift-border">
              <p className="text-[10px] text-slate-500 italic">
                * Select at least 2 core shifts
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


