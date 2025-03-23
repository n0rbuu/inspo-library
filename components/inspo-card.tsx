import type { InspoItem } from "@/types/inspo"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface InspoCardProps {
  item: InspoItem
  className?: string
}

export function InspoCard({ item, className }: InspoCardProps) {
  return (
    <Link href={`/inspo/${item.id}`}>
      <Card className={cn("h-full overflow-hidden transition-all hover:shadow-lg", className)}>
        <div className="aspect-video relative overflow-hidden">
          <Image src={item.screenshots[0] || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-1">{item.title}</h3>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex flex-wrap gap-1">
          {item.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="font-normal text-xs">
              {tag}
            </Badge>
          ))}
        </CardFooter>
      </Card>
    </Link>
  )
}

