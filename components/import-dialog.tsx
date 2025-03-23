"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useInspoStore } from "@/store/inspo-store"
import { Upload, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ImportDialog() {
  const { isImportDialogOpen, closeImportDialog, importData } = useInspoStore()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
      setError(null)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      setError("Please select a file to import")
      return
    }

    try {
      setIsImporting(true)
      setError(null)
      await importData(selectedFile)
      closeImportDialog()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error importing data")
    } finally {
      setIsImporting(false)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setError(null)
    closeImportDialog()
  }

  return (
    <Dialog open={isImportDialogOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Inspo Library</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="border border-dashed rounded-lg p-8 text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm mb-2">
              {selectedFile ? `Selected: ${selectedFile.name}` : "Select a JSON file to import"}
            </p>
            <input type="file" className="hidden" id="import-file" accept=".json" onChange={handleFileChange} />
            <Button variant="secondary" size="sm" onClick={() => document.getElementById("import-file")?.click()}>
              Select File
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            Note: Importing will add items to your current library. Duplicate items may be created if you import the
            same data multiple times.
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose} disabled={isImporting}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!selectedFile || isImporting}>
            {isImporting ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

