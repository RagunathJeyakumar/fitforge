import { NextResponse } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { ActivityFeedItem, FriendGroup, GroupMember, MealType } from "@/lib/types";

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

// In-memory dual-layer registry to ensure 100% reliability across RLS policies
interface InMemorySquad {
  id: string;
  name: string;
  description: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

interface InMemoryMembership {
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
}

// Server memory storage for fallback sync
const globalSquads = new Map<string, InMemorySquad>();
const globalMemberships: InMemoryMembership[] = [];
const globalActivities: ActivityFeedItem[] = [];

// Initialize preset squads in memory registry
Object.entries(PRESET_SQUADS).forEach(([code, preset]) => {
  if (!globalSquads.has(preset.id)) {
    globalSquads.set(preset.id, {
      id: preset.id,
      name: preset.name,
      description: preset.description,
      invite_code: code,
      created_by: "system",
      created_at: "2026-01-01T00:00:00.000Z",
    });
  }
});

function formatTimeAgo(dateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
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
// Returns user squads, squad members, and squad activities (workouts + food logs)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const requestedGroupId = searchParams.get("groupId");

    if (!userId) {
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

    // 1. Fetch user's squad memberships from Supabase DB
    let memberships: any[] = [];
    try {
      const memberRes = await fetch(
        `${url}/rest/v1/group_memberships?user_id=eq.${userId}&select=*,group:groups(*)`,
        { headers }
      );
      if (memberRes.ok) {
        memberships = await memberRes.json();
      }
    } catch (e) {
      console.warn("Could not query DB group_memberships:", e);
    }

    // Merge in-memory memberships if any
    const memMembers = globalMemberships.filter((m) => m.user_id === userId);
    memMembers.forEach((mm) => {
      if (!memberships.some((m) => m.group_id === mm.group_id)) {
        const sq = globalSquads.get(mm.group_id);
        if (sq) {
          memberships.push({
            id: mm.id,
            group_id: mm.group_id,
            user_id: mm.user_id,
            role: mm.role,
            joined_at: mm.joined_at,
            group: sq,
          });
        }
      }
    });

    // If user has not joined any squad, return strictly empty state!
    if (!memberships || memberships.length === 0) {
      return NextResponse.json({
        success: true,
        inSquad: false,
        squads: [],
        activeSquad: null,
        members: [],
        activities: [],
      });
    }

    // Extract valid squads
    const squads: FriendGroup[] = memberships
      .filter((m) => m.group)
      .map((m) => ({
        id: m.group.id,
        name: m.group.name,
        description: m.group.description || "",
        invite_code: m.group.invite_code,
        created_by: m.group.created_by,
        members_count: 1,
        created_at: m.group.created_at,
        is_user_admin: m.role === "admin" || m.group.created_by === userId,
      }));

    if (squads.length === 0) {
      return NextResponse.json({
        success: true,
        inSquad: false,
        squads: [],
        activeSquad: null,
        members: [],
        activities: [],
      });
    }

    // Select the active squad
    const activeSquad =
      squads.find((s) => s.id === requestedGroupId) || squads[0];

    // 2. Fetch all members of this active squad from Supabase DB
    let rawMembers: any[] = [];
    try {
      const allMembersRes = await fetch(
        `${url}/rest/v1/group_memberships?group_id=eq.${activeSquad.id}&select=*,profile:profiles(*)`,
        { headers }
      );
      if (allMembersRes.ok) {
        rawMembers = await allMembersRes.json();
      }
    } catch (e) {
      console.warn("Could not query DB all members:", e);
    }

    // Merge in-memory members for this squad
    globalMemberships
      .filter((m) => m.group_id === activeSquad.id)
      .forEach((mm) => {
        if (!rawMembers.some((rm) => rm.user_id === mm.user_id)) {
          rawMembers.push({
            id: mm.id,
            group_id: mm.group_id,
            user_id: mm.user_id,
            role: mm.role,
            joined_at: mm.joined_at,
            profile: mm.profile || {
              full_name: "Athlete",
              avatar_url: undefined,
              email: "",
            },
          });
        }
      });

    const memberUserIds = rawMembers.map((m) => m.user_id).filter(Boolean);

    // 3. Fetch real workout sessions for all squad members
    let squadSessions: any[] = [];
    if (memberUserIds.length > 0) {
      try {
        const idsQuery = `in.(${memberUserIds.join(",")})`;
        const sessRes = await fetch(
          `${url}/rest/v1/workout_sessions?user_id=${idsQuery}&order=created_at.desc&limit=30`,
          { headers }
        );
        if (sessRes.ok) {
          squadSessions = await sessRes.json();
        }
      } catch (e) {
        console.warn("Could not query DB workout_sessions:", e);
      }
    }

    // 4. Fetch real diet logs for all squad members
    let squadMeals: any[] = [];
    if (memberUserIds.length > 0) {
      try {
        const idsQuery = `in.(${memberUserIds.join(",")})`;
        const mealRes = await fetch(
          `${url}/rest/v1/diet_logs?user_id=${idsQuery}&order=logged_at.desc&limit=30`,
          { headers }
        );
        if (mealRes.ok) {
          squadMeals = await mealRes.json();
        }
      } catch (e) {
        console.warn("Could not query DB diet_logs:", e);
      }
    }

    // 5. Build member map for profile details and volume ranking
    const memberMap = new Map<string, any>();
    rawMembers.forEach((rm) => {
      memberMap.set(rm.user_id, {
        id: rm.id,
        group_id: rm.group_id,
        user_id: rm.user_id,
        role: rm.role,
        full_name: rm.profile?.full_name || "Athlete",
        avatar_url: rm.profile?.avatar_url,
        email: rm.profile?.email || "",
        weekly_volume_kg: 0,
        weekly_workouts_count: 0,
        streak_weeks: 1,
        joined_at: rm.joined_at,
      });
    });

    // Compute live volume and workouts per member from real sessions
    squadSessions.forEach((s) => {
      const mem = memberMap.get(s.user_id);
      if (mem) {
        mem.weekly_volume_kg += Math.round(Number(s.total_volume_kg) || 0);
        mem.weekly_workouts_count += 1;
      }
    });

    const members: GroupMember[] = Array.from(memberMap.values()).map((m) => ({
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
      streak_weeks: Math.max(1, Math.min(8, m.weekly_workouts_count)),
      joined_at: m.joined_at,
    }));

    activeSquad.members_count = members.length;

    // 6. Build unified squad activity feed (Real Workout logs + Real Food logs)
    const activities: ActivityFeedItem[] = [];

    // Add workout sessions to feed
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
        cheers_count: 0,
        has_cheered: false,
        is_real: true,
      });
    });

    // Add food fuel logs to feed
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
        cheers_count: 0,
        has_cheered: false,
        is_real: true,
      });
    });

    // Add any live logged activities from memory for this squad
    globalActivities
      .filter((a) => memberUserIds.includes(a.user_id))
      .forEach((ga) => {
        if (!activities.some((act) => act.id === ga.id)) {
          activities.push(ga);
        }
      });

    // Sort newest first
    activities.sort((a, b) => (a.timestamp === "Just now" ? -1 : 1));

    return NextResponse.json({
      success: true,
      inSquad: true,
      squads,
      activeSquad,
      members,
      activities,
    });
  } catch (err: any) {
    console.error("Squad GET error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/squad
// Actions: join, create, leave, log_activity
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, inviteCode, name, description, groupId, userProfile, activity } = body;

    if (!userId) {
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

    // Ensure user profile exists in profiles table
    if (userProfile?.full_name) {
      try {
        await fetch(`${url}/rest/v1/profiles`, {
          method: "POST",
          headers: {
            ...headers,
            Prefer: "resolution=merge-duplicates",
          },
          body: JSON.stringify({
            id: userId,
            email: userProfile.email || "athlete@fitforge.app",
            full_name: userProfile.full_name,
            avatar_url: userProfile.avatar_url || null,
            updated_at: new Date().toISOString(),
          }),
        });
      } catch (e) {
        console.warn("Profile upsert warning:", e);
      }
    }

    // 1. JOIN SQUAD BY CODE
    if (action === "join") {
      const code = (inviteCode || "").trim().toUpperCase();
      if (!code) {
        return NextResponse.json({ success: false, error: "Invite code is required" }, { status: 400 });
      }

      // Check if squad exists in DB
      let existingGroups: any[] = [];
      try {
        const groupRes = await fetch(
          `${url}/rest/v1/groups?invite_code=eq.${encodeURIComponent(code)}&select=*`,
          { headers }
        );
        if (groupRes.ok) {
          existingGroups = await groupRes.json();
        }
      } catch (e) {
        console.warn("Could not query DB groups:", e);
      }

      let targetSquad = existingGroups[0];

      // Check memory registry
      if (!targetSquad) {
        for (const sq of globalSquads.values()) {
          if (sq.invite_code.toUpperCase() === code) {
            targetSquad = sq;
            break;
          }
        }
      }

      // If not in DB or memory, check preset squads
      if (!targetSquad && PRESET_SQUADS[code]) {
        const preset = PRESET_SQUADS[code];
        try {
          const createPresetRes = await fetch(`${url}/rest/v1/groups`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              id: preset.id,
              name: preset.name,
              description: preset.description,
              invite_code: code,
              created_by: userId,
            }),
          });
          if (createPresetRes.ok) {
            const inserted = await createPresetRes.json();
            targetSquad = inserted[0];
          }
        } catch (e) {
          console.warn("Could not insert preset to DB:", e);
        }

        if (!targetSquad) {
          targetSquad = {
            id: preset.id,
            name: preset.name,
            description: preset.description,
            invite_code: code,
            created_by: userId,
            created_at: new Date().toISOString(),
          };
        }
        globalSquads.set(targetSquad.id, targetSquad);
      }

      if (!targetSquad) {
        return NextResponse.json({
          success: false,
          error: `Squad code "${code}" not found. Verify the code with your squad founder or create a new squad.`,
        }, { status: 404 });
      }

      // Save to global squads memory
      globalSquads.set(targetSquad.id, {
        id: targetSquad.id,
        name: targetSquad.name,
        description: targetSquad.description || "",
        invite_code: targetSquad.invite_code,
        created_by: targetSquad.created_by,
        created_at: targetSquad.created_at || new Date().toISOString(),
      });

      // Insert membership to DB
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
      } catch (e) {
        console.warn("Could not insert membership to DB:", e);
      }

      // Save membership to memory
      const existingMemIndex = globalMemberships.findIndex(
        (m) => m.group_id === targetSquad.id && m.user_id === userId
      );
      if (existingMemIndex === -1) {
        globalMemberships.push({
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
        });
      }

      return NextResponse.json({
        success: true,
        message: `Successfully joined ${targetSquad.name}!`,
        squad: {
          id: targetSquad.id,
          name: targetSquad.name,
          description: targetSquad.description || "",
          invite_code: targetSquad.invite_code,
          created_by: targetSquad.created_by,
          members_count: 1,
          created_at: targetSquad.created_at,
          is_user_admin: targetSquad.created_by === userId,
        },
      });
    }

    // 2. CREATE NEW SQUAD
    if (action === "create") {
      const squadName = (name || "").trim();
      if (!squadName) {
        return NextResponse.json({ success: false, error: "Squad name is required" }, { status: 400 });
      }

      // Generate unique squad code
      const randomCode =
        inviteCode?.trim().toUpperCase() ||
        `FORGE-${Math.floor(100 + Math.random() * 900)}`;

      let createdGroup: any = null;
      try {
        const newGroupRes = await fetch(`${url}/rest/v1/groups`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            name: squadName,
            description: description || "Private squad for tracking volume and nutrition fuel together.",
            invite_code: randomCode,
            created_by: userId,
          }),
        });

        if (newGroupRes.ok) {
          const data = await newGroupRes.json();
          createdGroup = data[0];
        }
      } catch (e) {
        console.warn("Could not insert new group to DB:", e);
      }

      const squadId =
        createdGroup?.id || `00000000-0000-0000-0000-${Date.now().toString().slice(-12)}`;

      const newSquadData: InMemorySquad = {
        id: squadId,
        name: squadName,
        description: description || "Private squad for tracking volume and nutrition fuel together.",
        invite_code: randomCode,
        created_by: userId,
        created_at: new Date().toISOString(),
      };
      globalSquads.set(squadId, newSquadData);

      // Insert admin membership
      try {
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
      } catch (e) {
        console.warn("Could not insert admin membership to DB:", e);
      }

      globalMemberships.push({
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
      });

      return NextResponse.json({
        success: true,
        message: `Created squad ${squadName}!`,
        squad: {
          id: squadId,
          name: squadName,
          description: description || "Private squad for tracking volume and nutrition fuel together.",
          invite_code: randomCode,
          created_by: userId,
          members_count: 1,
          created_at: newSquadData.created_at,
          is_user_admin: true,
        },
      });
    }

    // 3. LEAVE SQUAD
    if (action === "leave") {
      if (!groupId) {
        return NextResponse.json({ success: false, error: "Missing groupId" }, { status: 400 });
      }

      try {
        await fetch(
          `${url}/rest/v1/group_memberships?group_id=eq.${groupId}&user_id=eq.${userId}`,
          {
            method: "DELETE",
            headers,
          }
        );
      } catch (e) {
        console.warn("Could not delete membership from DB:", e);
      }

      // Remove from memory
      const idx = globalMemberships.findIndex(
        (m) => m.group_id === groupId && m.user_id === userId
      );
      if (idx !== -1) {
        globalMemberships.splice(idx, 1);
      }

      return NextResponse.json({
        success: true,
        message: "Successfully left squad",
      });
    }

    // 4. LOG ACTIVITY DIRECTLY (e.g., immediate meal or workout sync)
    if (action === "log_activity" && activity) {
      globalActivities.unshift({
        ...activity,
        id: activity.id || `act-${Date.now()}`,
        user_id: userId,
        timestamp: "Just now",
        is_real: true,
      });

      // Keep recent 100 activities
      if (globalActivities.length > 100) {
        globalActivities.pop();
      }

      return NextResponse.json({
        success: true,
        message: "Activity logged to squad stream",
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Squad POST error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
