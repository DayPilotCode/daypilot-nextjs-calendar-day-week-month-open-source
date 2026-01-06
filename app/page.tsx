import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function Home() {
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-semibold text-slate-50 mb-4">ShiftAware</h2>
        <p className="text-slate-300 mb-4">
          Phase 1 is complete! You can now manage team members, configure shifts, enter preferences, and run the assignment algorithm.
        </p>
        <div className="flex gap-4">
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
          <Link href="/preferences">
            <Button variant="secondary">Enter Preferences</Button>
          </Link>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold text-slate-50 mb-2">Quick Links</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>
              <Link href="/admin/members" className="text-shift-accent hover:underline">
                Manage Team Members
              </Link>
            </li>
            <li>
              <Link href="/admin/shifts" className="text-shift-accent hover:underline">
                Configure Shifts
              </Link>
            </li>
            <li>
              <Link href="/preferences" className="text-shift-accent hover:underline">
                Enter Shift Preferences
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="text-shift-accent hover:underline">
                Run Assignment Algorithm
              </Link>
            </li>
          </ul>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-50 mb-2">Status</h3>
          <ul className="space-y-1 text-sm text-slate-400">
            <li>✓ Authentication enabled</li>
            <li>✓ Database configured</li>
            <li>✓ Team member management</li>
            <li>✓ Shift configuration</li>
            <li>✓ Preference entry</li>
            <li>✓ Assignment algorithm</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
