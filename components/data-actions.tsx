"use client"

import { Button } from "@/components/ui/button"
import { useInspoStore } from "@/store/inspo-store"
import { ArrowUpDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Upload, Download } from "lucide-react"

export function DataActions() {
  const { exportData, openImportDialog } = useInspoStore()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <ArrowUpDown className="h-4 w-4" />
          <span className="sr-only">Import/Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={openImportDialog}>
          <Upload className="mr-2 h-4 w-4" />
          Import Library
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportData}>
          <Download className="mr-2 h-4 w-4" />
          Export Library
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

