"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { BookmarkForm } from "@/components/bookmarks/bookmark-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewBookmarkPage() {
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/" passHref>
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Add New Bookmark</h1>
        </div>
        <BookmarkForm />
      </div>
    </MainLayout>
  );
} 