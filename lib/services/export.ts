import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export function exportScheduleToPDF(shifts: any[]) {
  const doc = jsPDF();
  const eventName = shifts[0]?.event?.name || "ShiftAware Schedule";
  const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss");

  // Title
  doc.setFontSize(18);
  doc.text(eventName, 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${timestamp}`, 14, 28);

  // Table Data
  const tableData = shifts
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .map((shift) => {
      const startTime = format(new Date(shift.startTime), "MMM d, HH:mm");
      const endTime = format(new Date(shift.endTime), "HH:mm");
      const assignments = shift.assignments
        ?.map((a: any) => `${a.teamMember.avatarId} ${a.teamMember.alias}`)
        .join(", ") || "None";

      return [
        startTime,
        endTime,
        shift.type.replace("_", " "),
        assignments,
        `${shift.assignments?.length || 0}/${shift.capacity}`
      ];
    });

  autoTable(doc, {
    startY: 35,
    head: [["Start", "End", "Shift Type", "Assignments", "Staffing"]],
    body: tableData,
    headStyles: { fillColor: [15, 23, 42] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { top: 35 },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount} - Privacy-first shift management`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  doc.save(`${eventName.replace(/\s+/g, "_")}_Schedule_${format(new Date(), "yyyyMMdd")}.pdf`);
}

