"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DayPilot, DayPilotCalendar } from "@daypilot/daypilot-lite-react";
import { format, isSameDay } from "date-fns";
import "./CalendarView.css";

interface CalendarViewProps {
  shifts: any[];
  onShiftClick?: (shiftId: string) => void;
  onAssignmentClick?: (assignment: any) => void;
  selectedShiftIds?: Set<string>;
  viewType?: "Day" | "Week" | "Grid";
  startDate?: string;
  showAssignments?: boolean;
}

type CoverageState = "full" | "partial" | "empty";

const coverageStyles: Record<CoverageState, { badge: string; text: string; border: string; bg: string }> = {
  full: { badge: "bg-success-500", text: "text-success-700", border: "border-success-100", bg: "bg-success-50" },
  partial: { badge: "bg-accent-500", text: "text-accent-700", border: "border-accent-100", bg: "bg-accent-50" },
  empty: { badge: "bg-red-500", text: "text-red-700", border: "border-red-100", bg: "bg-red-50" },
};

const CalendarView = ({
  shifts,
  onShiftClick,
  onAssignmentClick,
  selectedShiftIds = new Set(),
  viewType = "Week",
  startDate,
  showAssignments = false,
}: CalendarViewProps) => {
  const [calendar, setCalendar] = useState<DayPilot.Calendar>();

  const [config] = useState<DayPilot.CalendarConfig>({
    viewType: viewType === "Day" ? "Day" : "Week",
    headerHeight: 40,
    cellHeight: 40,
    durationBarVisible: false,
    timeRangeSelectedHandling: "Disabled",
    eventMoveHandling: "Disabled",
    eventResizeHandling: "Disabled",
    onEventClick: (args) => {
      if (showAssignments && onAssignmentClick) {
        onAssignmentClick(args.e.data);
      } else if (onShiftClick) {
        onShiftClick(args.e.id() as string);
      }
    },
    onBeforeEventRender: (args) => {
      const isSelected = selectedShiftIds.has(args.data.id as string);
      const desirability = args.data.tags?.desirability || 3;
      const assignments = args.data.tags?.assignments || [];
      const capacity = args.data.tags?.capacity || 0;
      const type = args.data.tags?.type || "";
      
      // Starlight Meadow Palette
      const desirabilityColors = {
        1: "#ef4444", // red-500
        2: "#f59e0b", // accent-500
        3: "#eab308", // yellow-500
        4: "#84cc16", // lime-500
        5: "#22c55e", // success-500
      };

      const typeColors = {
        "MOBILE_TEAM_1": "#0ea5e9", // primary-500
        "MOBILE_TEAM_2": "#8b5cf6", // violet-500
        "STATIONARY": "#22c55e",    // success-500
        "EXECUTIVE": "#f59e0b",     // accent-500
        "BUFFER": "#78716c",        // gray-500
      };

      if (showAssignments) {
        const isFull = assignments.length >= capacity;
        const isEmpty = assignments.length === 0;
        const baseColor = typeColors[type as keyof typeof typeColors] || "#78716c";
        
        args.data.backColor = isFull ? baseColor : (isEmpty ? "#fee2e2" : "#fef3c7");
        args.data.borderColor = baseColor;
        args.data.fontColor = isFull ? "#ffffff" : "#1c1917";
        
        let html = `<div style="padding: 4px; height: 100%; border-left: 4px solid ${baseColor};">`;
        html += `<div style="font-weight: 800; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">${args.data.text}</div>`;
        html += `<div style="font-size: 10px; font-weight: 600; opacity: 0.8;">${assignments.length}/${capacity} filled</div>`;
        
        if (assignments.length > 0) {
          html += `<div style="margin-top: 6px; display: flex; flex-wrap: wrap; gap: 3px;">`;
          assignments.forEach((a: any) => {
            html += `<span title="${a.teamMember.alias}" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(0,0,0,0.05); padding: 1px 5px; border-radius: 4px; font-size: 9px; font-weight: 700;">${a.teamMember.avatarId} ${a.teamMember.alias}</span>`;
          });
          html += `</div>`;
        }
        html += `</div>`;
        args.data.html = html;
      } else {
        const color = desirabilityColors[desirability as keyof typeof desirabilityColors];
        args.data.backColor = isSelected ? "#0ea5e9" : "#ffffff";
        args.data.borderColor = isSelected ? "#0369a1" : color;
        args.data.fontColor = isSelected ? "#ffffff" : "#1c1917";
        
        if (isSelected) {
          args.data.html = `<div style="padding: 4px; font-weight: 800; text-align: center;">✓ SELECTED<br/><span style="font-size: 9px; opacity: 0.8;">${args.data.text}</span></div>`;
        } else {
          args.data.html = `<div style="padding: 4px; border-left: 4px solid ${color};">
            <div style="font-weight: 700; font-size: 10px;">${args.data.text}</div>
            <div style="font-size: 14px; margin-top: 2px;">${"★".repeat(desirability)}</div>
          </div>`;
        }
      }
    },
  });

  // Clear calendar reference when switching to Grid view to prevent disposal errors
  useEffect(() => {
    if (viewType === "Grid" && calendar) {
      setCalendar(undefined);
    }
  }, [viewType]);

  // Update calendar when view changes (but only if calendar exists and is not Grid view)
  useEffect(() => {
    if (calendar && viewType !== "Grid") {
      try {
        // Check if calendar instance is still valid before updating
        if (calendar && !(calendar as any).disposed) {
          calendar.update({ 
            startDate,
            viewType: viewType === "Day" ? "Day" : "Week",
            headerHeight: 60,
            cellHeight: 60,
          });
        }
      } catch (error) {
        // If calendar is disposed, clear the reference
        if (error instanceof Error && error.message.includes("disposed")) {
          console.warn("[CalendarView] Calendar instance was disposed, clearing reference");
          setCalendar(undefined);
        } else {
          throw error;
        }
      }
    }
  }, [calendar, startDate, viewType]);

  const events = shifts.map((shift) => ({
    id: shift.id,
    start: shift.startTime,
    end: shift.endTime,
    text: shift.type.replace("_", " "),
    tags: {
      desirability: shift.desirabilityScore,
      assignments: shift.assignments || [],
      capacity: shift.capacity,
      priority: shift.priority,
      type: shift.type,
    },
  }));

  const baseDate = useMemo(() => {
    if (startDate) return new Date(startDate);
    if (shifts.length > 0) return new Date(shifts[0].startTime);
    return new Date();
  }, [startDate, shifts]);

  const members = useMemo(() => {
    const memberMap = new Map<string, any>();
    shifts.forEach(shift => {
      shift.assignments?.forEach((a: any) => {
        if (a.teamMember) {
          memberMap.set(a.teamMember.id, a.teamMember);
        }
      });
    });
    return Array.from(memberMap.values()).sort((a, b) => a.alias.localeCompare(b.alias));
  }, [shifts]);

  const getCoverage = (shift: any): CoverageState => {
    const filled = shift.assignments?.length || 0;
    if (filled >= shift.capacity) return "full";
    if (filled > 0) return "partial";
    return "empty";
  };

  const renderGridView = () => {
    return (
      <div className="calendar-grid-view overflow-auto h-full bg-white">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-20 bg-gray-50 shadow-sm">
            <tr>
              <th className="p-4 text-left text-xs font-black uppercase tracking-widest text-gray-500 border-b border-r sticky left-0 bg-gray-50 z-30">
                Team Member
              </th>
              {shifts
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .map((shift) => (
                  <th key={shift.id} className="p-4 text-center border-b border-r min-w-[140px]">
                    <div className="text-[10px] font-black uppercase tracking-tighter text-gray-400 mb-1">
                      {format(new Date(shift.startTime), "MMM d")}
                    </div>
                    <div className="text-xs font-bold text-gray-700 whitespace-nowrap">
                      {format(new Date(shift.startTime), "HH:mm")} - {format(new Date(shift.endTime), "HH:mm")}
                    </div>
                    <div className="text-[9px] font-bold text-primary-500 mt-1">
                      {shift.type.replace("_", " ")}
                    </div>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 border-b border-r font-bold text-sm text-gray-900 sticky left-0 bg-white z-10 shadow-[2px_0_4px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{member.avatarId}</span>
                    <span>{member.alias}</span>
                  </div>
                </td>
                {shifts
                  .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                  .map((shift) => {
                    const isAssigned = shift.assignments?.some((a: any) => a.teamMember.id === member.id);
                    const status = getCoverage(shift);
                    const style = coverageStyles[status];
                    
                    return (
                      <td key={`${member.id}-${shift.id}`} className="p-2 border-b border-r text-center">
                        {isAssigned ? (
                          <div 
                            onClick={() => onAssignmentClick?.(shift)}
                            className={`mx-auto w-10 h-10 rounded-xl ${style.bg} ${style.border} border flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-sm`}
                          >
                            <span className="text-lg">✓</span>
                          </div>
                        ) : (
                          <div className="text-gray-100 text-xs font-black select-none">···</div>
                        )}
                      </td>
                    );
                  })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="calendar-container">
      {viewType === "Grid" ? (
        renderGridView()
      ) : (
        <DayPilotCalendar
          key={`daypilot-${viewType}-${startDate}`}
          {...config}
          events={events}
          controlRef={(ref) => {
            if (ref) {
              setCalendar(ref);
            }
          }}
        />
      )}
    </div>
  );
};

export default CalendarView;

