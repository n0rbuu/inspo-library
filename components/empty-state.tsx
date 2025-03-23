"use client"

import { Button } from "@/components/ui/button"
import { ImagePlus } from "lucide-react"
import { useInspoStore } from "@/store/inspo-store"

export function EmptyState() {
  const { openAddWizard } = useInspoStore()

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-primary/10 p-12 rounded-lg mb-6">
        <ImagePlus className="h-16 w-16 text-primary" />
      </div>

      <h2 className="text-2xl font-bold mb-3">Your Inspo Library is empty</h2>

      <p className="text-muted-foreground max-w-md mb-8">
        Start collecting inspiration by adding screenshots, links, and notes about designs and ideas you love.
      </p>

      <Button onClick={openAddWizard} size="lg" className="gap-2">
        Add Your Inspiration
      </Button>
    </div>
  )
}

