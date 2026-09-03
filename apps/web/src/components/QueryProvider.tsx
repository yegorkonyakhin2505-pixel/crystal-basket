"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

/** Present from day one so phase-2 API hooks drop in without touching the layout. */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 } } }));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
