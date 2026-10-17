import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { ActivityFeedItem, FriendGroup, GroupMember, MealType } from "@/lib/types";
import { deduplicateActivityFeed } from "@/lib/utils";

// Standard preset squads available for lifters
const PRESET_SQUADS: Record<string, { id: string; name: string; description: string }> = {
  "FORGE-884": {
    id: "00000000-0000-0000-0000-000000000884",
    name: "Iron Forge Syndicate",
    description: "Private circle of dedicated lifters. Tracking progress, pushing each other beyond plateaus.",
  },
  "DAWN-200": {
    id: "00000000-0000-0000-0000-000000000200",
    name: "Dawn Patrol 5AM Lifters",
    description: "Early morning lifters dedicated to raw compound strength, strict discipline, and volume.",
  },
  "WARRIOR-777": {
    id: "00000000-0000-0000-0000-000000000777",
    name: "Warrior Calisthenics & Power",
    description: "Weighted pullups, heavy dips, barbell squats, and athletic conditioning.",
  },
};

interface StoredSquad {
  id: string;
  name: string;
  description: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

interface StoredMembership {
  id: string;
  group_id: string;
  user_id: string;
  role: "admin" | "member";
  joined_at: string;
  profile?: {
    full_name: string;
    avatar_url?: string;
    email?: string;
  };
  weekly_volume_kg?: number;
  weekly_workouts_count?: number;
  streak_weeks?: number;
}

interface SquadPersistenceData {
  squads: StoredSquad[];
  memberships: StoredMembership[];
  activities: (ActivityFeedItem & {
    group_id?: string;
    invite_code?: string;
    created_at?: string;
  })[];
}

// Global in-memory cache to ensure state survives serverless invocations and hot-reloads
declare global {
  var __FITFORGE_SQUAD_CACHE__: SquadPersistenceData | undefined;
}

const PERSISTENCE_FILE_PATH = path.join(
  process.cwd(),
  "src",
  "lib",
  "data",
  "squad_persistence.json"
);
const TMP_FILE_PATH = path.join("/tmp", "squad_persistence.json");

async function readPersistenceData(): Promise<SquadPersistenceData> {
  const loadedData: SquadPersistenceData = {
    squads: Object.entries(PRESET_SQUADS).map(([code, preset]) => ({
      id: preset.id,
      name: preset.name,
      description: preset.description,
      invite_code: code,
      created_by: "system",
      created_at: "2026-01-01T00:00:00.000Z",
    })),
    memberships: [],
    activities: [],
  };

  const mergeSquads = (sourceSquads?: StoredSquad[]) => {
    if (!Array.isArray(sourceSquads)) return;
    sourceSquads.forEach((sq) => {
      if (!sq || !sq.id) return;
      const codeUpper = sq.invite_code?.toUpperCase();
      const existingIdx = loadedData.squads.findIndex(
        (s) => s.id === sq.id || (codeUpper && s.invite_code?.toUpperCase() === codeUpper)
      );
      if (existingIdx >= 0) {
        // Merge latest details from source
        loadedData.squads[existingIdx] = {
          ...loadedData.squads[existingIdx],
          ...sq,
        };
      } else {
        loadedData.squads.push(sq);
      }
    });
  };

  const mergeMemberships = (sourceMemberships?: StoredMembership[]) => {
    if (!Array.isArray(sourceMemberships)) return;
    sourceMemberships.forEach((m) => {
      if (!m || !m.group_id || !m.user_id) return;
      const existingIdx = loadedData.memberships.findIndex(
        (existing) =>
          (existing.id && m.id && existing.id === m.id) ||
          (existing.group_id === m.group_id && existing.user_id === m.user_id)
      );
      if (existingIdx >= 0) {
        const prevProf = loadedData.memberships[existingIdx].profile;
        const newProf = m.profile;
        loadedData.memberships[existingIdx] = {
          ...loadedData.memberships[existingIdx],
          ...m,
          profile: (prevProf || newProf) ? {
            full_name: newProf?.full_name || prevProf?.full_name || "Athlete",
            avatar_url: newProf?.avatar_url || prevProf?.avatar_url,
            email: newProf?.email || prevProf?.email || "",
          } : undefined,
        };
      } else {
        loadedData.memberships.push(m);
      }
    });
  };

  const mergeActivities = (sourceActivities?: ActivityFeedItem[]) => {
    if (!Array.isArray(sourceActivities)) return;
    const aIds = new Set(loadedData.activities.map((a) => a.id));
    sourceActivities.forEach((act) => {
      if (!act || !act.id) return;
      if (!aIds.has(act.id)) {
        loadedData.activities.push(act);
        aIds.add(act.id);
      }
    });
  };

  // 1. Try reading primary project file first
  try {
    if (fs.existsSync(PERSISTENCE_FILE_PATH)) {
      const raw = await fs.promises.readFile(PERSISTENCE_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed) {
        mergeSquads(parsed.squads);
        mergeMemberships(parsed.memberships);
        mergeActivities(parsed.activities);
        console.log("💾 [SQUAD-PERSIST:FILE-READ] Read primary file. Squads:", loadedData.squads.length, "Memberships:", loadedData.memberships.length);
      }
    }
  } catch (err: any) {
    console.warn("💾 [SQUAD-PERSIST:FILE-WARN] Primary file read skipped:", err?.message);
  }

  // 2. Read /tmp file and merge (crucial for serverless environments where process.cwd may be ephemeral)
  try {
    if (fs.existsSync(TMP_FILE_PATH)) {
      const rawTmp = await fs.promises.readFile(TMP_FILE_PATH, "utf-8");
      const parsedTmp = JSON.parse(rawTmp);
      if (parsedTmp) {
        mergeSquads(parsedTmp.squads);
        mergeMemberships(parsedTmp.memberships);
        mergeActivities(parsedTmp.activities);
        console.log("💾 [SQUAD-PERSIST:TMP-READ] Read /tmp file. Squads:", loadedData.squads.length, "Memberships:", loadedData.memberships.length);
      }
    }
  } catch (err: any) {}

  // 3. Merge in-memory global cache (preserves live squads across requests in same process)
  if (globalThis.__FITFORGE_SQUAD_CACHE__) {
    const mem = globalThis.__FITFORGE_SQUAD_CACHE__;
    mergeSquads(mem.squads);
    mergeMemberships(mem.memberships);
    mergeActivities(mem.activities);
    console.log("💾 [SQUAD-PERSIST:CACHE-MERGE] Merged memory cache. Squads:", loadedData.squads.length, "Memberships:", loadedData.memberships.length);
  }

  // Ensure preset squads exist
  Object.entries(PRESET_SQUADS).forEach(([code, preset]) => {
    if (!loadedData.squads.some((s) => s.id === preset.id || s.invite_code?.toUpperCase() === code)) {
      loadedData.squads.push({
        id: preset.id,
        name: preset.name,
        description: preset.description,
        invite_code: code,
        created_by: "system",
        created_at: "2026-01-01T00:00:00.000Z",
      });
    }
  });

  // Deduplicate activities
  loadedData.activities = deduplicateActivityFeed(loadedData.activities);

  // Store consolidated state in global memory cache
  globalThis.__FITFORGE_SQUAD_CACHE__ = loadedData;
  return loadedData;
}

async function writePersistenceData(data: SquadPersistenceData): Promise<void> {
  // Deduplicate before saving
  data.activities = deduplicateActivityFeed(data.activities);

  // Update in-memory global cache immediately
  globalThis.__FITFORGE_SQUAD_CACHE__ = data;
  console.log(
    "💾 [SQUAD-PERSIST:WRITE] Updated global memory cache.",
    `Total squads: ${data.squads.length},`,
    `Total memberships: ${data.memberships.length},`,
    `Total activities: ${data.activities.length}`
  );

  // Try writing to primary project file (local disk)
  try {
    const dir = path.dirname(PERSISTENCE_FILE_PATH);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
    await fs.promises.writeFile(PERSISTENCE_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    console.log("💾 [SQUAD-PERSIST:WRITE-SUCCESS] Wrote to", PERSISTENCE_FILE_PATH);
  } catch (err: any) {
    console.warn("💾 [SQUAD-PERSIST:WRITE-WARN] Primary file write failed (normal on Vercel):", err?.message);
  }

  // Try writing to /tmp (serverless writable disk)
  try {
    await fs.promises.writeFile(TMP_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    console.log("💾 [SQUAD-PERSIST:TMP-SUCCESS] Wrote to /tmp fallback:", TMP_FILE_PATH);
  } catch (err: any) {
    console.warn("💾 [SQUAD-PERSIST:TMP-WARN] /tmp write failed:", err?.message);
  }
}

function formatTimeAgo(dateStr?: string): string {
  if (!dateStr) return "Just now";
  try {
    const timeMs = new Date(dateStr).getTime();
    if (isNaN(timeMs)) return dateStr;
    const diffMs = Date.now() - timeMs;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 2) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  } catch {
    return "Recently";
  }
}

// GET /api/squad?userId=<uuid>&groupId=<uuid>
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const requestedGroupId = searchParams.get("groupId");

    console.log("🌐 [API:GET] /api/squad request received. userId:", userId, "groupId:", requestedGroupId);

    if (!userId) {
      console.warn("🌐 [API:GET] Missing userId in request!");
      return NextResponse.json(
        { success: false, error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get("authorization");
    const { url, anonKey } = getSupabaseConfig();
    const headers = {
      apikey: anonKey,
      Authorization: authHeader || `Bearer ${anonKey}`,
      "Content-Type": "application/json",
    };

    // Load persistent data
    const pData = await readPersistenceData();

    // 1. Fetch user's squad memberships from Supabase DB (if available)
    let dbMemberships: any[] = [];
    try {
      const memberRes = await fetch(
        `${url}/rest/v1/group_memberships?user_id=eq.${userId}&select=*,group:groups(*)`,
        { headers }
      );
      if (memberRes.ok) {
        dbMemberships = await memberRes.json();
        console.log("🌐 [API:GET] Supabase returned memberships:", dbMemberships.length);
      }
    } catch (e: any) {
      console.log("🌐 [API:GET] Supabase membership check skipped:", e?.message);
    }

    // Merge Supabase memberships into pData
    dbMemberships.forEach((dbM) => {
      if (dbM.group) {
        if (!pData.squads.some((s) => s.id === dbM.group.id)) {
          pData.squads.push({
            id: dbM.group.id,
            name: dbM.group.name,
            description: dbM.group.description || "",
            invite_code: dbM.group.invite_code,
            created_by: dbM.group.created_by,
            created_at: dbM.group.created_at || new Date().toISOString(),
          });
        }
        if (!pData.memberships.some((m) => m.group_id === dbM.group_id && m.user_id === userId)) {
          pData.memberships.push({
            id: dbM.id || `mem-${dbM.group_id}-${userId}`,
            group_id: dbM.group_id,
            user_id: userId,
            role: dbM.role || "member",
            joined_at: dbM.joined_at || new Date().toISOString(),
          });
        }
      }
    });

    // Check all squads this user belongs to
    const userMemberships = pData.memberships.filter((m) => m.user_id === userId);
    console.log(
      "🌐 [API:GET] User memberships found in persistence:",
      userMemberships.length,
      userMemberships.map((m) => ({ groupId: m.group_id, role: m.role }))
    );

    // If user has not joined any squad, return strictly empty state!
    if (userMemberships.length === 0) {
      console.log("🌐 [API:GET] User has not joined any squad. Returning inSquad: false (Solo Privacy).");
      return NextResponse.json({
        success: true,
        inSquad: false,
        squads: [],
        activeSquad: null,
        members: [],
        activities: [],
      });
    }

    // Extract valid squads for this user
    const squads: FriendGroup[] = userMemberships
      .map((m) => {
        const sq = pData.squads.find(
          (s) => s.id === m.group_id || (s.invite_code && s.invite_code.toUpperCase() === m.group_id.toUpperCase())
        );
        if (!sq) return null;
        const count = pData.memberships.filter(
          (mb) => mb.group_id === sq.id || (sq.invite_code && mb.group_id.toUpperCase() === sq.invite_code.toUpperCase())
        ).length;
        return {
          id: sq.id,
          name: sq.name,
          description: sq.description || "",
          invite_code: sq.invite_code,
          created_by: sq.created_by,
          members_count: count,
          created_at: sq.created_at,
          is_user_admin: m.role === "admin" || sq.created_by === userId,
        };
      })
      .filter(Boolean) as FriendGroup[];

    if (squads.length === 0) {
      console.log("🌐 [API:GET] No valid squads found for user. Returning inSquad: false.");
      return NextResponse.json({
        success: true,
        inSquad: false,
        squads: [],
        activeSquad: null,
        members: [],
        activities: [],
      });
    }

    // Select the active squad (match by id or invite_code)
    const activeSquad =
      squads.find(
        (s) =>
          s.id === requestedGroupId ||
          (s.invite_code && requestedGroupId && s.invite_code.toUpperCase() === requestedGroupId.toUpperCase())
      ) || squads[0];

    // Find ALL members for this active squad (User A + User B + ...)
    const allSquadMemberships = pData.memberships.filter(
      (m) =>
        m.group_id === activeSquad.id ||
        (activeSquad.invite_code && m.group_id.toUpperCase() === activeSquad.invite_code.toUpperCase())
    );
    const memberUserIds = allSquadMemberships.map((m) => m.user_id).filter(Boolean);

    console.log(
      `🌐 [API:GET] Active squad: "${activeSquad.name}" (${activeSquad.invite_code}). Total members: ${allSquadMemberships.length}. Member IDs:`,
      memberUserIds
    );

    // Fetch real workout sessions & diet logs from Supabase for all squad members
    let squadSessions: any[] = [];
    let squadMeals: any[] = [];
    if (memberUserIds.length > 0) {
      try {
        const idsQuery = `in.(${memberUserIds.join(",")})`;
        const [sessRes, mealRes] = await Promise.all([
          fetch(`${url}/rest/v1/workout_sessions?user_id=${idsQuery}&order=created_at.desc&limit=30`, { headers }),
          fetch(`${url}/rest/v1/diet_logs?user_id=${idsQuery}&order=logged_at.desc&limit=30`, { headers }),
        ]);
        if (sessRes.ok) squadSessions = await sessRes.json();
        if (mealRes.ok) squadMeals = await mealRes.json();
      } catch (e: any) {
        console.log("🌐 [API:GET] Supabase sessions/meals fetch skipped:", e?.message);
      }
    }

    // Build member map for profile details and volume ranking
    const memberMap = new Map<string, any>();
    allSquadMemberships.forEach((m) => {
      memberMap.set(m.user_id, {
        id: m.id,
        group_id: m.group_id,
        user_id: m.user_id,
        role: m.role,
        full_name: m.profile?.full_name || "Athlete",
        avatar_url: m.profile?.avatar_url,
        email: m.profile?.email || "",
        weekly_volume_kg: Number(m.weekly_volume_kg) || 0,
        weekly_workouts_count: Number(m.weekly_workouts_count) || 0,
        streak_weeks: Number(m.streak_weeks) || 1,
        joined_at: m.joined_at,
      });
    });

    // Incorporate Supabase sessions into member volume & workouts
    squadSessions.forEach((s) => {
      const mem = memberMap.get(s.user_id);
      if (mem) {
        mem.weekly_volume_kg += Math.round(Number(s.total_volume_kg) || 0);
        mem.weekly_workouts_count += 1;
      }
    });

    const members: GroupMember[] = Array.from(memberMap.values())
      .map((m) => ({
        id: m.id,
        group_id: m.group_id,
        user_id: m.user_id,
        role: m.role as "admin" | "member",
        user_profile: {
          full_name: m.full_name,
          avatar_url: m.avatar_url,
          email: m.email,
        },
        weekly_workouts_count: m.weekly_workouts_count,
        weekly_volume_kg: m.weekly_volume_kg,
        streak_weeks: Math.max(1, Math.min(12, m.weekly_workouts_count || 1)),
        joined_at: m.joined_at,
      }))
      .sort((a, b) => b.weekly_volume_kg - a.weekly_volume_kg);

    activeSquad.members_count = members.length;

    // Build unified squad activity feed (Real Workout logs + Real Food logs from ALL members)
    const activities: ActivityFeedItem[] = [];

    // Add Supabase workout sessions to feed
    squadSessions.forEach((s) => {
      const mem = memberMap.get(s.user_id);
      activities.push({
        id: `sess-${s.id}`,
        user_id: s.user_id,
        user_name: mem ? mem.full_name : "Squad Lifter",
        user_avatar: mem ? mem.avatar_url : undefined,
        action_type: s.pr_count && s.pr_count > 0 ? "pr_broken" : "workout_completed",
        workout_name: s.name,
        volume_kg: Math.round(Number(s.total_volume_kg) || 0),
        pr_detail: s.pr_count && s.pr_count > 0 ? `Broke ${s.pr_count} personal records! 🔥` : undefined,
        timestamp: formatTimeAgo(s.created_at || s.start_time),
        created_at: s.created_at || s.start_time,
        cheers_count: 0,
        has_cheered: false,
        is_real: true,
      });
    });

    // Add Supabase food fuel logs to feed
    squadMeals.forEach((m) => {
      const mem = memberMap.get(m.user_id);
      const protein = Number(m.protein_g) || 0;
      let badge = `🥗 Clean Fuel • ${m.calories} kcal`;
      if (protein >= 35) badge = `🍗 ${protein}g High-Protein Muscle Fuel 🔥`;
      else if (protein >= 20) badge = `💪 ${protein}g Lean Protein Power`;
      else if (m.tamil_name) badge = `🌿 Tamil Nadu Power Fuel`;

      activities.push({
        id: `meal-${m.id}`,
        user_id: m.user_id,
        user_name: mem ? mem.full_name : "Squad Lifter",
        user_avatar: mem ? mem.avatar_url : undefined,
        action_type: "meal_logged",
        meal_type: m.meal_type as MealType,
        food_name: m.food_name,
        tamil_name: m.tamil_name,
        calories: Number(m.calories) || 0,
        protein_g: protein,
        carbs_g: Number(m.carbs_g) || 0,
        fat_g: Number(m.healthy_fat_g) || 0,
        motivation_badge: badge,
        timestamp: formatTimeAgo(m.logged_at || m.created_at),
        created_at: m.logged_at || m.created_at,
        cheers_count: 0,
        has_cheered: false,
        is_real: true,
      });
    });

    // Add persisted activities for this squad and its members
    pData.activities.forEach((act) => {
      const matchesGroup = Boolean(act.group_id && act.group_id === activeSquad.id);
      const matchesCode = Boolean(
        act.invite_code &&
        activeSquad.invite_code &&
        act.invite_code.toUpperCase() === activeSquad.invite_code.toUpperCase()
      );
      const matchesMember = memberUserIds.includes(act.user_id);

      if (matchesGroup || matchesCode || matchesMember) {
        activities.push({
          ...act,
          timestamp: formatTimeAgo(act.created_at || (act as any).timestamp),
        });
      }
    });

    // Clean, robust content & ID deduplication across Supabase logs and persisted activities
    const deduplicatedActivities = deduplicateActivityFeed(activities);

    console.log(
      `🌐 [API:GET] Successfully returning squad "${activeSquad.name}". Members: ${members.length}, Activities: ${deduplicatedActivities.length}`
    );

    return NextResponse.json({
      success: true,
      inSquad: true,
      squads,
      activeSquad,
      members,
      activities: deduplicatedActivities,
    });
  } catch (err: any) {
    console.error("🌐 [API:GET] Critical Squad GET error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/squad
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      action,
      userId,
      inviteCode,
      name,
      description,
      groupId,
      userProfile,
      activity,
      initialVolume,
      initialWorkoutsCount,
      recentActivities,
      volume,
      workouts_increment,
      activityId,
    } = body;

    console.log("🌐 [API:POST] Request received. Action:", action, "userId:", userId, "inviteCode:", inviteCode, "name:", name);

    if (action === "clear" || action === "reset") {
      console.log("🧹 [API:POST:clear] Clearing all test squads, memberships, and activities...");
      const resetState: SquadPersistenceData = {
        squads: Object.entries(PRESET_SQUADS).map(([code, preset]) => ({
          id: preset.id,
          name: preset.name,
          description: preset.description,
          invite_code: code,
          created_by: "system",
          created_at: "2026-01-01T00:00:00.000Z",
        })),
        memberships: [],
        activities: [],
      };
      await writePersistenceData(resetState);
      return NextResponse.json({
        success: true,
        message: "All test squad, membership, and activity data cleared successfully.",
      });
    }

    if (!userId) {
      console.warn("🌐 [API:POST] Missing userId!");
      return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 });
    }

    const authHeader = request.headers.get("authorization");
    const { url, anonKey } = getSupabaseConfig();
    const headers = {
      apikey: anonKey,
      Authorization: authHeader || `Bearer ${anonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    };

    // Load persistent data
    const pData = await readPersistenceData();

    // 1. JOIN SQUAD BY CODE
    if (action === "join") {
      const rawCode = (inviteCode || "").trim();
      const code = rawCode.toUpperCase();
      const cleanCode = code.replace(/[\s\-_]/g, "");
      console.log(`🌐 [API:POST:join] Attempting to join squad with code: "${code}" (clean: "${cleanCode}"). User:`, userId, userProfile?.full_name);

      if (!code) {
        return NextResponse.json({ success: false, error: "Invite code is required" }, { status: 400 });
      }

      // Check persistence data first (exact or normalized match or ID match)
      let targetSquad = pData.squads.find(
        (s) =>
          s.invite_code?.toUpperCase() === code ||
          (s.invite_code && s.invite_code.replace(/[\s\-_]/g, "").toUpperCase() === cleanCode) ||
          s.id === code
      );
      console.log(
        "🌐 [API:POST:join] Persistence lookup result:",
        targetSquad ? `Found squad: "${targetSquad.name}" (${targetSquad.id})` : "Not found in local memory"
      );

      // Check preset squads
      if (!targetSquad) {
        const presetKey = Object.keys(PRESET_SQUADS).find(
          (k) => k === code || k.replace(/[\s\-_]/g, "").toUpperCase() === cleanCode
        );
        if (presetKey) {
          const preset = PRESET_SQUADS[presetKey];
          targetSquad = {
            id: preset.id,
            name: preset.name,
            description: preset.description,
            invite_code: presetKey,
            created_by: "system",
            created_at: "2026-01-01T00:00:00.000Z",
          };
          const existingSquadIdx = pData.squads.findIndex((s) => s.id === preset.id);
          if (existingSquadIdx >= 0) {
            pData.squads[existingSquadIdx] = targetSquad;
          } else {
            pData.squads.push(targetSquad);
          }
          console.log(`🌐 [API:POST:join] Instantiated preset squad: "${preset.name}" (${presetKey})`);
        }
      }

      // Check Supabase if not found
      if (!targetSquad) {
        try {
          const groupRes = await fetch(
            `${url}/rest/v1/groups?invite_code=eq.${encodeURIComponent(code)}&select=*`,
            { headers }
          );
          if (groupRes.ok) {
            const existing = await groupRes.json();
            if (existing && existing.length > 0 && existing[0]) {
              targetSquad = existing[0] as StoredSquad;
              const existingSquadIdx = pData.squads.findIndex((s) => s.id === targetSquad!.id);
              if (existingSquadIdx >= 0) {
                pData.squads[existingSquadIdx] = targetSquad;
              } else {
                pData.squads.push(targetSquad);
              }
              console.log(`🌐 [API:POST:join] Found squad in Supabase DB: "${targetSquad.name}" (${targetSquad.id})`);
            }
          }
        } catch (e: any) {
          console.warn("🌐 [API:POST:join] Supabase lookup error:", e?.message);
        }
      }

      if (!targetSquad) {
        console.warn(`🌐 [API:POST:join] Squad code "${code}" NOT FOUND anywhere! Available codes:`, pData.squads.map(s => s.invite_code));
        return NextResponse.json(
          {
            success: false,
            error: `Squad code "${code}" not found. Verify the code with your squad founder or create a new squad.`,
          },
          { status: 404 }
        );
      }

      // Ensure membership in persistence data (upsert)
      const existingMemIdx = pData.memberships.findIndex(
        (m) => m.group_id === targetSquad!.id && m.user_id === userId
      );

      if (existingMemIdx < 0) {
        pData.memberships.push({
          id: `mem-${targetSquad.id}-${userId}`,
          group_id: targetSquad.id,
          user_id: userId,
          role: "member",
          joined_at: new Date().toISOString(),
          profile: {
            full_name: userProfile?.full_name || "Athlete",
            avatar_url: userProfile?.avatar_url,
            email: userProfile?.email || "",
          },
          weekly_volume_kg: Number(initialVolume) || 0,
          weekly_workouts_count: Number(initialWorkoutsCount) || 0,
          streak_weeks: Math.max(1, Number(initialWorkoutsCount) || 1),
        });
        console.log(`🌐 [API:POST:join] Inserted new membership for user "${userProfile?.full_name || userId}" into squad "${targetSquad.name}"`);
      } else {
        const existingMem = pData.memberships[existingMemIdx];
        if (userProfile?.full_name) {
          existingMem.profile = {
            full_name: userProfile.full_name,
            avatar_url: userProfile.avatar_url || existingMem.profile?.avatar_url,
            email: userProfile.email || existingMem.profile?.email || "",
          };
        }
        if (initialVolume && Number(initialVolume) > (existingMem.weekly_volume_kg || 0)) {
          existingMem.weekly_volume_kg = Number(initialVolume);
        }
        if (initialWorkoutsCount && Number(initialWorkoutsCount) > (existingMem.weekly_workouts_count || 0)) {
          existingMem.weekly_workouts_count = Number(initialWorkoutsCount);
        }
        console.log(`🌐 [API:POST:join] User "${userId}" was already a member. Updated membership stats.`);
      }

      // Add any recent activities user brought along
      if (Array.isArray(recentActivities)) {
        recentActivities.forEach((act) => {
          if (!pData.activities.some((a) => a.id === act.id)) {
            pData.activities.unshift({
              ...act,
              group_id: targetSquad!.id,
              invite_code: targetSquad!.invite_code,
              created_at: act.created_at || new Date().toISOString(),
              is_real: true,
            });
          }
        });
        console.log(`🌐 [API:POST:join] Attached ${recentActivities.length} recent activities to squad stream`);
      }

      // Save to disk & memory immediately
      await writePersistenceData(pData);

      // Attempt Supabase insert in background
      try {
        await fetch(`${url}/rest/v1/group_memberships`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            group_id: targetSquad.id,
            user_id: userId,
            role: "member",
            joined_at: new Date().toISOString(),
          }),
        });
      } catch (e) {}

      // Gather ALL members of targetSquad (both User A and User B!)
      const allMembers = pData.memberships.filter(
        (m) => m.group_id === targetSquad!.id || (targetSquad!.invite_code && m.group_id.toUpperCase() === targetSquad!.invite_code.toUpperCase())
      );
      const memberUserIds = allMembers.map((m) => m.user_id);

      console.log(
        `🌐 [API:POST:join] ALL members of "${targetSquad.name}":`,
        allMembers.map((m) => `${m.profile?.full_name || m.user_id} (${m.role})`)
      );

      const members: GroupMember[] = allMembers.map((m) => ({
        id: m.id,
        group_id: m.group_id,
        user_id: m.user_id,
        role: m.role as "admin" | "member",
        user_profile: {
          full_name: m.profile?.full_name || "Athlete",
          avatar_url: m.profile?.avatar_url,
          email: m.profile?.email || "",
        },
        weekly_workouts_count: m.weekly_workouts_count || 0,
        weekly_volume_kg: m.weekly_volume_kg || 0,
        streak_weeks: m.streak_weeks || 1,
        joined_at: m.joined_at,
      })).sort((a, b) => b.weekly_volume_kg - a.weekly_volume_kg);

      // Gather ALL activities for targetSquad
      const squadActivities: ActivityFeedItem[] = deduplicateActivityFeed(
        pData.activities
          .filter((a) => a.group_id === targetSquad!.id || (targetSquad!.invite_code && a.invite_code?.toUpperCase() === targetSquad!.invite_code.toUpperCase()) || memberUserIds.includes(a.user_id))
          .map((a) => ({
            ...a,
            timestamp: formatTimeAgo(a.created_at || (a as any).timestamp),
          }))
      );

      console.log(`🌐 [API:POST:join] Returning ${members.length} members and ${squadActivities.length} activities to joiner!`);

      return NextResponse.json({
        success: true,
        message: `Successfully joined ${targetSquad.name}!`,
        squad: {
          id: targetSquad.id,
          name: targetSquad.name,
          description: targetSquad.description || "",
          invite_code: targetSquad.invite_code,
          created_by: targetSquad.created_by,
          members_count: members.length,
          created_at: targetSquad.created_at,
          is_user_admin: targetSquad.created_by === userId,
        },
        members,
        activities: squadActivities,
      });
    }

    // 2. CREATE NEW SQUAD
    if (action === "create") {
      const squadName = (name || "").trim();
      if (!squadName) {
        return NextResponse.json({ success: false, error: "Squad name is required" }, { status: 400 });
      }

      // Collision avoidance: check presets and existing squads
      const isCodeTaken = (c: string) => {
        const clean = c.replace(/[\s\-_]/g, "").toUpperCase();
        if (Object.keys(PRESET_SQUADS).some((pk) => pk.replace(/[\s\-_]/g, "").toUpperCase() === clean)) return true;
        if (pData.squads.some((s) => (s.invite_code || "").replace(/[\s\-_]/g, "").toUpperCase() === clean)) return true;
        return false;
      };

      let finalCode = (inviteCode || "").trim().toUpperCase();
      if (!finalCode || isCodeTaken(finalCode)) {
        let attempts = 0;
        do {
          finalCode = `FORGE-${Math.floor(100 + Math.random() * 900)}`;
          attempts++;
        } while (attempts < 50 && isCodeTaken(finalCode));
      }

      const squadId =
        (groupId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(groupId))
          ? groupId
          : (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function"
              ? (crypto as any).randomUUID()
              : `00000000-0000-0000-0000-${Date.now().toString().slice(-12).padStart(12, "0")}`);

      console.log(`🌐 [API:POST:create] Creating squad "${squadName}" with unique code "${finalCode}". Creator:`, userId);

      const newSquad: StoredSquad = {
        id: squadId,
        name: squadName,
        description: description || "Private squad for tracking volume and nutrition fuel together.",
        invite_code: finalCode,
        created_by: userId,
        created_at: new Date().toISOString(),
      };

      // Upsert squad
      const existingSquadIdx = pData.squads.findIndex((s) => s.id === squadId || s.invite_code?.toUpperCase() === finalCode);
      if (existingSquadIdx >= 0) {
        pData.squads[existingSquadIdx] = newSquad;
      } else {
        pData.squads.push(newSquad);
      }

      // Founder membership
      const founderMem: StoredMembership = {
        id: `mem-${squadId}-${userId}`,
        group_id: squadId,
        user_id: userId,
        role: "admin",
        joined_at: new Date().toISOString(),
        profile: {
          full_name: userProfile?.full_name || "Athlete",
          avatar_url: userProfile?.avatar_url,
          email: userProfile?.email || "",
        },
        weekly_volume_kg: Number(initialVolume) || 0,
        weekly_workouts_count: Number(initialWorkoutsCount) || 1,
        streak_weeks: 1,
      };

      const existingMemIdx = pData.memberships.findIndex((m) => m.group_id === squadId && m.user_id === userId);
      if (existingMemIdx >= 0) {
        pData.memberships[existingMemIdx] = founderMem;
      } else {
        pData.memberships.push(founderMem);
      }

      // If founder has recent activities, tag and add them
      if (Array.isArray(recentActivities)) {
        recentActivities.forEach((act) => {
          if (!pData.activities.some((a) => a.id === act.id)) {
            pData.activities.unshift({
              ...act,
              group_id: squadId,
              invite_code: finalCode,
              created_at: act.created_at || new Date().toISOString(),
              is_real: true,
            });
          }
        });
      }

      // Persist to memory and disk immediately
      await writePersistenceData(pData);

      // Attempt Supabase insert in background
      try {
        await fetch(`${url}/rest/v1/groups`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            id: squadId,
            name: squadName,
            description: newSquad.description,
            invite_code: finalCode,
            created_by: userId,
          }),
        });
        await fetch(`${url}/rest/v1/group_memberships`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            group_id: squadId,
            user_id: userId,
            role: "admin",
            joined_at: new Date().toISOString(),
          }),
        });
      } catch (e) {}

      const founderMemberFormatted: GroupMember = {
        id: founderMem.id,
        group_id: squadId,
        user_id: userId,
        role: "admin",
        user_profile: {
          full_name: founderMem.profile?.full_name || "Athlete",
          avatar_url: founderMem.profile?.avatar_url,
          email: founderMem.profile?.email || "",
        },
        weekly_workouts_count: founderMem.weekly_workouts_count || 1,
        weekly_volume_kg: founderMem.weekly_volume_kg || 0,
        streak_weeks: 1,
        joined_at: founderMem.joined_at,
      };

      console.log(`🌐 [API:POST:create] Successfully created squad "${squadName}" (${finalCode}). Persisted.`);

      return NextResponse.json({
        success: true,
        message: `Created squad ${squadName}!`,
        squad: {
          id: squadId,
          name: squadName,
          description: newSquad.description,
          invite_code: finalCode,
          created_by: userId,
          members_count: 1,
          created_at: newSquad.created_at,
          is_user_admin: true,
        },
        members: [founderMemberFormatted],
        activities: pData.activities
          .filter((a) => a.group_id === squadId || (finalCode && a.invite_code?.toUpperCase() === finalCode))
          .map((a) => ({
            ...a,
            timestamp: formatTimeAgo(a.created_at || (a as any).timestamp),
          })),
      });
    }

    // 3. LEAVE SQUAD
    if (action === "leave") {
      if (!groupId) {
        return NextResponse.json({ success: false, error: "Missing groupId" }, { status: 400 });
      }

      console.log(`🌐 [API:POST:leave] User ${userId} leaving group ${groupId}`);

      pData.memberships = pData.memberships.filter(
        (m) => !(m.group_id === groupId && m.user_id === userId)
      );

      await writePersistenceData(pData);

      try {
        await fetch(
          `${url}/rest/v1/group_memberships?group_id=eq.${groupId}&user_id=eq.${userId}`,
          { method: "DELETE", headers }
        );
      } catch (e) {}

      return NextResponse.json({
        success: true,
        message: "Successfully left squad",
      });
    }

    // 4. LOG ACTIVITY (workouts + meals)
    if (action === "log_activity" && activity) {
      console.log("🌐 [API:POST:log_activity] Incoming activity payload:", {
        action_type: activity.action_type,
        food_name: activity.food_name,
        workout_name: activity.workout_name,
        userId,
        groupId,
        inviteCode,
      });

      // Find target squad by groupId, inviteCode, or user's existing membership
      let targetSquad = pData.squads.find(
        (s) =>
          (groupId && s.id === groupId) ||
          (inviteCode && s.invite_code?.toUpperCase() === inviteCode?.toUpperCase()) ||
          (inviteCode && s.invite_code?.replace(/[\s\-_]/g, "").toUpperCase() === inviteCode?.replace(/[\s\-_]/g, "").toUpperCase())
      );

      if (!targetSquad) {
        const userMem = pData.memberships.find((m) => m.user_id === userId);
        if (userMem) {
          targetSquad = pData.squads.find((s) => s.id === userMem.group_id);
        }
      }

      const targetGroupId = targetSquad?.id || groupId;
      const targetInviteCode = targetSquad?.invite_code || inviteCode;

      console.log(`🌐 [API:POST:log_activity] User ${userId} logging ${activity.action_type} for squad ${targetGroupId} (${targetInviteCode})`);

      // Ensure user membership exists for this squad
      if (targetGroupId) {
        let userMem = pData.memberships.find(
          (m) => m.group_id === targetGroupId && m.user_id === userId
        );
        if (!userMem) {
          pData.memberships.push({
            id: `mem-${targetGroupId}-${userId}`,
            group_id: targetGroupId,
            user_id: userId,
            role: "member",
            joined_at: new Date().toISOString(),
            profile: {
              full_name: activity.user_name || userProfile?.full_name || "Athlete",
              avatar_url: activity.user_avatar || userProfile?.avatar_url,
              email: userProfile?.email || "",
            },
            weekly_volume_kg: Number(volume) || 0,
            weekly_workouts_count: workouts_increment ? Number(workouts_increment) : 0,
            streak_weeks: 1,
          });
          console.log(`🌐 [API:POST:log_activity] Registered membership for user "${userId}" in squad "${targetGroupId}"`);
        } else {
          if (volume) {
            userMem.weekly_volume_kg = (userMem.weekly_volume_kg || 0) + Math.round(Number(volume));
          }
          if (workouts_increment) {
            userMem.weekly_workouts_count = (userMem.weekly_workouts_count || 0) + Number(workouts_increment);
          }
        }
      }

      const newAct: ActivityFeedItem & { group_id?: string; invite_code?: string; created_at?: string } = {
        ...activity,
        id: activity.id || `meal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        user_id: userId,
        group_id: targetGroupId,
        invite_code: targetInviteCode,
        created_at: activity.created_at || new Date().toISOString(),
        timestamp: "Just now",
        is_real: true,
      };

      // Deduplicate: replace existing by ID or content signature
      const newFoodNorm = newAct.food_name?.toLowerCase().trim();
      const newWorkoutNorm = newAct.workout_name?.toLowerCase().trim();
      const newTime = new Date(newAct.created_at || 0).getTime();

      const existingIdx = pData.activities.findIndex((a) => {
        if (a.id === newAct.id) return true;
        if (a.user_id === newAct.user_id && a.action_type === newAct.action_type) {
          const aTime = new Date(a.created_at || 0).getTime();
          const timeDiff = Math.abs(aTime - newTime);

          if (newAct.action_type === "meal_logged") {
            const aFoodNorm = a.food_name?.toLowerCase().trim();
            const namesMatch = Boolean(
              (newFoodNorm && aFoodNorm && newFoodNorm === aFoodNorm) ||
              (newAct.tamil_name && a.tamil_name && newAct.tamil_name.trim() === a.tamil_name.trim())
            );
            if (namesMatch && (timeDiff < 10 * 60 * 1000 || isNaN(timeDiff))) return true;
          }

          if (newAct.action_type === "workout_completed" || newAct.action_type === "pr_broken") {
            const aWorkoutNorm = a.workout_name?.toLowerCase().trim();
            if (newWorkoutNorm && aWorkoutNorm && newWorkoutNorm === aWorkoutNorm && timeDiff < 15 * 60 * 1000) {
              return true;
            }
          }
        }
        return false;
      });

      if (existingIdx >= 0) {
        pData.activities[existingIdx] = newAct;
      } else {
        pData.activities.unshift(newAct);
      }

      pData.activities = deduplicateActivityFeed(pData.activities);

      // Keep recent 300 activities
      if (pData.activities.length > 300) {
        pData.activities.pop();
      }

      await writePersistenceData(pData);

      console.log(`🌐 [API:POST:log_activity] Successfully stored ${newAct.action_type} "${newAct.food_name || newAct.workout_name}". Total squad activities: ${pData.activities.length}`);

      return NextResponse.json({
        success: true,
        message: "Activity logged to squad stream",
        activity: newAct,
      });
    }

    // 5. CHEER ACTIVITY
    if (action === "cheer" && activityId) {
      console.log(`🌐 [API:POST:cheer] Hype cheer for activity: ${activityId}`);
      const act = pData.activities.find((a) => a.id === activityId);
      if (act) {
        act.cheers_count = (act.cheers_count || 0) + 1;
        await writePersistenceData(pData);
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("🌐 [API:POST] Critical Squad POST error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
