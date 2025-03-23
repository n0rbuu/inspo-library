"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { InspoItem } from "@/types/inspo"
import { useInspoStore } from "@/store/inspo-store"
import { v4 as uuidv4 } from "uuid"
import { Upload, X } from "lucide-react"
import { readFileAsBase64 } from "@/lib/local-storage"

type WizardStep = "basic" | "details"

export function AddInspoWizard() {
  const { isAddWizardOpen, closeAddWizard, addInspoItem } = useInspoStore()
  const [step, setStep] = useState<WizardStep>("basic")

  const [newInspo, setNewInspo] = useState<Partial<InspoItem>>({
    title: "",
    screenshots: [],
    urls: [],
    notes: "",
    tags: [],
  })

  const [tempTag, setTempTag] = useState("")
  const [tempUrl, setTempUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  // Handle form submit
  const handleSubmit = () => {
    if (newInspo.title && newInspo.screenshots?.length) {
      const now = new Date().toISOString()

      const fullItem: InspoItem = {
        id: uuidv4(),
        title: newInspo.title,
        screenshots: newInspo.screenshots,
        urls: newInspo.urls?.filter((url) => url.trim() !== "") || [],
        notes: newInspo.notes || "",
        tags: newInspo.tags?.filter((tag) => tag.trim() !== "") || [],
        createdAt: now,
        updatedAt: now,
      }

      addInspoItem(fullItem)
      closeAddWizard()
      resetForm()
    }
  }

  const resetForm = () => {
    setStep("basic")
    setNewInspo({
      title: "",
      screenshots: [],
      urls: [],
      notes: "",
      tags: [],
    })
    setTempTag("")
    setTempUrl("")
  }

  const addTag = () => {
    if (tempTag.trim() !== "" && !newInspo.tags?.includes(tempTag)) {
      setNewInspo({
        ...newInspo,
        tags: [...(newInspo.tags || []), tempTag.trim()],
      })
      setTempTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setNewInspo({
      ...newInspo,
      tags: newInspo.tags?.filter((tag) => tag !== tagToRemove),
    })
  }

  const addUrl = () => {
    if (tempUrl.trim() !== "" && !newInspo.urls?.includes(tempUrl)) {
      setNewInspo({
        ...newInspo,
        urls: [...(newInspo.urls || []), tempUrl.trim()],
      })
      setTempUrl("")
    }
  }

  const removeUrl = (urlToRemove: string) => {
    setNewInspo({
      ...newInspo,
      urls: newInspo.urls?.filter((url) => url !== urlToRemove),
    })
  }

  // Handle file upload and convert to base64
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true)
      try {
        const fileArray = Array.from(e.target.files)
        const base64Promises = fileArray.map((file) => readFileAsBase64(file))
        const base64Screenshots = await Promise.all(base64Promises)

        setNewInspo({
          ...newInspo,
          screenshots: [...(newInspo.screenshots || []), ...base64Screenshots],
        })
      } catch (error) {
        console.error("Error uploading files:", error)
      } finally {
        setIsUploading(false)
      }
    }
  }

  return (
    <Dialog open={isAddWizardOpen} onOpenChange={closeAddWizard}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{step === "basic" ? "Create New Inspo" : "Add Details"}</DialogTitle>
        </DialogHeader>

        {step === "basic" && (
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter a title for your inspiration"
                value={newInspo.title}
                onChange={(e) => setNewInspo({ ...newInspo, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Screenshots</Label>
              <div className="border border-dashed rounded-lg p-8 text-center">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm mb-2">Drag and drop files here, or click to browse</p>
                <Input
                  type="file"
                  className="hidden"
                  id="screenshot-upload"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => document.getElementById("screenshot-upload")?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Select Files"}
                </Button>
              </div>

              {newInspo.screenshots && newInspo.screenshots.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {newInspo.screenshots.map((screenshot, index) => (
                    <div key={index} className="relative aspect-video bg-muted rounded overflow-hidden">
                      <img
                        src={screenshot || "/placeholder.svg"}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() =>
                          setNewInspo({
                            ...newInspo,
                            screenshots: newInspo.screenshots.filter((_, i) => i !== index),
                          })
                        }
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === "details" && (
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="urls">URLs (Optional)</Label>
              <div className="flex space-x-2">
                <Input
                  id="urls"
                  placeholder="https://..."
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addUrl()}
                />
                <Button type="button" onClick={addUrl} size="sm">
                  Add
                </Button>
              </div>
              {newInspo.urls && newInspo.urls.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newInspo.urls.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                    >
                      {url.length > 30 ? url.substring(0, 27) + "..." : url}
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-2" onClick={() => removeUrl(url)}>
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add your notes about this inspiration"
                value={newInspo.notes}
                onChange={(e) => setNewInspo({ ...newInspo, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (Optional)</Label>
              <div className="flex space-x-2">
                <Input
                  id="tags"
                  placeholder="Add a tag"
                  value={tempTag}
                  onChange={(e) => setTempTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTag()}
                />
                <Button type="button" onClick={addTag} size="sm">
                  Add
                </Button>
              </div>
              {newInspo.tags && newInspo.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newInspo.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-2" onClick={() => removeTag(tag)}>
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between">
          {step === "details" && (
            <Button variant="outline" onClick={() => setStep("basic")}>
              Back
            </Button>
          )}

          <div>
            <Button variant="ghost" onClick={closeAddWizard} className="mr-2">
              Cancel
            </Button>

            {step === "basic" && (
              <Button onClick={() => setStep("details")} disabled={!newInspo.title || !newInspo.screenshots?.length}>
                Continue
              </Button>
            )}

            {step === "details" && <Button onClick={handleSubmit}>Save Inspo</Button>}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

