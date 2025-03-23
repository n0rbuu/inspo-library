import type { InspoItem } from "@/types/inspo"

const STORAGE_KEY = "inspo-library-data"

// Save all inspo items to localStorage
export function saveToLocalStorage(items: InspoItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.error("Error saving to localStorage:", error)
  }
}

// Load all inspo items from localStorage
export function loadFromLocalStorage(): InspoItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("Error loading from localStorage:", error)
    return []
  }
}

// Export data as a downloadable JSON file
export function exportData(items: InspoItem[]): void {
  try {
    const dataStr = JSON.stringify(items, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `inspo-library-export-${new Date().toISOString().slice(0, 10)}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  } catch (error) {
    console.error("Error exporting data:", error)
  }
}

// Import data from a JSON file
export async function importData(file: File): Promise<InspoItem[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string)
        resolve(jsonData)
      } catch (error) {
        reject(new Error("Invalid JSON file"))
      }
    }

    reader.onerror = () => {
      reject(new Error("Error reading file"))
    }

    reader.readAsText(file)
  })
}

// Handle file uploads and convert to base64
export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      resolve(event.target?.result as string)
    }

    reader.onerror = () => {
      reject(new Error("Error reading file"))
    }

    reader.readAsDataURL(file)
  })
}

