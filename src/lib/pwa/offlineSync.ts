/**
 * FitForge Offline IndexedDB Synchronization Engine
 * 
 * Safely persists gym workouts during offline network loss.
 * Strictly scopes data to authenticated user_id to prevent cross-account leaks.
 * Implements idempotent syncing, retry handling, and local-data purge on logout.
 */

import { WorkoutSetRecord, WorkoutSession } from "@/lib/types";

const DB_NAME = "fitforge_offline_store";
const DB_VERSION = 1;

export const STORES = {
  PENDING_SYNC: "pending_workout_sync",
  SESSION_BACKUP: "active_sessions_backup",
} as const;

export interface PendingSyncRecord {
  id: string;
  user_id: string;
  session_id: string;
  action_type: "update_set" | "complete_set" | "finish_session";
  payload: any;
  created_at: string;
  retry_count: number;
  last_error?: string;
}

/**
 * Open or upgrade the IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not supported in this environment"));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Store 1: Pending workout sync queue
      if (!db.objectStoreNames.contains(STORES.PENDING_SYNC)) {
        const syncStore = db.createObjectStore(STORES.PENDING_SYNC, { keyPath: "id" });
        syncStore.createIndex("by_user", "user_id", { unique: false });
        syncStore.createIndex("by_session", "session_id", { unique: false });
        syncStore.createIndex("by_created", "created_at", { unique: false });
      }

      // Store 2: Active session backup snapshots
      if (!db.objectStoreNames.contains(STORES.SESSION_BACKUP)) {
        const backupStore = db.createObjectStore(STORES.SESSION_BACKUP, { keyPath: "session_id" });
        backupStore.createIndex("by_user", "user_id", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Queue an offline set update / completion
 */
export async function queueOfflineSetChange(
  userId: string,
  sessionId: string,
  actionType: "update_set" | "complete_set",
  setRecord: WorkoutSetRecord
): Promise<string> {
  try {
    const db = await openDB();
    const syncId = `sync-set-${sessionId}-${setRecord.id}-${Date.now()}`;
    const record: PendingSyncRecord = {
      id: syncId,
      user_id: userId,
      session_id: sessionId,
      action_type: actionType,
      payload: setRecord,
      created_at: new Date().toISOString(),
      retry_count: 0,
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORES.PENDING_SYNC], "readwrite");
      const store = tx.objectStore(STORES.PENDING_SYNC);
      const req = store.put(record);

      req.onsuccess = () => resolve(syncId);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[OfflineSync] Failed to queue set in IndexedDB:", err);
    return "";
  }
}

/**
 * Queue an offline session completion
 */
export async function queueOfflineSessionCompletion(
  userId: string,
  session: WorkoutSession
): Promise<string> {
  try {
    const db = await openDB();
    const syncId = `sync-session-${session.id}-${Date.now()}`;
    const record: PendingSyncRecord = {
      id: syncId,
      user_id: userId,
      session_id: session.id,
      action_type: "finish_session",
      payload: session,
      created_at: new Date().toISOString(),
      retry_count: 0,
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORES.PENDING_SYNC], "readwrite");
      const store = tx.objectStore(STORES.PENDING_SYNC);
      const req = store.put(record);

      req.onsuccess = () => resolve(syncId);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[OfflineSync] Failed to queue session completion in IndexedDB:", err);
    return "";
  }
}

/**
 * Backup the active workout session in IndexedDB
 */
export async function saveActiveSessionBackup(
  userId: string,
  session: WorkoutSession
): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORES.SESSION_BACKUP], "readwrite");
      const store = tx.objectStore(STORES.SESSION_BACKUP);
      const req = store.put({
        session_id: session.id,
        user_id: userId,
        data: session,
        updated_at: new Date().toISOString(),
      });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[OfflineSync] Failed to save session backup:", err);
  }
}

/**
 * Get all pending sync records for a specific user
 */
export async function getPendingSyncRecords(userId: string): Promise<PendingSyncRecord[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORES.PENDING_SYNC], "readonly");
      const store = tx.objectStore(STORES.PENDING_SYNC);
      const index = store.index("by_user");
      const req = index.getAll(userId);

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

/**
 * Remove a successfully synced item by ID
 */
export async function removeSyncedRecord(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORES.PENDING_SYNC], "readwrite");
      const store = tx.objectStore(STORES.PENDING_SYNC);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[OfflineSync] Failed to remove synced record:", err);
  }
}

/**
 * Increment retry count and note error for a pending record
 */
export async function markSyncFailure(id: string, errorMsg: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORES.PENDING_SYNC], "readwrite");
      const store = tx.objectStore(STORES.PENDING_SYNC);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const item: PendingSyncRecord = getReq.result;
        if (!item) return resolve();
        item.retry_count = (item.retry_count || 0) + 1;
        item.last_error = errorMsg;
        const putReq = store.put(item);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  } catch (err) {
    console.warn("[OfflineSync] Failed to mark sync failure:", err);
  }
}

/**
 * Clear all offline data belonging to a user (Invoked on Logout)
 * Ensures multi-user privacy on shared devices.
 */
export async function clearUserOfflineData(userId: string): Promise<void> {
  try {
    const db = await openDB();

    // 1. Delete user pending records
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORES.PENDING_SYNC], "readwrite");
      const store = tx.objectStore(STORES.PENDING_SYNC);
      const index = store.index("by_user");
      const req = index.openCursor(userId);

      req.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      req.onerror = () => reject(req.error);
    });

    // 2. Delete user session backups
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORES.SESSION_BACKUP], "readwrite");
      const store = tx.objectStore(STORES.SESSION_BACKUP);
      const index = store.index("by_user");
      const req = index.openCursor(userId);

      req.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      req.onerror = () => reject(req.error);
    });

    console.log(`[OfflineSync] Cleared all offline records for user: ${userId}`);
  } catch (err) {
    console.warn("[OfflineSync] Failed to clear user offline data:", err);
  }
}

/**
 * Synchronize all pending records for a user
 */
export async function syncPendingWorkoutQueue(
  userId: string,
  supabaseClient?: any,
  isDemoMode: boolean = true
): Promise<{ success: boolean; syncedCount: number; errorsCount: number }> {
  const pending = await getPendingSyncRecords(userId);
  if (pending.length === 0) {
    return { success: true, syncedCount: 0, errorsCount: 0 };
  }

  let syncedCount = 0;
  let errorsCount = 0;

  for (const record of pending) {
    try {
      if (isDemoMode || !supabaseClient) {
        // In interactive demo mode or when Supabase is unconfigured,
        // changes are safely mirrored in localStorage; clear the queue item.
        await removeSyncedRecord(record.id);
        syncedCount++;
        continue;
      }

      // Supabase Remote Sync with Idempotency
      if (record.action_type === "update_set" || record.action_type === "complete_set") {
        const set: WorkoutSetRecord = record.payload;
        const { error } = await supabaseClient.from("workout_sets").upsert(
          {
            id: set.id,
            session_id: set.session_id,
            exercise_id: set.exercise_id,
            set_number: set.set_number,
            set_type: set.set_type,
            weight_kg: set.weight_kg,
            reps: set.reps,
            rpe: set.rpe || null,
            is_completed: set.is_completed,
            is_pr: set.is_pr || false,
            created_at: set.created_at,
          },
          { onConflict: "id" }
        );

        if (error) throw error;
        await removeSyncedRecord(record.id);
        syncedCount++;
      } else if (record.action_type === "finish_session") {
        const session: WorkoutSession = record.payload;
        const { error } = await supabaseClient.from("workout_sessions").upsert(
          {
            id: session.id,
            user_id: session.user_id,
            plan_id: session.plan_id || null,
            name: session.name,
            start_time: session.start_time,
            end_time: session.end_time || new Date().toISOString(),
            duration_seconds: session.duration_seconds,
            total_volume_kg: session.total_volume_kg,
            status: "completed",
            pr_count: session.pr_count || 0,
            notes: session.notes || null,
          },
          { onConflict: "id" }
        );

        if (error) throw error;
        await removeSyncedRecord(record.id);
        syncedCount++;
      }
    } catch (err: any) {
      console.warn(`[OfflineSync] Sync failed for record ${record.id}:`, err);
      await markSyncFailure(record.id, err?.message || "Network / server sync error");
      errorsCount++;
    }
  }

  return {
    success: errorsCount === 0,
    syncedCount,
    errorsCount,
  };
}
