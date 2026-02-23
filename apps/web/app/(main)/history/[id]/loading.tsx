import {
  Card,
  CardContent,
  CardHeader,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";

export default function RecipeDetailLoading() {
  return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-2/3" />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-6 w-6 rounded" />
              ))}
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <div className="flex items-start">
              <Skeleton className="h-4 w-28 mr-2" />
              <div className="flex gap-1">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
  );
}
