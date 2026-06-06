import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function InstallButton({ className }: { className?: string }) {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  const handleClick = async () => {
    if (deferred) {
      try {
        await deferred.prompt();
        const choice = await deferred.userChoice;
        if (choice.outcome === "accepted") {
          toast.success("Installing dlsMasters…");
        }
        setDeferred(null);
      } catch {
        toast.error("Couldn't open install prompt");
      }
      return;
    }
    if (isIOS()) {
      toast.info("Tap the Share icon, then 'Add to Home Screen' to install dlsMasters.", {
        duration: 6000,
      });
      return;
    }
    toast.info("Open your browser menu and tap 'Install app' or 'Add to Home screen'.", {
      duration: 6000,
    });
  };

  // On desktop with no prompt available, hide entirely to avoid noise.
  if (!deferred && typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches && !isIOS()) {
    return null;
  }

  return (
    <Button
      size="sm"
      variant="default"
      onClick={handleClick}
      className={className}
    >
      <Download className="mr-1.5 h-4 w-4" />
      Install app
    </Button>
  );
}