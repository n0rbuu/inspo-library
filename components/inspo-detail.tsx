"use client"

import type React from "react"

import type { InspoItem } from "@/types/inspo"
import { useState } from "react"
import { useInspoStore } from "@/store/inspo-store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import Link from "next/link"
import { ExternalLink, Save, X, Upload } from "lucide-react"
import { readFileAsBase64 } from "@/lib/local-storage"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface InspoDetailProps {
  item: InspoItem
}

export function InspoDetail({ item }: InspoDetailProps) {
  const { updateInspoItem, deleteInspoItem } = useInspoStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editedItem, setEditedItem] = useState<InspoItem>({ ...item })
  const [tempTag, setTempTag] = useState("")
  const [tempUrl, setTempUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)

  const handleSave = () => {
    updateInspoItem({
      ...editedItem,
      updatedAt: new Date().toISOString(),
    })
    setIsEditing(false)
  }

  const addTag = () => {
    if (tempTag.trim() && !editedItem.tags?.includes(tempTag.trim())) {
      setEditedItem({
        ...editedItem,
        tags: [...(editedItem.tags || []), tempTag.trim()],
      })
      setTempTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setEditedItem({
      ...editedItem,
      tags: editedItem.tags?.filter((tag) => tag !== tagToRemove),
    })
  }

  const addUrl = () => {
    if (tempUrl.trim() && !editedItem.urls?.includes(tempUrl.trim())) {
      setEditedItem({
        ...editedItem,
        urls: [...(editedItem.urls || []), tempUrl.trim()],
      })
      setTempUrl("")
    }
  }

  const removeUrl = (urlToRemove: string) => {
    setEditedItem({
      ...editedItem,
      urls: editedItem.urls?.filter((url) => url !== urlToRemove),
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

        setEditedItem({
          ...editedItem,
          screenshots: [...(editedItem.screenshots || []), ...base64Screenshots],
        })
      } catch (error) {
        console.error("Error uploading files:", error)
      } finally {
        setIsUploading(false)
      }
    }
  }

  const removeScreenshot = (index: number) => {
    setEditedItem({
      ...editedItem,
      screenshots: editedItem.screenshots.filter((_, i) => i !== index),
    })
  }

  return (
    <Card className="max-w-4xl mx-auto shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          {isEditing ? (
            <Input
              value={editedItem.title}
              onChange={(e) => setEditedItem({ ...editedItem, title: e.target.value })}
              className="text-xl font-bold"
            />
          ) : (
            <CardTitle className="text-2xl">{item.title}</CardTitle>
          )}
          <CardDescription>
            {isEditing ? (
              <span>Editing</span>
            ) : (
              <>
                Added {format(new Date(item.createdAt), "MMM d, yyyy")}
                {item.updatedAt !== item.createdAt && ` • Updated ${format(new Date(item.updatedAt), "MMM d, yyyy")}`}
              </>
            )}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setShowDeleteAlert(true)}>
                Delete
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Screenshots section - hidden since we're showing them in the page */}
        {isEditing ? (
          <div className="space-y-4">
            <div className="border border-dashed rounded-lg p-6 text-center">
              <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
              <p className="text-sm mb-2">Add more screenshots</p>
              <Input
                type="file"
                className="hidden"
                id="edit-screenshot-upload"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => document.getElementById("edit-screenshot-upload")?.click()}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Select Files"}
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {editedItem.screenshots.map((screenshot, index) => (
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
                    onClick={() => removeScreenshot(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : item.screenshots && item.screenshots.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {item.screenshots.map((screenshot, index) => (
              <div key={index} className="relative aspect-video bg-muted rounded overflow-hidden">
                <img
                  src={screenshot || "/placeholder.svg"}
                  alt={`Screenshot ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : null}

        {/* URLs */}
        {(item.urls?.length > 0 || isEditing) && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">URLs</h3>
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add URL"
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addUrl()}
                  />
                  <Button variant="outline" onClick={addUrl}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editedItem.urls?.map((url, index) => (
                    <div key={index} className="flex items-center bg-secondary rounded-full px-3 py-1">
                      <span className="text-sm truncate max-w-xs">{url}</span>
                      <Button variant="ghost" size="sm" className="ml-1 h-6 w-6 p-0" onClick={() => removeUrl(url)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {item.urls?.map((url, index) => (
                  <Link
                    key={index}
                    href={url}
                    target="_blank"
                    className="inline-flex items-center text-primary hover:underline text-sm"
                  >
                    {url.replace(/^https?:\/\//, "")}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Notes</h3>
          {isEditing ? (
            <Textarea
              placeholder="Add notes about this inspiration"
              value={editedItem.notes || ""}
              onChange={(e) => setEditedItem({ ...editedItem, notes: e.target.value })}
              rows={4}
            />
          ) : (
            <div className="text-sm">
              {item.notes || <span className="text-muted-foreground italic">No notes</span>}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full space-y-2">
          <h3 className="text-sm font-medium">Tags</h3>
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag"
                  value={tempTag}
                  onChange={(e) => setTempTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTag()}
                />
                <Button variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editedItem.tags?.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                    {tag}
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => removeTag(tag)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {item.tags?.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
              {(!item.tags || item.tags.length === 0) && (
                <span className="text-muted-foreground italic text-sm">No tags</span>
              )}
            </div>
          )}
        </div>
      </CardFooter>
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this inspiration item and remove it from your
              library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await deleteInspoItem(item.id)
                router.push("/")
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

