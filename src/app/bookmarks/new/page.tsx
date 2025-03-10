"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { BookmarkForm } from "@/components/bookmarks/bookmark-form";

export default function NewBookmarkPage() {
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Add New Bookmark</h1>
        <BookmarkForm />
      </div>
    </MainLayout>
  );
} 