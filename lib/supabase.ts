import { createClient } from "@supabase/supabase-js"
import type { InspoItem } from "@/types/inspo"

// Create a single supabase client for the browser
const createBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables for browser client. Please check your .env.local file.")
    // Return a placeholder client or handle appropriately for your app
    throw new Error("Missing required environment variables")
  }
  
  return createClient(supabaseUrl as string, supabaseAnonKey as string)
}

// Singleton pattern for client-side Supabase client
let browserClient: ReturnType<typeof createBrowserClient> | null = null

export const getSupabaseBrowserClient = () => {
  if (!browserClient) {
    browserClient = createBrowserClient()
  }
  return browserClient
}

// Create a server-side Supabase client (for server components and server actions)
export const createServerClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables for server client. Please check your .env.local file.")
    // Return a placeholder client or handle appropriately for your app
    throw new Error("Missing required environment variables")
  }
  
  return createClient(supabaseUrl as string, supabaseServiceKey as string)
}

// Function to fetch all inspo items with their related data
export async function fetchInspoItems() {
  const supabase = getSupabaseBrowserClient()

  // Fetch all inspo items
  const { data: inspoItems, error: inspoError } = await supabase
    .from("inspo_items")
    .select("*")
    .order("created_at", { ascending: false })

  if (inspoError) {
    console.error("Error fetching inspo items:", inspoError)
    return []
  }

  // For each inspo item, fetch screenshots, urls, and tags
  const itemsWithRelations = await Promise.all(
    inspoItems.map(async (item) => {
      // Fetch screenshots
      const { data: screenshots, error: screenshotsError } = await supabase
        .from("screenshots")
        .select("url")
        .eq("inspo_id", item.id)
        .order("display_order", { ascending: true })

      if (screenshotsError) {
        console.error("Error fetching screenshots:", screenshotsError)
      }

      // Fetch URLs
      const { data: urls, error: urlsError } = await supabase.from("urls").select("url").eq("inspo_id", item.id)

      if (urlsError) {
        console.error("Error fetching URLs:", urlsError)
      }

      // Fetch tags
      const { data: tagRelations, error: tagsError } = await supabase
        .from("inspo_tags")
        .select("tag_id")
        .eq("inspo_id", item.id)

      if (tagsError) {
        console.error("Error fetching tag relations:", tagsError)
      }

      let tags: string[] = []

      if (tagRelations && tagRelations.length > 0) {
        const tagIds = tagRelations.map((relation) => relation.tag_id)

        const { data: tagData, error: tagDataError } = await supabase.from("tags").select("name").in("id", tagIds)

        if (tagDataError) {
          console.error("Error fetching tag data:", tagDataError)
        } else if (tagData) {
          tags = tagData.map((tag) => tag.name)
        }
      }

      // Format the data to match our InspoItem type
      return {
        id: item.id,
        title: item.title,
        screenshots: screenshots ? screenshots.map((s) => s.url) : [],
        urls: urls ? urls.map((u) => u.url) : [],
        notes: item.notes || "",
        tags: tags,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      } as InspoItem
    }),
  )

  return itemsWithRelations
}

// Function to add a new inspo item with all its relations
export async function addInspoItem(item: InspoItem) {
  const supabase = getSupabaseBrowserClient()

  // Start a transaction by using the Supabase client
  // First, insert the inspo item
  const { data: inspoData, error: inspoError } = await supabase
    .from("inspo_items")
    .insert({
      id: item.id, // Use the UUID generated on the client
      title: item.title,
      notes: item.notes,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    })
    .select()
    .single()

  if (inspoError) {
    console.error("Error adding inspo item:", inspoError)
    return null
  }

  // Insert screenshots
  if (item.screenshots && item.screenshots.length > 0) {
    const screenshotRows = item.screenshots.map((url, index) => ({
      inspo_id: inspoData.id,
      url,
      display_order: index,
    }))

    const { error: screenshotsError } = await supabase.from("screenshots").insert(screenshotRows)

    if (screenshotsError) {
      console.error("Error adding screenshots:", screenshotsError)
    }
  }

  // Insert URLs
  if (item.urls && item.urls.length > 0) {
    const urlRows = item.urls.map((url) => ({
      inspo_id: inspoData.id,
      url,
    }))

    const { error: urlsError } = await supabase.from("urls").insert(urlRows)

    if (urlsError) {
      console.error("Error adding URLs:", urlsError)
    }
  }

  // Insert tags (first check if they exist, then create relations)
  if (item.tags && item.tags.length > 0) {
    for (const tagName of item.tags) {
      // Check if tag exists
      const { data: existingTag, error: tagCheckError } = await supabase
        .from("tags")
        .select("id")
        .eq("name", tagName)
        .single()

      if (tagCheckError && tagCheckError.code !== "PGRST116") {
        // PGRST116 is "no rows returned"
        console.error("Error checking tag existence:", tagCheckError)
        continue
      }

      let tagId

      if (!existingTag) {
        // Tag doesn't exist, create it
        const { data: newTag, error: tagCreateError } = await supabase
          .from("tags")
          .insert({ name: tagName })
          .select()
          .single()

        if (tagCreateError) {
          console.error("Error creating tag:", tagCreateError)
          continue
        }

        tagId = newTag.id
      } else {
        tagId = existingTag.id
      }

      // Create relation between inspo item and tag
      const { error: relationError } = await supabase.from("inspo_tags").insert({
        inspo_id: inspoData.id,
        tag_id: tagId,
      })

      if (relationError) {
        console.error("Error creating tag relation:", relationError)
      }
    }
  }

  return inspoData
}

// Function to update an existing inspo item
export async function updateInspoItem(item: InspoItem) {
  const supabase = getSupabaseBrowserClient()

  // Update the inspo item
  const { error: updateError } = await supabase
    .from("inspo_items")
    .update({
      title: item.title,
      notes: item.notes,
      updated_at: item.updatedAt,
    })
    .eq("id", item.id)

  if (updateError) {
    console.error("Error updating inspo item:", updateError)
    return false
  }

  // Delete existing screenshots and insert new ones
  const { error: deleteScreenshotsError } = await supabase.from("screenshots").delete().eq("inspo_id", item.id)

  if (deleteScreenshotsError) {
    console.error("Error deleting screenshots:", deleteScreenshotsError)
  }

  if (item.screenshots && item.screenshots.length > 0) {
    const screenshotRows = item.screenshots.map((url, index) => ({
      inspo_id: item.id,
      url,
      display_order: index,
    }))

    const { error: screenshotsError } = await supabase.from("screenshots").insert(screenshotRows)

    if (screenshotsError) {
      console.error("Error adding screenshots:", screenshotsError)
    }
  }

  // Delete existing URLs and insert new ones
  const { error: deleteUrlsError } = await supabase.from("urls").delete().eq("inspo_id", item.id)

  if (deleteUrlsError) {
    console.error("Error deleting URLs:", deleteUrlsError)
  }

  if (item.urls && item.urls.length > 0) {
    const urlRows = item.urls.map((url) => ({
      inspo_id: item.id,
      url,
    }))

    const { error: urlsError } = await supabase.from("urls").insert(urlRows)

    if (urlsError) {
      console.error("Error adding URLs:", urlsError)
    }
  }

  // Delete existing tag relations
  const { error: deleteTagsError } = await supabase.from("inspo_tags").delete().eq("inspo_id", item.id)

  if (deleteTagsError) {
    console.error("Error deleting tag relations:", deleteTagsError)
  }

  // Insert new tag relations
  if (item.tags && item.tags.length > 0) {
    for (const tagName of item.tags) {
      // Check if tag exists
      const { data: existingTag, error: tagCheckError } = await supabase
        .from("tags")
        .select("id")
        .eq("name", tagName)
        .single()

      if (tagCheckError && tagCheckError.code !== "PGRST116") {
        console.error("Error checking tag existence:", tagCheckError)
        continue
      }

      let tagId

      if (!existingTag) {
        // Tag doesn't exist, create it
        const { data: newTag, error: tagCreateError } = await supabase
          .from("tags")
          .insert({ name: tagName })
          .select()
          .single()

        if (tagCreateError) {
          console.error("Error creating tag:", tagCreateError)
          continue
        }

        tagId = newTag.id
      } else {
        tagId = existingTag.id
      }

      // Create relation between inspo item and tag
      const { error: relationError } = await supabase.from("inspo_tags").insert({
        inspo_id: item.id,
        tag_id: tagId,
      })

      if (relationError) {
        console.error("Error creating tag relation:", relationError)
      }
    }
  }

  return true
}

// Function to delete an inspo item
export async function deleteInspoItem(id: string) {
  const supabase = getSupabaseBrowserClient()

  // First, get the tag IDs associated with this inspo item
  const { data: tagRelations, error: tagRelationsError } = await supabase
    .from("inspo_tags")
    .select("tag_id")
    .eq("inspo_id", id)

  if (tagRelationsError) {
    console.error("Error fetching tag relations:", tagRelationsError)
  }

  // Due to the CASCADE constraints, deleting the inspo item will automatically
  // delete related screenshots, URLs, and tag relations
  const { error } = await supabase.from("inspo_items").delete().eq("id", id)

  if (error) {
    console.error("Error deleting inspo item:", error)
    return false
  }

  // After deleting the item, check if any of its tags are now orphaned
  // (not used by any other inspo items) and delete them if so
  if (tagRelations && tagRelations.length > 0) {
    for (const relation of tagRelations) {
      const { data: usageCount, error: countError } = await supabase
        .from("inspo_tags")
        .select("inspo_id", { count: "exact" })
        .eq("tag_id", relation.tag_id)

      if (countError) {
        console.error("Error checking tag usage:", countError)
        continue
      }

      // If the tag is no longer used by any inspo items, delete it
      if (usageCount.length === 0) {
        const { error: deleteTagError } = await supabase.from("tags").delete().eq("id", relation.tag_id)

        if (deleteTagError) {
          console.error("Error deleting orphaned tag:", deleteTagError)
        }
      }
    }
  }

  return true
}

// Function to fetch all unique tags that are actually used by existing inspo items
export async function fetchAllTags() {
  const supabase = getSupabaseBrowserClient()

  // This query joins the tags table with the inspo_tags junction table
  // and only returns tags that have at least one associated inspo item
  const { data, error } = await supabase
    .from("tags")
    .select(`
      name,
      inspo_tags!inner(inspo_id)
    `)
    .order("name")

  if (error) {
    console.error("Error fetching tags:", error)
    return []
  }

  // Extract unique tag names
  const uniqueTags = [...new Set(data.map((tag) => tag.name))]
  return uniqueTags
}

// Function to search inspo items
export async function searchInspoItems(searchTerm: string) {
  const supabase = getSupabaseBrowserClient()

  // Search in titles and notes
  const { data, error } = await supabase
    .from("inspo_items")
    .select("id")
    .or(`title.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`)

  if (error) {
    console.error("Error searching inspo items:", error)
    return []
  }

  // Also search in tags
  const { data: tagMatches, error: tagError } = await supabase
    .from("tags")
    .select("id")
    .ilike("name", `%${searchTerm}%`)

  if (tagError) {
    console.error("Error searching tags:", tagError)
  }

  let tagMatchedInspoIds: string[] = []

  if (tagMatches && tagMatches.length > 0) {
    const tagIds = tagMatches.map((tag) => tag.id)

    const { data: inspoTagMatches, error: inspoTagError } = await supabase
      .from("inspo_tags")
      .select("inspo_id")
      .in("tag_id", tagIds)

    if (inspoTagError) {
      console.error("Error finding inspo items by tags:", inspoTagError)
    } else if (inspoTagMatches) {
      tagMatchedInspoIds = inspoTagMatches.map((relation) => relation.inspo_id)
    }
  }

  // Combine direct matches and tag-based matches
  const allMatchedIds = [...data.map((item) => item.id), ...tagMatchedInspoIds]

  // Remove duplicates
  const uniqueIds = [...new Set(allMatchedIds)]

  if (uniqueIds.length === 0) {
    return []
  }

  // Fetch the complete inspo items with their relations
  const { data: matchedItems, error: matchedError } = await supabase.from("inspo_items").select("*").in("id", uniqueIds)

  if (matchedError) {
    console.error("Error fetching matched inspo items:", matchedError)
    return []
  }

  // For each matched inspo item, fetch screenshots, urls, and tags
  return await Promise.all(
    matchedItems.map(async (item) => {
      // Fetch screenshots
      const { data: screenshots, error: screenshotsError } = await supabase
        .from("screenshots")
        .select("url")
        .eq("inspo_id", item.id)
        .order("display_order", { ascending: true })

      if (screenshotsError) {
        console.error("Error fetching screenshots:", screenshotsError)
      }

      // Fetch URLs
      const { data: urls, error: urlsError } = await supabase.from("urls").select("url").eq("inspo_id", item.id)

      if (urlsError) {
        console.error("Error fetching URLs:", urlsError)
      }

      // Fetch tags
      const { data: tagRelations, error: tagsError } = await supabase
        .from("inspo_tags")
        .select("tag_id")
        .eq("inspo_id", item.id)

      if (tagsError) {
        console.error("Error fetching tag relations:", tagsError)
      }

      let tags: string[] = []

      if (tagRelations && tagRelations.length > 0) {
        const tagIds = tagRelations.map((relation) => relation.tag_id)

        const { data: tagData, error: tagDataError } = await supabase.from("tags").select("name").in("id", tagIds)

        if (tagDataError) {
          console.error("Error fetching tag data:", tagDataError)
        } else if (tagData) {
          tags = tagData.map((tag) => tag.name)
        }
      }

      // Format the data to match our InspoItem type
      return {
        id: item.id,
        title: item.title,
        screenshots: screenshots ? screenshots.map((s) => s.url) : [],
        urls: urls ? urls.map((u) => u.url) : [],
        notes: item.notes || "",
        tags: tags,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      } as InspoItem
    }),
  )
}

