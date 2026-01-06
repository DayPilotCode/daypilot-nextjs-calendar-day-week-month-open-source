"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DayPilot, DayPilotCalendar } from "@daypilot/daypilot-lite-react";
import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, startOfMonth, startOfWeek } from "date-fns";
import "./CalendarView.css";

interface CalendarViewProps {
  shifts: any[];
  onShiftClick?: (shiftId: string) => void;
  onAssignmentClick?: (assignment: any) => void;
  selectedShiftIds?: Set<string>;
  viewType?: "Day" | "Week" | "Month";
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

  useEffect(() => {
    if (calendar && viewType !== "Month") {
      calendar.update({ 
        startDate,
        viewType: viewType === "Day" ? "Day" : "Week",
        headerHeight: 60,
        cellHeight: 60,
      });
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

  const monthDays = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(baseDate), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(baseDate), { weekStartsOn: 1 }),
      }),
    [baseDate]
  );

  const monthRows = useMemo(() => {
    return monthDays.map((day) => {
      const dayShifts = shifts.filter((shift) => isSameDay(new Date(shift.startTime), day));
      return { day, shifts: dayShifts };
    });
  }, [monthDays, shifts]);

  const getCoverage = (shift: any): CoverageState => {
    const filled = shift.assignments?.length || 0;
    if (filled >= shift.capacity) return "full";
    if (filled > 0) return "partial";
    return "empty";
  };

  const renderMonthView = () => (
    <div className="calendar-month-grid">
      {monthRows.map(({ day, shifts: dayShifts }) => {
        const isCurrentMonth = day.getMonth() === baseDate.getMonth();
        return (
          <div key={day.toISOString()} className={`month-cell ${isCurrentMonth ? "" : "muted"}`}>
            <div className="month-cell-header">
              <span className="month-cell-day">{format(day, "d")}</span>
              <span className="month-cell-weekday">{format(day, "EEE")}</span>
            </div>
            <div className="month-cell-body">
              {dayShifts.length === 0 ? (
                <div className="empty-slot">No shifts</div>
              ) : (
                dayShifts.map((shift) => {
                  const status = getCoverage(shift);
                  const style = coverageStyles[status];
                  const filled = shift.assignments?.length || 0;
                  return (
                    <button
                      key={shift.id}
                      onClick={() => {
                        if (showAssignments && onAssignmentClick) {
                          onAssignmentClick(shift);
                        } else if (onShiftClick) {
                          onShiftClick(shift.id);
                        }
                      }}
                      className={`month-shift ${style.bg} ${style.border}`}
                    >
                      <div className="month-shift-top">
                        <span className="month-shift-type">{shift.type.replace("_", " ")}</span>
                        <span className={`month-shift-badge ${style.badge}`}></span>
                      </div>
                      <div className="month-shift-time">{format(new Date(shift.startTime), "HH:mm")} - {format(new Date(shift.endTime), "HH:mm")}</div>
                      <div className={`month-shift-fill ${style.text}`}>{filled}/{shift.capacity} filled</div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="calendar-container">
      {viewType === "Month" ? (
        renderMonthView()
      ) : (
        <DayPilotCalendar
          {...config}
          events={events}
          controlRef={setCalendar}
        />
      )}
    </div>
  );
};

export default CalendarView;

