"use client"

import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { AddInspoWizard } from "@/components/add-inspo-wizard"
import { ImportDialog } from "@/components/import-dialog"
import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user || null)
      setLoading(false)

      if (!data.session) {
        router.push("/auth")
      }
    }

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)

      if (!session) {
        router.push("/auth")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase.auth])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to auth page
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto md:ml-0 pt-16 md:pt-0">{children}</div>
      <AddInspoWizard />
      <ImportDialog />
    </div>
  )
}

