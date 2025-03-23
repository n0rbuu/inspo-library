"use client"

import { useInspoStore } from "@/store/inspo-store"
import { InspoDetail } from "@/components/inspo-detail"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function InspoDetailPage({ params }: { params: { id: string } }) {
  const { items } = useInspoStore()
  const router = useRouter()
  const [item, setItem] = useState(items.find((item) => item.id === params.id))

  useEffect(() => {
    // Find the item when items change (e.g. after an update)
    const foundItem = items.find((item) => item.id === params.id)
    if (foundItem) {
      setItem(foundItem)
    } else {
      // If item not found, redirect to home
      router.push("/")
    }
  }, [items, params.id, router])

  if (!item) {
    return (
      <div className="container py-10 text-center">
        <h2 className="text-2xl font-bold mb-4">Inspo not found</h2>
        <p className="mb-6">The inspiration you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/">Go back home</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/" className="flex items-center">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to library
          </Link>
        </Button>
      </div>

      {/* Display all screenshots in a vertical stack */}
      <div className="mb-8 space-y-6">
        {item.screenshots.map((screenshot, index) => (
          <div key={index} className="rounded-lg overflow-hidden border shadow-sm">
            <div className="relative aspect-video w-full">
              <img
                src={screenshot || "/placeholder.svg"}
                alt={`${item.title} screenshot ${index + 1}`}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        ))}
      </div>

      <InspoDetail item={item} />
    </div>
  )
}

