"use client"

import { Auth } from "@/components/auth"
import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function AuthPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        // If already authenticated, redirect to home
        router.push("/")
      } else {
        // Otherwise, show the auth form
        setLoading(false)
      }
    }

    checkUser()
  }, [router, supabase.auth])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <Auth />
      </div>
    </div>
  )
}

