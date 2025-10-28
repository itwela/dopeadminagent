'use client';

import { ConvexHttpClient } from "convex/browser";
import { createContext, useContext, ReactNode } from "react";

const ConvexContext = createContext<{ convex: ConvexHttpClient } | null>(null);

export default function ClientConvexProvision({ children }: { children: ReactNode }) {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    const value = {
        convex,
    }

    return (
        <ConvexContext.Provider value={value}>
            {children}
        </ConvexContext.Provider>
    );
}

export function useConvexClient() {
    const context = useContext(ConvexContext);
    if (!context) {
        throw new Error('useConvexClient must be used within ClientConvexProvision');
    }
    return context.convex;
}