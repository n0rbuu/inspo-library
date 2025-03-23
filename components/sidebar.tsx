"use client"

import { useInspoStore } from "@/store/inspo-store"
import { cn } from "@/lib/utils"
import { useMemo, useState, useEffect } from "react"
import { BookOpen, LogOut, Tag, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { Separator } from "@/components/ui/separator"

export function Sidebar() {
  const { tags, setTagFilter, activeFilter } = useInspoStore()
  const pathname = usePathname()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  const isHome = useMemo(() => pathname === "/", [pathname])

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
      // On mobile, sidebar is closed by default
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    // Initial check
    checkIfMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      const supabase = getSupabaseBrowserClient()
      await supabase.auth.signOut()
      router.push("/auth")
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsSigningOut(false)
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <>
      {/* Mobile toggle button - fixed at the top left */}
      <div className="md:hidden fixed top-4 left-4 z-30">
        <Button variant="outline" size="icon" onClick={toggleSidebar} aria-label="Toggle sidebar">
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "h-screen bg-muted/40 border-r flex flex-col fixed md:sticky top-0 left-0 z-20 transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full md:w-16 md:translate-x-0",
          "md:transition-width",
        )}
      >
        <div className="p-4 border-b flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 flex-shrink-0" />
            <h1
              className={cn(
                "text-lg font-bold transition-opacity duration-200",
                !isSidebarOpen && "md:opacity-0 md:w-0 md:hidden",
              )}
            >
              Inspo Library
            </h1>
          </div>

          {/* Desktop toggle button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden md:flex"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        <div className={cn("px-4 py-3 border-b flex-1", !isSidebarOpen && "md:px-2")}>
          <h2 className={cn("text-sm font-medium mb-2 flex items-center gap-2", !isSidebarOpen && "md:justify-center")}>
            <Tag className="h-4 w-4 flex-shrink-0" />
            <span className={cn("transition-opacity duration-200", !isSidebarOpen && "md:opacity-0 md:w-0 md:hidden")}>
              Tags
            </span>
          </h2>
          <Button
            variant={!activeFilter.tag && isHome ? "default" : "ghost"}
            size="sm"
            className={cn(
              "w-full justify-start text-sm mb-1",
              !activeFilter.tag && "font-medium",
              !isSidebarOpen && "md:justify-center md:px-0",
            )}
            onClick={() => setTagFilter(undefined)}
          >
            <span className={cn(!isSidebarOpen && "md:sr-only")}>All</span>
          </Button>
          {tags.length > 0 ? (
            tags.map((tag) => (
              <Button
                key={tag}
                variant={activeFilter.tag === tag ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-start text-sm mb-1",
                  activeFilter.tag === tag && "font-medium",
                  !isSidebarOpen && "md:justify-center md:px-0",
                )}
                onClick={() => setTagFilter(tag)}
              >
                <span className={cn(!isSidebarOpen && "md:sr-only")}>{tag}</span>
              </Button>
            ))
          ) : (
            <p className={cn("text-xs text-muted-foreground px-2 py-1", !isSidebarOpen && "md:hidden")}>
              No tags yet. Add tags when creating inspiration items.
            </p>
          )}
        </div>

        {/* Sign Out Button at the bottom */}
        <div className={cn("mt-auto p-4 border-t", !isSidebarOpen && "md:px-2")}>
          <Separator className="mb-4" />
          <Button
            variant="outline"
            size="sm"
            className={cn("w-full justify-start text-sm", !isSidebarOpen && "md:justify-center md:px-0")}
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <LogOut className={cn("mr-2 h-4 w-4", !isSidebarOpen && "md:mr-0")} />
            <span className={cn(!isSidebarOpen && "md:sr-only")}>Sign Out</span>
          </Button>
        </div>
      </div>
    </>
  )
}

