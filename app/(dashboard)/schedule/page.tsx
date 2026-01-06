"use client";

import { useEffect, useState } from "react";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  RefreshCw,
  Filter,
  Info,
  User,
  ShieldCheck,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import CalendarView from "@/components/features/Calendar/CalendarView";
import { format } from "date-fns";
import { exportScheduleToPDF } from "@/lib/services/export";
import { cn } from "@/lib/utils";

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
    setLoading(true);
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

  if (loading && shifts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Shift Schedule</h1>
          <p className="text-gray-500 font-medium">Global view of all staff assignments</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white border border-gray-200 rounded-xl p-1 flex shadow-sm">
            <button
              onClick={() => setViewType("Day")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                viewType === "Day" ? "bg-primary-500 text-white shadow-md" : "text-gray-400 hover:text-gray-600"
              )}
            >
              Day
            </button>
            <button
              onClick={() => setViewType("Week")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                viewType === "Week" ? "bg-primary-500 text-white shadow-md" : "text-gray-400 hover:text-gray-600"
              )}
            >
              Week
            </button>
          </div>
          
          <Button 
            variant="secondary"
            onClick={handleExport} 
            disabled={isExporting || shifts.length === 0}
            className="flex items-center gap-2 bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </Button>
          
          <Button onClick={loadSchedule} variant="primary" className="shadow-lg shadow-primary-500/20">
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-3 p-4 bg-success-50 rounded-2xl border border-success-100">
          <div className="w-2 h-2 rounded-full bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
          <span className="text-xs font-bold text-success-700 uppercase tracking-widest">Fully Staffed</span>
        </div>
        <div className="flex items-center gap-3 p-4 bg-accent-50 rounded-2xl border border-accent-100">
          <div className="w-2 h-2 rounded-full bg-accent-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
          <span className="text-xs font-bold text-accent-700 uppercase tracking-widest">Partially Staffed</span>
        </div>
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-100">
          <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
          <span className="text-xs font-bold text-red-700 uppercase tracking-widest">Unstaffed</span>
        </div>
      </div>

      <Card className="p-0 border-none shadow-xl overflow-hidden h-[calc(100vh-340px)] min-h-[600px] flex flex-col bg-white">
        <CalendarView
          shifts={shifts}
          viewType={viewType}
          startDate={currentEventDate}
          showAssignments={true}
          onAssignmentClick={handleAssignmentClick}
        />
      </Card>

      {selectedShift && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="max-w-xl w-full bg-white border-none shadow-2xl rounded-[2rem] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-primary-600 p-8 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-widest">
                    Shift Details
                  </span>
                  <button onClick={() => setSelectedShift(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <ChevronRight className="w-5 h-5 rotate-90" />
                  </button>
                </div>
                <h2 className="text-3xl font-black leading-tight mb-2">{selectedShift.type.replace("_", " ")}</h2>
                <div className="flex items-center gap-4 text-primary-100 text-sm font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(selectedShift.startTime), "EEEE, MMM d")}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {format(new Date(selectedShift.startTime), "HH:mm")} - {format(new Date(selectedShift.endTime), "HH:mm")}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> 
                    Assignments ({selectedShift.assignments?.length || 0} / {selectedShift.capacity})
                  </h3>
                </div>
                <div className="grid gap-3">
                  {selectedShift.assignments?.length > 0 ? (
                    selectedShift.assignments.map((a: any) => (
                      <div key={a.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between group hover:border-primary-200 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl border border-gray-50 group-hover:scale-110 transition-transform">
                            {a.teamMember.avatarId}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 leading-none mb-1">{a.teamMember.alias}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-primary-600">{a.role}</span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">• {a.assignmentType}</span>
                            </div>
                          </div>
                        </div>
                        {a.algorithmScore && (
                          <div className="text-right">
                            <div className="px-3 py-1 rounded-lg bg-success-50 border border-success-100">
                              <span className="text-success-700 text-xs font-black">{(a.algorithmScore.overall * 100).toFixed(0)} pts</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                      <User className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm font-medium">No members assigned yet.</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedShift.assignments?.some((a: any) => a.notes) && (
                <div className="animate-in slide-in-from-top-2">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Algorithm Rationale
                  </h3>
                  <div className="grid gap-2">
                    {selectedShift.assignments.filter((a: any) => a.notes).map((a: any) => (
                      <div key={`note-${a.id}`} className="text-xs font-medium text-gray-600 bg-primary-50/50 p-4 rounded-2xl border border-primary-100 flex gap-3">
                        <span className="text-primary-600 font-black shrink-0">{a.teamMember.alias}:</span>
                        {a.notes}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-8 pb-8 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setSelectedShift(null)} className="bg-gray-100 text-gray-600 border-none hover:bg-gray-200 px-8 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs">
                Dismiss
              </Button>
              <Button variant="primary" className="shadow-lg shadow-primary-500/20 px-8 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs">
                Modify Slot
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
