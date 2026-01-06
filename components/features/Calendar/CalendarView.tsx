"use client";

import React, { useState, useEffect } from "react";
import { DayPilot, DayPilotCalendar, DayPilotNavigator } from "@daypilot/daypilot-lite-react";
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

  const [config, setConfig] = useState<DayPilot.CalendarConfig>({
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
      const priority = args.data.tags?.priority || "CORE";
      
      // Color coding based on desirability or priority
      const colors = {
        1: "#ef4444", // red
        2: "#f97316", // orange
        3: "#eab308", // yellow
        4: "#84cc16", // lime
        5: "#22c55e", // green
      };

      if (showAssignments) {
        const isFull = assignments.length >= capacity;
        const isEmpty = assignments.length === 0;
        
        args.data.backColor = isFull ? "#064e3b" : (isEmpty ? "#450a0a" : "#1e293b");
        args.data.borderColor = isFull ? "#10b981" : (isEmpty ? "#ef4444" : "#3b82f6");
        
        let html = `<div style="padding: 2px;">`;
        html += `<div style="font-weight: bold; font-size: 11px;">${args.data.text}</div>`;
        html += `<div style="font-size: 10px; color: #94a3b8;">${assignments.length}/${capacity} filled</div>`;
        
        if (assignments.length > 0) {
          html += `<div style="margin-top: 4px; display: flex; flex-wrap: wrap; gap: 2px;">`;
          assignments.forEach((a: any) => {
            html += `<span title="${a.teamMember.alias}" style="background: #334155; padding: 1px 4px; border-radius: 2px; font-size: 9px;">${a.teamMember.avatarId} ${a.teamMember.alias}</span>`;
          });
          html += `</div>`;
        }
        html += `</div>`;
        args.data.html = html;
      } else {
        args.data.backColor = isSelected ? "#38bdf8" : (colors[desirability as keyof typeof colors] + "33");
        args.data.borderColor = isSelected ? "#0ea5e9" : colors[desirability as keyof typeof colors];
        args.data.fontColor = isSelected ? "#ffffff" : "#e2e8f0";
        
        if (isSelected) {
          args.data.html = `<b>SELECTED</b><br/>${args.data.text}`;
        }
      }
    },
  });

  useEffect(() => {
    if (calendar) {
      calendar.update({ 
        startDate,
        viewType: viewType === "Day" ? "Day" : "Week"
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
    },
  }));

  return (
    <div className="calendar-container">
      <DayPilotCalendar
        {...config}
        events={events}
        controlRef={setCalendar}
      />
    </div>
  );
};

export default CalendarView;

