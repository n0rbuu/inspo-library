"use client"

import { create } from "zustand"
import type { InspoItem, InspoState } from "@/types/inspo"
import { filterByTag, searchInspoItems as searchItems, shuffleItems } from "@/lib/data"
import {
  fetchInspoItems,
  addInspoItem as addItem,
  updateInspoItem as updateItem,
  deleteInspoItem as deleteItem,
  fetchAllTags,
  searchInspoItems as searchSupabaseItems,
} from "@/lib/supabase"

interface InspoActions {
  // Filter actions
  setTagFilter: (tag?: string) => void
  setSearchFilter: (search?: string) => void
  clearFilters: () => void

  // Item actions
  addInspoItem: (item: InspoItem) => Promise<void>
  updateInspoItem: (item: InspoItem) => Promise<void>
  deleteInspoItem: (id: string) => Promise<void>
  loadDummyData: () => void
  loadItems: () => Promise<void>

  // Import/Export
  exportData: () => void
  importData: (file: File) => Promise<void>

  // Wizard state
  isAddWizardOpen: boolean
  openAddWizard: () => void
  closeAddWizard: () => void

  // Import dialog state
  isImportDialogOpen: boolean
  openImportDialog: () => void
  closeImportDialog: () => void

  // Loading state
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
}

// Initialize store with empty arrays
const useInspoStore = create<InspoState & InspoActions>((set, get) => ({
  // Initial data
  items: [],
  tags: [],
  filteredItems: [],
  activeFilter: {},
  isLoading: false,

  // Set loading state
  setIsLoading: (isLoading: boolean) => set({ isLoading }),

  // Load items from Supabase
  loadItems: async () => {
    set({ isLoading: true })
    try {
      const items = await fetchInspoItems()
      const tags = await fetchAllTags()

      set({
        items,
        tags,
        filteredItems: shuffleItems(items),
        isLoading: false,
      })
    } catch (error) {
      console.error("Error loading items:", error)
      set({ isLoading: false })
    }
  },

  // Filter actions
  setTagFilter: (tag?: string) =>
    set((state) => {
      const filteredByTag = tag ? filterByTag(state.items, tag) : state.items
      const filteredBySearch = state.activeFilter.search
        ? searchItems(filteredByTag, state.activeFilter.search)
        : filteredByTag

      return {
        filteredItems: filteredBySearch,
        activeFilter: { ...state.activeFilter, tag },
      }
    }),

  setSearchFilter: async (search?: string) => {
    set({ isLoading: true })

    try {
      if (!search) {
        const filteredByTag = get().activeFilter.tag ? filterByTag(get().items, get().activeFilter.tag) : get().items

        set({
          filteredItems: filteredByTag,
          activeFilter: { ...get().activeFilter, search: "" },
          isLoading: false,
        })
        return
      }

      // Use Supabase search for more efficient searching
      const searchResults = await searchSupabaseItems(search)

      // If there's a tag filter, apply it to the search results
      const filteredResults = get().activeFilter.tag
        ? filterByTag(searchResults, get().activeFilter.tag)
        : searchResults

      set({
        filteredItems: filteredResults,
        activeFilter: { ...get().activeFilter, search },
        isLoading: false,
      })
    } catch (error) {
      console.error("Error searching items:", error)
      set({ isLoading: false })
    }
  },

  clearFilters: () =>
    set((state) => ({
      filteredItems: shuffleItems(state.items),
      activeFilter: {},
    })),

  // Item actions
  addInspoItem: async (item: InspoItem) => {
    set({ isLoading: true })

    try {
      await addItem(item)

      // Reload items to get the updated list
      await get().loadItems()
    } catch (error) {
      console.error("Error adding item:", error)
      set({ isLoading: false })
    }
  },

  updateInspoItem: async (item: InspoItem) => {
    set({ isLoading: true })

    try {
      await updateItem(item)

      // Reload items to get the updated list
      await get().loadItems()
    } catch (error) {
      console.error("Error updating item:", error)
      set({ isLoading: false })
    }
  },

  deleteInspoItem: async (id: string) => {
    set({ isLoading: true })

    try {
      await deleteItem(id)

      // Reload items to get the updated list
      await get().loadItems()
    } catch (error) {
      console.error("Error deleting item:", error)
      set({ isLoading: false })
    }
  },

  // Import/Export
  exportData: () => {
    const { items } = get()
    const dataStr = JSON.stringify(items, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`
    const exportFileDefaultName = `inspo-library-export-${new Date().toISOString().slice(0, 10)}.json`
    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  },

  importData: async (file: File) => {
    set({ isLoading: true })

    try {
      const reader = new FileReader()

      const fileContents = await new Promise<string>((resolve, reject) => {
        reader.onload = (event) => {
          resolve(event.target?.result as string)
        }
        reader.onerror = () => {
          reject(new Error("Error reading file"))
        }
        reader.readAsText(file)
      })

      const importedItems = JSON.parse(fileContents) as InspoItem[]

      // Add each imported item to Supabase
      for (const item of importedItems) {
        await addItem(item)
      }

      // Reload items to get the updated list
      await get().loadItems()

      set({ isImportDialogOpen: false })
    } catch (error) {
      console.error("Error importing data:", error)
      set({ isLoading: false })
      throw error
    }
  },

  // For development/demo purposes
  loadDummyData: () => {
    set({ isLoading: true })

    const { dummyData } = require("@/lib/data")

    // Add each dummy item to Supabase
    Promise.all(dummyData.map((item) => addItem(item)))
      .then(() => get().loadItems())
      .catch((error) => {
        console.error("Error loading dummy data:", error)
        set({ isLoading: false })
      })
  },

  // Wizard state
  isAddWizardOpen: false,
  openAddWizard: () => set({ isAddWizardOpen: true }),
  closeAddWizard: () => set({ isAddWizardOpen: false }),

  // Import dialog state
  isImportDialogOpen: false,
  openImportDialog: () => set({ isImportDialogOpen: true }),
  closeImportDialog: () => set({ isImportDialogOpen: false }),
}))

export { useInspoStore }

