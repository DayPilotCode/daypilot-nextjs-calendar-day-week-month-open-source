import { LucideLayout, LucidePalette, LucideSettings, LucideUser } from "lucide-react";

export default function SandboxPage() {
  return (
    /* The 2-Column Grid: Left is 280px, Right takes remaining space */
    <div className="grid grid-cols-[280px_1fr] min-h-screen bg-gray-50">
      
      {/* LEFT COLUMN: Sidebar */}
      <aside className="bg-white border-r border-gray-200 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg shadow-lg flex items-center justify-center text-white font-bold">S</div>
          <span className="font-bold text-xl text-gray-900 tracking-tight">ShiftAware</span>
        </div>

        <nav className="flex flex-col gap-2">
          <button className="flex items-center gap-3 px-3 py-2 bg-primary-50 text-primary-700 rounded-md font-medium">
            <LucidePalette className="w-5 h-5" /> Design Tokens
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
            <LucideLayout className="w-5 h-5" /> Layouts
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
            <LucideUser className="w-5 h-5" /> Members
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors mt-auto">
            <LucideSettings className="w-5 h-5" /> Settings
          </button>
        </nav>
      </aside>

      {/* RIGHT COLUMN: Big Pane */}
      <main className="p-10 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Color System Test</h1>
          <p className="text-gray-500 mt-2">Verifying OKLCH and Hex palettes in a sidebar layout.</p>
        </header>

        {/* Example of Aspect Ratio + Big Pane Content */}
        <div className="space-y-12">
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Visual Assets</h2>
            <div className="grid grid-cols-2 gap-6">
              {/* Aspect Ratio 3/2 */}
              <div className="aspect-[3/2] bg-primary-100 rounded-xl flex items-center justify-center text-primary-500 font-medium overflow-hidden border border-primary-200">
                3:2 Aspect Ratio (Primary-100)
              </div>
              {/* Aspect Ratio Square */}
              <div className="aspect-square bg-cyprus-100 rounded-xl flex items-center justify-center text-cyprus-600 font-medium border border-cyprus-200">
                1:1 Aspect Ratio (Cyprus-100)
              </div>
            </div>
          </section>

          {/* Color Verification Grid */}
          <section className="space-y-4">
            <h3 className="font-semibold text-gray-700">OKLCH Primary Palette</h3>
            <div className="flex gap-2">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((v) => (
                <div key={v} className={`h-16 flex-1 rounded-md bg-primary-${v} shadow-sm border border-black/5`} title={`primary-${v}`} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}