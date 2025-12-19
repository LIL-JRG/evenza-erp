import { DashboardStats } from "@/components/dashboard/dashboard-stats"

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <DashboardStats />
      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
    </div>
  )
}
