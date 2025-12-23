import { Button } from "@/components/ui/button"

export function DashboardPreview() {
  return (
    <section className="relative pb-16">
      <div className="max-w-[1060px] mx-auto px-4">
        {/* Dashboard Interface Mockup */}
        <div
          className="relative rounded-lg shadow-lg overflow-hidden"
          style={{ backgroundColor: "white", borderColor: "var(--brand-border)", borderWidth: "1px" }}
        >
          {/* Dashboard Header */}
          <div
            className="flex items-center justify-between p-4"
            style={{ borderBottom: `1px solid var(--brand-border)` }}
          >
            <div className="flex items-center gap-3">
              <div className="font-semibold" style={{ color: "var(--brand-text-default)" }}>
                Brillance
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm" style={{ color: "var(--brand-text-secondary)" }}>
                Account
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: "var(--brand-primary)" }}></div>
            </div>
          </div>

          {/* Sidebar and Main Content */}
          <div className="flex">
            {/* Sidebar */}
            <div
              className="w-48 border-r p-4"
              style={{ backgroundColor: "var(--brand-surface-light)", borderColor: "var(--brand-border)" }}
            >
              <nav className="space-y-2">
                <div
                  className="text-xs font-medium uppercase tracking-wide mb-3"
                  style={{ color: "var(--brand-text-secondary)" }}
                >
                  Navigation
                </div>
                {["Home", "Customers", "Billing", "Schedules", "Invoices", "Products"].map((item) => (
                  <div
                    key={item}
                    className="text-sm py-1 hover:opacity-80 cursor-pointer transition-opacity"
                    style={{ color: "var(--brand-text-default)" }}
                  >
                    {item}
                  </div>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold" style={{ color: "var(--brand-text-default)" }}>
                  Schedules
                </h2>
                <Button className="text-sm text-white" style={{ backgroundColor: "var(--brand-primary)" }}>
                  Create schedule
                </Button>
              </div>

              {/* Table Mockup */}
              <div
                className="rounded-lg overflow-hidden"
                style={{ borderColor: "var(--brand-border)", borderWidth: "1px" }}
              >
                <div
                  className="grid grid-cols-6 gap-4 p-4 text-sm font-medium"
                  style={{
                    backgroundColor: "var(--brand-surface-light)",
                    borderBottom: `1px solid var(--brand-border)`,
                    color: "var(--brand-text-secondary)",
                  }}
                >
                  <div>Customer</div>
                  <div>Status</div>
                  <div>Products</div>
                  <div>Total</div>
                  <div>Start date</div>
                  <div>End date</div>
                </div>

                {/* Table Rows */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-6 gap-4 p-4 text-sm"
                    style={{ borderBottom: `1px solid var(--brand-border)` }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: "var(--brand-primary)" }}></div>
                      <span>Hypernise</span>
                    </div>
                    <div>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          i % 3 === 0
                            ? "bg-green-100 text-green-700"
                            : i % 3 === 1
                              ? "bg-purple-100 text-purple-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {i % 3 === 0 ? "Complete" : i % 3 === 1 ? "Active" : "Draft"}
                      </span>
                    </div>
                    <div style={{ color: "var(--brand-text-secondary)" }}>Platform access fee</div>
                    <div className="font-medium">$3,862.32</div>
                    <div style={{ color: "var(--brand-text-secondary)" }}>1 Aug 2024</div>
                    <div style={{ color: "var(--brand-text-secondary)" }}>10 Jun 2024</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
