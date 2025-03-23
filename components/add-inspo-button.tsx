"use client"

import { Button } from "@/components/ui/button"
import { ImagePlus } from "lucide-react"
import { useInspoStore } from "@/store/inspo-store"

export function AddInspoButton() {
  const { openAddWizard } = useInspoStore()

  return (
    <Button onClick={openAddWizard} className="gap-2">
      <ImagePlus className="h-4 w-4" />
      Add Inspo
    </Button>
  )
}

