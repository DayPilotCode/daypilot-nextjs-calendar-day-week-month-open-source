"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import CalendarView from "@/components/features/Calendar/CalendarView";
import { format } from "date-fns";

import { exportScheduleToPDF } from "@/lib/services/export";

interface Shift {
  id: string;
  type: string;
  startTime: string;
  endTime: string;
  priority: string;
  capacity: number;
  assignments: any[];
  event: { name: string; id: string };
}

export default function SchedulePage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<"Day" | "Week">("Week");
  const [currentEventDate, setCurrentEventDate] = useState<string>();
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadSchedule();
  }, []);

  async function loadSchedule() {
    try {
      const res = await fetch("/api/shifts");
      if (res.ok) {
        const data = await res.json();
        setShifts(data);
        if (data.length > 0) {
          setCurrentEventDate(data[0].startTime.split("T")[0]);
        }
      }
    } catch (error) {
      console.error("Failed to load schedule:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleExport() {
    setIsExporting(true);
    try {
      exportScheduleToPDF(shifts);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to generate PDF");
    } finally {
      setIsExporting(false);
    }
  }

  function handleAssignmentClick(data: any) {
    const shift = shifts.find(s => s.id === data.id);
    setSelectedShift(shift);
  }

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-50">Shift Schedule</h1>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewType === "Day" ? "primary" : "secondary"}
            onClick={() => setViewType("Day")}
            className="text-xs px-3 py-1"
          >
            Day
          </Button>
          <Button
            variant={viewType === "Week" ? "primary" : "secondary"}
            onClick={() => setViewType("Week")}
            className="text-xs px-3 py-1"
          >
            Week
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={isExporting || shifts.length === 0}
            className="text-xs px-3 py-1 ml-4"
          >
            {isExporting ? "Exporting..." : "Export PDF"}
          </Button>
          <Button onClick={loadSchedule} className="text-xs px-3 py-1">
            Refresh
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden h-[750px] flex flex-col">
        <CalendarView
          shifts={shifts}
          viewType={viewType}
          startDate={currentEventDate}
          showAssignments={true}
          onAssignmentClick={handleAssignmentClick}
        />
      </Card>

      {selectedShift && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-50">{selectedShift.type.replace("_", " ")}</h2>
                <p className="text-sm text-slate-400">
                  {format(new Date(selectedShift.startTime), "EEEE, MMM d, HH:mm")} - {format(new Date(selectedShift.endTime), "HH:mm")}
                </p>
              </div>
              <button onClick={() => setSelectedShift(null)} className="text-slate-500 hover:text-slate-300">
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Assignments ({selectedShift.assignments?.length || 0} / {selectedShift.capacity})</h3>
                <div className="space-y-2">
                  {selectedShift.assignments?.length > 0 ? (
                    selectedShift.assignments.map((a: any) => (
                      <div key={a.id} className="p-3 rounded-lg border border-shift-border bg-shift-surface flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{a.teamMember.avatarId}</span>
                          <div>
                            <p className="font-bold text-slate-200 text-sm">{a.teamMember.alias}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{a.assignmentType} • {a.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {a.algorithmScore && (
                            <div className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                              <span className="text-emerald-400 text-[10px] font-bold">{(a.algorithmScore.overall * 100).toFixed(0)} pts</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 italic text-sm py-4 text-center">No members assigned to this shift yet.</p>
                  )}
                </div>
              </div>

              {selectedShift.assignments?.some((a: any) => a.notes) && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Algorithm Rationale</h3>
                  <div className="space-y-2">
                    {selectedShift.assignments.filter((a: any) => a.notes).map((a: any) => (
                      <div key={`note-${a.id}`} className="text-[11px] text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800">
                        <span className="font-bold text-slate-300">{a.teamMember.alias}:</span> {a.notes}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setSelectedShift(null)} className="text-xs">Close</Button>
              <Button variant="primary" className="text-xs">Manual Adjustment</Button>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-xs text-slate-400">Fully Staffed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-xs text-slate-400">Partially Staffed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-xs text-slate-400">Unstaffed</span>
        </div>
      </div>
    </div>
  );
}

