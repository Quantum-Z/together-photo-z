"use client";
import { RoomProvider } from "@/hooks/RoomProvider";
import { App } from "@/components/App";
import { Toaster } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Page() {
  return (
    <ErrorBoundary>
      <RoomProvider>
        <App />
        <Toaster />
      </RoomProvider>
    </ErrorBoundary>
  );
}
