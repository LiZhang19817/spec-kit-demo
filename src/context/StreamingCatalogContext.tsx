import { createContext, useContext, ReactNode } from 'react';
import { Movie } from '@/types/movie';
import { StreamingCatalogId } from '@/lib/streamingCatalog';

export interface StreamingCatalogContextValue {
  catalog: StreamingCatalogId;
  catalogMovies: Movie[];
}

const StreamingCatalogContext = createContext<StreamingCatalogContextValue | null>(null);

export function StreamingCatalogProvider({
  catalog,
  catalogMovies,
  children,
}: StreamingCatalogContextValue & { children: ReactNode }) {
  return (
    <StreamingCatalogContext.Provider value={{ catalog, catalogMovies }}>
      {children}
    </StreamingCatalogContext.Provider>
  );
}

export function useStreamingCatalog(): StreamingCatalogContextValue {
  const v = useContext(StreamingCatalogContext);
  if (!v) {
    throw new Error('useStreamingCatalog must be used within StreamingCatalogProvider');
  }
  return v;
}

/** For hooks that work outside catalog routes (e.g. tests) */
export function useStreamingCatalogOptional(): StreamingCatalogContextValue | null {
  return useContext(StreamingCatalogContext);
}
