"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";

/**
 * Legacy route handler: redirects /notepad/[id] to /notepad
 * Since notes are now stored in localStorage (client-side),
 * sharing a URL with an ID no longer works across devices.
 * This page redirects users to the main notepad.
 */
export default function NoteViewRedirect({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);

  useEffect(() => {
    // Try to select the note in localStorage by storing the target ID
    if (resolvedParams.id) {
      sessionStorage.setItem("notepad_select", resolvedParams.id);
    }
    router.replace("/notepad");
  }, [resolvedParams.id, router]);

  return (
    <div className="container mx-auto flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-muted-foreground animate-pulse">Redirecting...</div>
    </div>
  );
}
