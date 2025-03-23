"use client"

import { useInspoStore } from "@/store/inspo-store"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { SearchIcon } from "lucide-react"

export function Search() {
  const { setSearchFilter, activeFilter } = useInspoStore()
  const [searchValue, setSearchValue] = useState(activeFilter.search || "")

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchFilter(searchValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchValue, setSearchFilter])

  return (
    <div className="relative w-full">
      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search by title, tags, notes..."
        className="pl-9"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
    </div>
  )
}

