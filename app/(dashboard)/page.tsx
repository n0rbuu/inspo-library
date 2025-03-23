"use client"

import { useInspoStore } from "@/store/inspo-store"
import { Search } from "@/components/search"
import { InspoCard } from "@/components/inspo-card"
import { AddInspoButton } from "@/components/add-inspo-button"
import { EmptyState } from "@/components/empty-state"
import { useEffect } from "react"
import { DataActions } from "@/components/data-actions"
import { ImportDialog } from "@/components/import-dialog"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { filteredItems, clearFilters, items, loadItems, isLoading } = useInspoStore()

  // Load items from Supabase when component mounts
  useEffect(() => {
    loadItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reset filters when component mounts
  useEffect(() => {
    clearFilters()
  }, [clearFilters])

  return (
    <div className="container py-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Inspo Library</h1>
          <p className="text-muted-foreground">A collection of things that inspire you</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <DataActions />
          <AddInspoButton />
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 max-w-2xl">
        <Search />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Content */}
      {!isLoading && items.length === 0 ? (
        <EmptyState />
      ) : !isLoading && filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <InspoCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <h3 className="text-xl font-medium mb-2">No inspiration found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search or filters, or add a new Inspo</p>
            <AddInspoButton />
          </div>
        )
      )}

      {/* Import Dialog */}
      <ImportDialog />
    </div>
  )
}

