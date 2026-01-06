"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ExperienceLevel, Role } from "@prisma/client";

interface TeamMember {
  id: string;
  alias: string;
  avatarId: string;
  experienceLevel: ExperienceLevel;
  genderRole: string;
  capabilities: Role[];
  isActive: boolean;
}

import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function MembersPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [formData, setFormData] = useState({
    alias: "",
    avatarId: "🐺",
    experienceLevel: "INTERMEDIATE" as ExperienceLevel,
    genderRole: "",
    capabilities: [] as Role[],
  });

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    try {
      const res = await fetch("/api/members");
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (error) {
      console.error("Failed to load members:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleExportMapping() {
    setIsExporting(true);
    try {
      const doc = jsPDF();
      doc.setFontSize(18);
      doc.text("Pseudonym Conversion Table", 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("CONFIDENTIAL - FOR INTERNAL USE ONLY", 14, 28);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 34);

      const tableData = members.map(m => [m.avatarId, m.alias, "____________________"]);

      autoTable(doc, {
        startY: 40,
        head: [["Avatar", "Alias (System Name)", "Real Name (Fill Manually)"]],
        body: tableData,
        headStyles: { fillColor: [30, 41, 59] },
        styles: { fontSize: 10, cellPadding: 5 },
      });

      doc.save("ShiftAware_Pseudonym_Mapping_Template.pdf");
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to generate mapping template");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await loadMembers();
        setShowForm(false);
        setFormData({
          alias: "",
          avatarId: "🐺",
          experienceLevel: "INTERMEDIATE",
          genderRole: "",
          capabilities: [],
        });
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create member");
      }
    } catch (error) {
      console.error("Failed to create member:", error);
      alert("Failed to create member");
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-50">Team Members</h1>
        <div className="flex items-center space-x-3">
          <Button 
            variant="secondary" 
            onClick={handleExportMapping} 
            disabled={isExporting || members.length === 0}
            className="text-sm"
          >
            {isExporting ? "Generating..." : "Export Mapping Template"}
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Add Member"}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Alias"
              value={formData.alias}
              onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
              required
            />
            <Input
              label="Avatar (Emoji)"
              value={formData.avatarId}
              onChange={(e) => setFormData({ ...formData, avatarId: e.target.value })}
              required
            />
            <Select
              label="Experience Level"
              value={formData.experienceLevel}
              onChange={(e) =>
                setFormData({ ...formData, experienceLevel: e.target.value as ExperienceLevel })
              }
            >
              <option value="JUNIOR">Junior</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="SENIOR">Senior</option>
            </Select>
            <Input
              label="Gender Role"
              value={formData.genderRole}
              onChange={(e) => setFormData({ ...formData, genderRole: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Capabilities
              </label>
              <div className="space-y-2">
                {Object.values(Role).map((role) => (
                  <label key={role} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.capabilities.includes(role)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            capabilities: [...formData.capabilities, role],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            capabilities: formData.capabilities.filter((r) => r !== role),
                          });
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-slate-300">{role.replace("_", " ")}</span>
                  </label>
                ))}
              </div>
            </div>
            <Button type="submit">Create Member</Button>
          </form>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <Card key={member.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{member.avatarId}</span>
                  <h3 className="text-lg font-semibold text-slate-50">{member.alias}</h3>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  {member.experienceLevel} • {member.genderRole}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {member.capabilities.join(", ")}
                </p>
              </div>
              {!member.isActive && (
                <span className="text-xs text-red-400">Inactive</span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

