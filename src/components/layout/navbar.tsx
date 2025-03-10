import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, Library, Home, Settings } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b bg-background sticky top-0 z-10">
      <div className="container flex h-16 items-center px-4">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Library className="h-6 w-6" />
            <span className="font-bold">Inspo Library</span>
          </Link>
        </div>
        <div className="flex items-center space-x-1">
          <Link href="/" passHref>
            <Button variant="ghost" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
          <Link href="/settings" passHref>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
        <div className="ml-auto flex items-center space-x-2">
          <Link href="/bookmarks/new" passHref>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Bookmark
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
} 