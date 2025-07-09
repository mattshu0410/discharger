import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const LoadingBlock = () => (
  <Card className="animate-pulse">
    <CardContent className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-8 h-8 rounded-full  bg-blue-200" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-2  bg-blue-200" />
          <Skeleton className="h-3 w-48  bg-blue-200" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full bg-blue-200" />
        <Skeleton className="h-3 w-3/4  bg-blue-200" />
        <Skeleton className="h-8 w-24 mt-3  bg-blue-200" />
      </div>
    </CardContent>
  </Card>
);
