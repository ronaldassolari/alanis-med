import { auth } from "@/lib/auth"
import { handleSignOut } from "@/app/actions/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = session.user

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar user={user} signOutAction={handleSignOut} />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  )
}
