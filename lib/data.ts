import type { InspoItem } from "@/types/inspo"

export const dummyData: InspoItem[] = [
  {
    id: "1",
    title: "Modern Dashboard Layout",
    screenshots: ["/placeholder.svg?height=400&width=600"],
    urls: ["https://example.com/dashboard"],
    notes: "Clean dashboard with good use of white space and minimal UI",
    tags: ["dashboard", "ui", "minimal"],
    createdAt: new Date(2023, 5, 10).toISOString(),
    updatedAt: new Date(2023, 5, 10).toISOString(),
  },
  {
    id: "2",
    title: "Colorful Illustration Style",
    screenshots: ["/placeholder.svg?height=400&width=600", "/placeholder.svg?height=400&width=600"],
    urls: ["https://example.com/illustrations"],
    notes: "Bold, colorful illustrations with playful shapes and characters",
    tags: ["illustration", "colorful", "playful"],
    createdAt: new Date(2023, 6, 15).toISOString(),
    updatedAt: new Date(2023, 6, 15).toISOString(),
  },
  {
    id: "3",
    title: "Minimalist Product Page",
    screenshots: ["/placeholder.svg?height=400&width=600"],
    urls: ["https://example.com/product"],
    notes: "Clean product page with focus on photography and typography",
    tags: ["product", "minimal", "ecommerce"],
    createdAt: new Date(2023, 7, 22).toISOString(),
    updatedAt: new Date(2023, 7, 22).toISOString(),
  },
  {
    id: "4",
    title: "Animated Micro-interactions",
    screenshots: ["/placeholder.svg?height=400&width=600"],
    tags: ["animation", "micro-interaction", "ui"],
    createdAt: new Date(2023, 8, 5).toISOString(),
    updatedAt: new Date(2023, 8, 5).toISOString(),
  },
  {
    id: "5",
    title: "Typography System Guide",
    screenshots: ["/placeholder.svg?height=400&width=600"],
    notes: "Comprehensive guide to setting up a typography system with good hierarchy",
    tags: ["typography", "design-system", "guide"],
    createdAt: new Date(2023, 9, 18).toISOString(),
    updatedAt: new Date(2023, 9, 18).toISOString(),
  },
]

// Get all unique tags from the data
export function getAllTags(items: InspoItem[]): string[] {
  const tagsSet = new Set<string>()

  items.forEach((item) => {
    if (item.tags) {
      item.tags.forEach((tag) => tagsSet.add(tag))
    }
  })

  return Array.from(tagsSet).sort()
}

// Search and filter functions
export function searchInspoItems(items: InspoItem[], searchTerm: string): InspoItem[] {
  if (!searchTerm) return items

  const lowercaseSearch = searchTerm.toLowerCase()

  return items.filter((item) => {
    // Search in title
    if (item.title.toLowerCase().includes(lowercaseSearch)) return true

    // Search in notes
    if (item.notes && item.notes.toLowerCase().includes(lowercaseSearch)) return true

    // Search in tags
    if (item.tags && item.tags.some((tag) => tag.toLowerCase().includes(lowercaseSearch))) return true

    // Search in urls
    if (item.urls && item.urls.some((url) => url.toLowerCase().includes(lowercaseSearch))) return true

    return false
  })
}

export function filterByTag(items: InspoItem[], tag: string): InspoItem[] {
  if (!tag) return items

  return items.filter((item) => {
    return item.tags && item.tags.includes(tag)
  })
}

// Fisher-Yates shuffle algorithm for randomizing items
export function shuffleItems<T>(array: T[]): T[] {
  const newArray = [...array]
  let currentIndex = newArray.length
  let temporaryValue
  let randomIndex

  // While there remain elements to shuffle
  while (currentIndex !== 0) {
    // Pick a remaining element
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    // And swap it with the current element
    temporaryValue = newArray[currentIndex]
    newArray[currentIndex] = newArray[randomIndex]
    newArray[randomIndex] = temporaryValue
  }

  return newArray
}

