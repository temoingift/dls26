// Service worker registration with strict guards.
// Refuses to register in dev, iframes, Lovable preview/sandbox hosts, or when ?sw=off.

const SW_PATH = "/sw.js";

function shouldSkip(): boolean {
  if (typeof window === "undefined") return true;
  if (!import.meta.env.PROD) return true;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  const host = window.location.hostname;
  if (
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev") ||
    // Skip registering on Vercel domains to avoid stale service-worker cached pages
    host === "vercel.app" ||
    host.endsWith(".vercel.app") ||
    // Skip older Now domains if present
    host.endsWith(".now.sh")
  ) {
    return true;
  }
  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;
  return false;
}

async function unregisterMatching() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs
        .filter((r) => {
          const url = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || "";
          return url.endsWith(SW_PATH);
        })
        .map((r) => r.unregister()),
    );
  } catch {
    /* ignore */
  }
}

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (shouldSkip()) {
    await unregisterMatching();
    return;
  }
  try {
    await navigator.serviceWorker.register(SW_PATH, { scope: "/" });
  } catch (err) {
    console.warn("[sw] registration failed", err);
  }
}