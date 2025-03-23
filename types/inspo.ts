export interface InspoItem {
  id: string
  title: string
  screenshots: string[] // URLs to images
  urls?: string[]
  notes?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface InspoState {
  items: InspoItem[]
  tags: string[]
  filteredItems: InspoItem[]
  activeFilter: {
    tag?: string
    search?: string
  }
}

