import { NextResponse } from "next/server";
import { INITIAL_EXERCISES } from "@/lib/data/initialExercises";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export async function POST(request: Request) {
  try {
    const { isConfigured } = getSupabaseConfig();

    if (!isConfigured) {
      return NextResponse.json({
        success: false,
        message: "Supabase credentials are not configured in environment variables.",
        exercisesCount: INITIAL_EXERCISES.length,
      });
    }

    const supabase = await createSupabaseServerClient();

    // Check existing count
    const { data: existing, error: countError } = await supabase
      .from("exercises")
      .select("id")
      .limit(1);

    if (countError) {
      return NextResponse.json(
        { success: false, error: countError.message },
        { status: 500 }
      );
    }

    if (existing && existing.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Database already seeded with exercises.",
      });
    }

    // Insert curated exercises safely
    const formattedExercises = INITIAL_EXERCISES.map((ex) => ({
      name: ex.name,
      instructions: ex.instructions,
      primary_muscles: ex.primary_muscles,
      secondary_muscles: ex.secondary_muscles,
      equipment: ex.equipment,
      difficulty: ex.difficulty,
      movement_type: ex.movement_type,
      media_url: ex.media_url,
      alternatives: ex.alternatives,
      is_custom: false,
    }));

    const { error: insertError } = await supabase
      .from("exercises")
      .insert(formattedExercises);

    if (insertError) {
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      seededCount: formattedExercises.length,
      message: "Successfully seeded curated exercises dataset.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    totalCuratedExercises: INITIAL_EXERCISES.length,
    instructions: "Send POST request to seed exercises into connected Supabase database.",
  });
}
