"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  getPendingSyncRecords,
  syncPendingWorkoutQueue,
} from "./offlineSync";
import { getSupabaseBrowserClient } from "../supabase/client";
import { getSupabaseConfig } from "../supabase/config";

export type SyncStatus = "synced" | "syncing" | "offline" | "error";

export type InstallPromptState =
  | "unsupported"
  | "available"
  | "installed"
  | "dismissed"
  | "ios_manual";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PwaContextType {
  isOnline: boolean;
  syncStatus: SyncStatus;
  pendingSyncCount: number;
  isInstallable: boolean;
  isInstalled: boolean;
  isIos: boolean;
  installPromptState: InstallPromptState;
  showInstallBanner: boolean;
  updateAvailable: boolean;
  triggerInstall: () => Promise<boolean>;
  dismissInstallBanner: () => void;
  triggerManualSync: () => Promise<void>;
  applyUpdate: () => void;
  showIosModal: boolean;
  setShowIosModal: (show: boolean) => void;
}

const PwaContext = createContext<PwaContextType | null>(null);

const STORAGE_KEYS = {
  BANNER_DISMISSED: "fitforge_pwa_banner_dismissed_until",
};

export const PwaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [installPromptState, setInstallPromptState] = useState<InstallPromptState>("unsupported");
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);
  const [showIosModal, setShowIosModal] = useState<boolean>(false);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);

  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);

  // 1. Check if application is already running in Standalone PWA mode
  const checkInstalled = useCallback(() => {
    if (typeof window === "undefined") return false;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes("android-app://");

    return Boolean(isStandalone);
  }, []);

  // 2. Initialize online/offline & installation detection
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect initial online state
    setIsOnline(window.navigator.onLine);
    if (!window.navigator.onLine) {
      setSyncStatus("offline");
    }

    // Detect iOS
    const ua = window.navigator.userAgent;
    const isIosDevice = /iPad|iPhone|iPod/.test(ua) && !((window as unknown as { MSStream?: unknown }).MSStream);
    setIsIos(isIosDevice);

    // Detect standalone mode
    const standalone = checkInstalled();
    setIsInstalled(standalone);

    if (standalone) {
      setInstallPromptState("installed");
      setShowInstallBanner(false);
    } else if (isIosDevice) {
      setInstallPromptState("ios_manual");
      // Check if user dismissed banner recently
      const dismissedUntil = localStorage.getItem(STORAGE_KEYS.BANNER_DISMISSED);
      if (!dismissedUntil || Number(dismissedUntil) < Date.now()) {
        setShowInstallBanner(true);
      }
    }

    // Listen for beforeinstallprompt on supported browsers
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setIsInstallable(true);
      setInstallPromptState("available");

      // Check if previously dismissed
      const dismissedUntil = localStorage.getItem(STORAGE_KEYS.BANNER_DISMISSED);
      if (!dismissedUntil || Number(dismissedUntil) < Date.now()) {
        setShowInstallBanner(true);
      }
    };

    // Listen for appinstalled
    const handleAppInstalled = () => {
      deferredPromptRef.current = null;
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPromptState("installed");
      setShowInstallBanner(false);
      console.log("[PWA] FitForge was successfully installed as a standalone app!");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [checkInstalled]);

  // 3. Online/Offline & Auto-Sync Listeners
  const runSync = useCallback(async () => {
    if (typeof window === "undefined") return;
    try {
      const savedUserStr = localStorage.getItem("fitforge_user");
      const userId = savedUserStr ? JSON.parse(savedUserStr).id : "user-marcus";

      const records = await getPendingSyncRecords(userId);
      setPendingSyncCount(records.length);

      if (records.length === 0) {
        setSyncStatus(window.navigator.onLine ? "synced" : "offline");
        return;
      }

      if (!window.navigator.onLine) {
        setSyncStatus("offline");
        return;
      }

      setSyncStatus("syncing");
      const { isConfigured } = getSupabaseConfig();
      const supabase = isConfigured ? getSupabaseBrowserClient() : null;
      const isDemo = localStorage.getItem("fitforge_is_demo") !== "false";

      const result = await syncPendingWorkoutQueue(userId, supabase, isDemo);

      const remaining = await getPendingSyncRecords(userId);
      setPendingSyncCount(remaining.length);

      if (result.success && remaining.length === 0) {
        setSyncStatus("synced");
      } else {
        setSyncStatus("error");
      }
    } catch (err) {
      console.warn("[PWA] Sync queue error:", err);
      setSyncStatus("error");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOnline(true);
      console.log("[PWA] Connection restored. Synchronizing pending workout queue...");
      runSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus("offline");
      console.log("[PWA] Network lost. Switched to Offline Gym Mode.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial sync check
    runSync();

    // Periodic check every 30 seconds
    const interval = setInterval(() => {
      if (window.navigator.onLine) {
        runSync();
      }
    }, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [runSync]);

  // 4. Service Worker Registration & Update Notification
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Register service worker in browser
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        console.log("[PWA] Service Worker registered with scope:", registration.scope);

        // Check for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              console.log("[PWA] New version of FitForge is available to update.");
              waitingWorkerRef.current = newWorker;
              setUpdateAvailable(true);
            }
          });
        });
      })
      .catch((err) => {
        console.warn("[PWA] Service worker registration failed:", err);
      });

    // Listen for controllerchange
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  // 5. Trigger Native Installation Prompt
  const triggerInstall = useCallback(async (): Promise<boolean> => {
    if (isIos) {
      setShowIosModal(true);
      return false;
    }

    if (!deferredPromptRef.current) {
      console.warn("[PWA] Installation prompt is not available.");
      return false;
    }

    try {
      const promptEvent = deferredPromptRef.current;
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;

      if (choice.outcome === "accepted") {
        console.log("[PWA] User accepted the installation prompt.");
        deferredPromptRef.current = null;
        setIsInstallable(false);
        setIsInstalled(true);
        setShowInstallBanner(false);
        return true;
      } else {
        console.log("[PWA] User dismissed the installation prompt.");
        return false;
      }
    } catch (err) {
      console.error("[PWA] Error displaying installation prompt:", err);
      return false;
    }
  }, [isIos]);

  // 6. Dismiss Install Banner
  const dismissInstallBanner = useCallback(() => {
    setShowInstallBanner(false);
    // Dismiss for 7 days
    const nextWeek = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEYS.BANNER_DISMISSED, String(nextWeek));
  }, []);

  // 7. Apply Update Safely (checks active workout before reloading)
  const applyUpdate = useCallback(() => {
    // Safety check: Is a workout in progress?
    const activeStr = localStorage.getItem("fitforge_active_workout");
    if (activeStr) {
      const confirmUpdate = window.confirm(
        "You have an active gym workout in progress! Updating now will reload the application. Continue?"
      );
      if (!confirmUpdate) return;
    }

    if (waitingWorkerRef.current) {
      waitingWorkerRef.current.postMessage({ type: "SKIP_WAITING" });
    } else if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: "SKIP_WAITING" });
    }
    setUpdateAvailable(false);
  }, []);

  return (
    <PwaContext.Provider
      value={{
        isOnline,
        syncStatus,
        pendingSyncCount,
        isInstallable,
        isInstalled,
        isIos,
        installPromptState,
        showInstallBanner,
        updateAvailable,
        triggerInstall,
        dismissInstallBanner,
        triggerManualSync: runSync,
        applyUpdate,
        showIosModal,
        setShowIosModal,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
};

export const usePwa = () => {
  const context = useContext(PwaContext);
  if (!context) {
    throw new Error("usePwa must be used within a PwaProvider");
  }
  return context;
};
