import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';

interface HydrationBoundaryProps {
  children: React.ReactNode;
}

export function HydrationBoundary({ children }: HydrationBoundaryProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Ensure we're in the browser
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default HydrationBoundary;