"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { format } from "date-fns";

interface CoverageGap {
  id: string;
  type: string;
  startTime: string;
  endTime: string;
  priority: string;
  capacity: number;
  currentCount: number;
  event: { name: string };
}

export default function CoverageDashboard() {
  const [gaps, setGaps] = useState<CoverageGap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGaps();
  }, []);

  async function loadGaps() {
    try {
      const res = await fetch("/api/shifts");
      if (res.ok) {
        const shifts = await res.json();
        const gapList = shifts
          .map((s: any) => ({
            id: s.id,
            type: s.type,
            startTime: s.startTime,
            endTime: s.endTime,
            priority: s.priority,
            capacity: s.capacity,
            currentCount: s.assignments?.length || 0,
            event: s.event,
          }))
          .filter((s: any) => s.currentCount < s.capacity);
        
        setGaps(gapList);
      }
    } catch (error) {
      console.error("Failed to load gaps:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  const criticalGaps = gaps.filter(g => g.currentCount === 0);
  const partialGaps = gaps.filter(g => g.currentCount > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-50">Coverage Gaps</h1>
        <Button onClick={loadGaps} className="text-sm">Refresh</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-red-500/50 bg-red-500/5">
          <h3 className="text-red-400 font-bold text-lg mb-1">{criticalGaps.length}</h3>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Unstaffed Shifts</p>
        </Card>
        <Card className="border-orange-500/50 bg-orange-500/5">
          <h3 className="text-orange-400 font-bold text-lg mb-1">{partialGaps.length}</h3>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Partially Staffed</p>
        </Card>
        <Card className="border-emerald-500/50 bg-emerald-500/5">
          <h3 className="text-emerald-400 font-bold text-lg mb-1">
            {gaps.length === 0 ? "100%" : `${Math.round(((gaps.length - criticalGaps.length) / gaps.length) * 100)}%`}
          </h3>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Overall Coverage</p>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Priority Attention Needed</h2>
        
        {gaps.length === 0 ? (
          <Card>
            <p className="text-slate-500 italic text-center py-8">No coverage gaps found! All shifts are fully staffed.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {gaps.sort((a, b) => a.currentCount - b.currentCount).map((gap) => (
              <Card key={gap.id} className={gap.currentCount === 0 ? "border-l-4 border-l-red-500" : "border-l-4 border-l-orange-500"}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${gap.currentCount === 0 ? "bg-red-500" : "bg-orange-500"}`}></span>
                      <h3 className="font-bold text-slate-100">{gap.type.replace("_", " ")}</h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {gap.event.name} • {format(new Date(gap.startTime), "MMM d, HH:mm")} - {format(new Date(gap.endTime), "HH:mm")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-200">
                      {gap.currentCount} / {gap.capacity}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase">Capacity</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

