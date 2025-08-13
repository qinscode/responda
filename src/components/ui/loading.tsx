import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Zap } from 'lucide-react';

export const LoadingSpinner = ({ size = "default" }: { size?: "sm" | "default" | "lg" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
  );
};

export const LoadingDots = () => {
  return (
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
    </div>
  );
};

export const LoadingCard = () => {
  return (
    <Card className="card-modern">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="flex items-center gap-4 mt-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const LoadingRegionCard = () => {
  return (
    <Card className="card-modern">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-4 w-4" />
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>

        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  );
};

export const LoadingFullPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-emergency-600 to-emergency-700 px-4 py-2">
          <Skeleton className="h-4 w-96 mx-auto bg-white/20" />
        </div>
        <div className="border-b border-border/40">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="card-modern">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="dashboard-grid">
          <div className="dashboard-sidebar space-y-6">
            <LoadingCard />
            <LoadingCard />
          </div>
          <div className="dashboard-main space-y-6">
            <Card className="card-modern">
              <CardContent className="p-0">
                <Skeleton className="h-[500px] w-full" />
              </CardContent>
            </Card>
            <Card className="card-modern">
              <CardContent className="p-6 space-y-4">
                {[...Array(3)].map((_, index) => (
                  <LoadingRegionCard key={index} />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export const PulseLoader = ({ className }: { className?: string }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary animate-pulse" />
        <span className="text-sm font-medium text-muted-foreground">Loading emergency data...</span>
        <LoadingDots />
      </div>
    </div>
  );
}; 