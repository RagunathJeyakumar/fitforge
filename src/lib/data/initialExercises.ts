import { Exercise } from "../types";

export const INITIAL_EXERCISES: Exercise[] = [
  // CHEST
  {
    id: "ex-bench-press",
    name: "Barbell Bench Press",
    instructions: [
      "Lie flat on the bench with eyes directly under the racked bar.",
      "Grip the bar slightly wider than shoulder-width with a firm overhand grip.",
      "Retract and depress shoulder blades, plant feet firmly into the floor, creating a slight natural arch.",
      "Unrack the bar and stabilize over your upper chest with locked arms.",
      "Lower the bar under control to the mid-sternum, tucking elbows at roughly 45-70 degrees.",
      "Press explosively back up in a slight diagonal arc toward the rack position, locking out smoothly."
    ],
    primary_muscles: ["Chest"],
    secondary_muscles: ["Triceps", "Shoulders"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Dumbbell Bench Press", "Incline Dumbbell Press", "Push-ups"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-incline-db-press",
    name: "Incline Dumbbell Press",
    instructions: [
      "Set an adjustable bench to a 30-45 degree incline.",
      "Kick dumbbells up to shoulder height using your knees as you lean back.",
      "Retract scapulae and press dumbbells vertically, avoiding clashing them together at the top.",
      "Lower dumbbells steadily until elbows are level with or slightly below your shoulders.",
      "Drive back to full extension, emphasizing upper chest recruitment."
    ],
    primary_muscles: ["Chest"],
    secondary_muscles: ["Shoulders", "Triceps"],
    equipment: "Dumbbell",
    difficulty: "Intermediate",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Barbell Bench Press", "Incline Barbell Bench Press", "Cable Crossover"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-cable-flye",
    name: "Cable Chest Flye",
    instructions: [
      "Set cable pulleys at chest or shoulder height with D-handles attached.",
      "Take a step forward into a staggered stance with a slight forward torso lean.",
      "With elbows slightly unlocked and fixed, sweep handles together in a wide hugging motion.",
      "Squeeze pectorals intensely at the peak contraction for 1 second.",
      "Control the eccentric return until you feel a comfortable stretch across the chest."
    ],
    primary_muscles: ["Chest"],
    secondary_muscles: ["Shoulders"],
    equipment: "Cable",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Dumbbell Flye", "Pec Deck Machine", "Incline Dumbbell Press"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-dips",
    name: "Chest Dips",
    instructions: [
      "Grip the parallel dip bars and suspend bodyweight with locked arms.",
      "Lean torso forward approximately 30 degrees and flare elbows slightly outward to target chest.",
      "Descend smoothly until shoulders are below elbows (approx. 90-degree flexion).",
      "Drive through palms to return to starting position, maintaining chest angle."
    ],
    primary_muscles: ["Chest"],
    secondary_muscles: ["Triceps", "Shoulders"],
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Close Grip Bench Press", "Push-ups", "Barbell Bench Press"],
    created_at: "2026-01-01T00:00:00Z"
  },

  // BACK
  {
    id: "ex-deadlift",
    name: "Conventional Barbell Deadlift",
    instructions: [
      "Stand with feet hip-width apart, barbell crossing mid-foot approx. 1 inch from shins.",
      "Hinge at the hips and grip bar just outside knees with double-overhand or hook grip.",
      "Pull chest tall, depress lats, pack the neck, and pull slack out of the barbell.",
      "Drive the floor away through mid-foot and heels, extending hips and knees concurrently.",
      "Lock out hips tall without hyperextending lower spine.",
      "Hinge at hips first, lowering the barbell along shins back to dead stop."
    ],
    primary_muscles: ["Back", "Glutes", "Hamstrings"],
    secondary_muscles: ["Core", "Forearms"],
    equipment: "Barbell",
    difficulty: "Advanced",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Sumo Deadlift", "Trap Bar Deadlift", "Romanian Deadlift"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-barbell-row",
    name: "Barbell Bent-Over Row",
    instructions: [
      "Hold barbell with an overhand grip slightly wider than shoulder width.",
      "Hinge hips backward until torso is at roughly 45 to 30 degrees to parallel.",
      "Keep spine rigid, core braced, and knees softly bent.",
      "Pull the barbell toward lower ribcage/navel, driving elbows backward toward ceiling.",
      "Squeeze shoulder blades together at peak contraction.",
      "Lower under control without rounding back."
    ],
    primary_muscles: ["Back"],
    secondary_muscles: ["Biceps", "Shoulders", "Core"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Chest-Supported T-Bar Row", "Dumbbell One-Arm Row", "Seated Cable Row"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-pullups",
    name: "Strict Pull-up",
    instructions: [
      "Grip pull-up bar slightly wider than shoulder-width with overhand pronated grip.",
      "Start from a complete dead hang with engaged scapulae (depressed & retracted).",
      "Drive elbows down and back toward ribs, pulling chest up to bar level.",
      "Pause briefly at peak contraction without swinging or kicking.",
      "Lower under strict control back to full dead hang extension."
    ],
    primary_muscles: ["Back"],
    secondary_muscles: ["Biceps", "Core", "Forearms"],
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1598266663439-2056e6900339?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Lat Pulldown", "Assisted Pull-up Machine", "Chin-up"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-lat-pulldown",
    name: "Wide-Grip Lat Pulldown",
    instructions: [
      "Adjust thigh pads securely so knees cannot lift off during the movement.",
      "Grasp the bar with a wide overhand grip and sit down with upright torso.",
      "Pull bar down toward upper collarbones by drawing elbows down toward sides.",
      "Avoid excessive backward rocking; keep upper body steady with high chest.",
      "Control the bar back up until full lat stretch is attained."
    ],
    primary_muscles: ["Back"],
    secondary_muscles: ["Biceps", "Shoulders"],
    equipment: "Cable",
    difficulty: "Beginner",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Strict Pull-up", "Close Grip Lat Pulldown", "Straight Arm Cable Pulldown"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-seated-cable-row",
    name: "Seated Cable Row",
    instructions: [
      "Sit on cable bench with feet planted against footrests, knees slightly bent.",
      "Grip V-bar handle with neutral grip, maintaining neutral spine and upright chest.",
      "Pull handle toward belly button, tucking elbows and squeezing rhomboids and mid-traps.",
      "Resist the weight smoothly as arms extend forward with slight thoracic flexion for stretch."
    ],
    primary_muscles: ["Back"],
    secondary_muscles: ["Biceps", "Shoulders"],
    equipment: "Cable",
    difficulty: "Beginner",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Barbell Bent-Over Row", "Dumbbell One-Arm Row", "T-Bar Row"],
    created_at: "2026-01-01T00:00:00Z"
  },

  // SHOULDERS
  {
    id: "ex-overhead-press",
    name: "Standing Barbell Overhead Press (OHP)",
    instructions: [
      "Rack bar at mid-collarbone height. Grip bar just outside shoulders with wrists stacked.",
      "Unrack and take two paces back. Squeeze glutes, quads, and abdominal wall.",
      "Tuck chin slightly to clear bar trajectory and press straight upward overhead.",
      "Once bar clears forehead, shift torso forward naturally until bar is directly over midfoot.",
      "Lock out shoulders with shrug at top, then descend with control back to clavicle."
    ],
    primary_muscles: ["Shoulders"],
    secondary_muscles: ["Triceps", "Core", "Chest"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Seated Dumbbell Shoulder Press", "Smith Machine OHP", "Arnold Press"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-lateral-raise",
    name: "Dumbbell Lateral Raise",
    instructions: [
      "Stand with dumbbells hanging at sides, palms facing inward and slight forward lean.",
      "Maintain a 10-15 degree bend in elbows throughout movement.",
      "Raise arms out to sides in scapular plane (approx. 30 degrees forward) until elbows reach shoulder height.",
      "Think of leading with the elbows and pouring water from a pitcher at top.",
      "Lower under control for 2-3 seconds to prevent momentum."
    ],
    primary_muscles: ["Shoulders"],
    secondary_muscles: ["Forearms"],
    equipment: "Dumbbell",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Cable Lateral Raise", "Machine Lateral Raise", "Leaning Cable Lateral Raise"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-face-pulls",
    name: "Cable Face Pull",
    instructions: [
      "Attach rope to cable pulley set at eye level.",
      "Grip ends with thumbs facing backwards (neutral or underhand hammer grip).",
      "Step back into athletic stance, pull rope straight toward bridge of nose.",
      "Externally rotate shoulders as you pull, separating hands wide with elbows high.",
      "Squeeze rear deltoids and rotator cuff for 1 full second, then return smoothly."
    ],
    primary_muscles: ["Shoulders"],
    secondary_muscles: ["Back"],
    equipment: "Cable",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Reverse Pec Deck Flye", "Bent-Over Dumbbell Rear Delt Flye"],
    created_at: "2026-01-01T00:00:00Z"
  },

  // LEGS - QUADS & HAMSTRINGS & GLUTES
  {
    id: "ex-barbell-squat",
    name: "Barbell Back Squat",
    instructions: [
      "Step under the barbell, resting it across upper traps (high bar) or rear delts (low bar).",
      "Step back 2-3 paces. Feet shoulder-width apart, toes turned out 15-30 degrees.",
      "Take deep diaphragmatic breath into belly, bracing core 360 degrees.",
      "Break at hips and knees simultaneously, descending until hip crease is below knee cap.",
      "Keep knees tracking in line with toes and torso posture upright.",
      "Drive upward forcefully through midfoot back to full standing lockout."
    ],
    primary_muscles: ["Quads", "Glutes"],
    secondary_muscles: ["Hamstrings", "Core", "Calves"],
    equipment: "Barbell",
    difficulty: "Advanced",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Front Squat", "Leg Press", "Goblet Squat", "Hack Squat Machine"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-romanian-deadlift",
    name: "Romanian Deadlift (RDL)",
    instructions: [
      "Hold barbell or dumbbells in front of thighs with slight knee softness (approx. 15 deg).",
      "Hinge hips backward as if pushing a car door shut behind you.",
      "Keep bar sliding against or skimming very close to your shins.",
      "Descend until maximum hamstring stretch is achieved without spinal flexion (usually below knee).",
      "Squeeze glutes and drive hips forward to return to standing tall."
    ],
    primary_muscles: ["Hamstrings", "Glutes"],
    secondary_muscles: ["Back", "Core"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Dumbbell RDL", "Lying Leg Curl", "Glute Ham Raise"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-leg-press",
    name: "45-Degree Leg Press",
    instructions: [
      "Seat back firmly against padding, feet shoulder-width in center of sled.",
      "Disengage safety levers and grip side handles for pelvic stability.",
      "Lower sled slowly until knees reach roughly 90 degrees of flexion without lower back lifting.",
      "Press the sled up through mid-foot, avoiding hyperextension or locking out knees violently."
    ],
    primary_muscles: ["Quads"],
    secondary_muscles: ["Glutes", "Hamstrings"],
    equipment: "Machine",
    difficulty: "Beginner",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Barbell Back Squat", "Hack Squat Machine", "Bulgarian Split Squat"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-bulgarian-split-squat",
    name: "Bulgarian Split Squat",
    instructions: [
      "Place one foot elevated rearward on a bench or box behind you, laces down.",
      "Step leading foot forward into an athletic stride length.",
      "Hold dumbbells at sides or bodyweight. Descend down and slightly back until back knee nearly touches ground.",
      "Keep lead shin relatively vertical or slightly forward depending on quad vs glute bias.",
      "Drive through lead foot heel and midfoot to return to top."
    ],
    primary_muscles: ["Quads", "Glutes"],
    secondary_muscles: ["Hamstrings", "Calves", "Core"],
    equipment: "Dumbbell",
    difficulty: "Intermediate",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Walking Lunges", "Barbell Back Squat", "Leg Press"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-leg-curl",
    name: "Seated Leg Curl",
    instructions: [
      "Adjust thigh pad firmly down to lock quads and prevent pelvis movement.",
      "Place Achilles tendon area comfortably on the lever roller pad.",
      "Curl legs downward under full control, squeezing hamstrings hard at bottom.",
      "Control the eccentric phase for 2 to 3 seconds until full leg extension."
    ],
    primary_muscles: ["Hamstrings"],
    secondary_muscles: ["Calves"],
    equipment: "Machine",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Lying Leg Curl", "Romanian Deadlift (RDL)", "Nordic Curl"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-leg-extension",
    name: "Leg Extension",
    instructions: [
      "Sit back against backrest with knee axis aligned with the machine pivot point.",
      "Position lower pad just above ankles.",
      "Extend knees upward smoothly to full quad contraction, pausing for 1 second at top.",
      "Slowly lower weight back to starting angle without letting weight stack slam."
    ],
    primary_muscles: ["Quads"],
    secondary_muscles: [],
    equipment: "Machine",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Barbell Back Squat", "Sissy Squat", "Leg Press"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-calf-raise",
    name: "Standing Calf Raise",
    instructions: [
      "Stand on balls of feet on elevated block or calf machine platform.",
      "Lower heels fully down for a deep 2-second gastrocnemius stretch.",
      "Explosively press through big toes up onto tiptoes.",
      "Squeeze calves hard at apex for 1 full second before lowering slowly."
    ],
    primary_muscles: ["Calves"],
    secondary_muscles: [],
    equipment: "Machine",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Seated Calf Raise", "Leg Press Calf Extension"],
    created_at: "2026-01-01T00:00:00Z"
  },

  // ARMS - BICEPS & TRICEPS & FOREARMS
  {
    id: "ex-incline-db-curl",
    name: "Incline Dumbbell Bicep Curl",
    instructions: [
      "Adjust bench to a 45-60 degree incline and sit back with dumbbells hanging straight down.",
      "Keep elbows pinned backward to achieve maximum long-head bicep stretch.",
      "Supinate wrists (turn palms upward) as you curl dumbbells toward shoulders.",
      "Squeeze biceps hard at top without swinging elbows forward.",
      "Lower dumbbells with steady 2-3 second tempo back into dead hang."
    ],
    primary_muscles: ["Biceps"],
    secondary_muscles: ["Forearms"],
    equipment: "Dumbbell",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Barbell Bicep Curl", "Preacher Curl", "Cable Bicep Curl"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-hammer-curl",
    name: "Dumbbell Hammer Curl",
    instructions: [
      "Stand tall holding dumbbells with neutral palms-facing-each-other grip.",
      "Keep elbows tucked beside torso.",
      "Curl weights upward toward shoulders while maintaining neutral wrist orientation.",
      "Targets the brachialis and brachioradialis for thick upper arm and forearm development.",
      "Lower smoothly to starting hang."
    ],
    primary_muscles: ["Biceps", "Forearms"],
    secondary_muscles: [],
    equipment: "Dumbbell",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Cable Rope Hammer Curl", "Incline Dumbbell Bicep Curl", "Reverse Barbell Curl"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-skull-crushers",
    name: "Barbell Skull Crusher (Lying Tricep Extension)",
    instructions: [
      "Lie on flat bench holding EZ bar or barbell directly above chest with narrow overhand grip.",
      "Angle upper arms slightly backward (towards your head, roughly 75 degrees from floor).",
      "Bend only at elbows to lower the bar down towards forehead or just behind top of head.",
      "Extend elbows to press the bar back up, locking out triceps under continuous tension."
    ],
    primary_muscles: ["Triceps"],
    secondary_muscles: ["Forearms"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Cable Tricep Pushdown", "Overhead Dumbbell Tricep Extension", "Dips"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-cable-tricep-pushdown",
    name: "Cable Tricep Pushdown (Rope)",
    instructions: [
      "Set cable pulley to top position with rope attachment.",
      "Grab rope ends, bend forward slightly at hips, and pin elbows to your ribcage sides.",
      "Push rope straight down, flaring ends outward apart at full extension.",
      "Contract lateral and medial triceps heads firmly for 1 second.",
      "Allow forearms to rise to 90 degrees while keeping elbows motionless."
    ],
    primary_muscles: ["Triceps"],
    secondary_muscles: [],
    equipment: "Cable",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Straight Bar Pushdown", "Skull Crushers", "Chest Dips"],
    created_at: "2026-01-01T00:00:00Z"
  },

  // CORE
  {
    id: "ex-hanging-leg-raise",
    name: "Hanging Leg Raise",
    instructions: [
      "Hang from pull-up bar with overhand grip, shoulders engaged.",
      "Posteriorly tilt pelvis and engage abs before initiating movement.",
      "Raise legs with straight knees or slight bend until feet reach eye or bar level.",
      "Avoid swinging or using hip momentum; initiate entirely from lower abdominal flexion.",
      "Lower legs slowly back down under strict control."
    ],
    primary_muscles: ["Core"],
    secondary_muscles: ["Forearms"],
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1598266663439-2056e6900339?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Captain's Chair Knee Raise", "Ab Wheel Rollout", "Cable Woodchopper"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-cable-crunch",
    name: "Kneeling Cable Crunch",
    instructions: [
      "Kneel a few feet in front of high cable with rope held next to ears/cheeks.",
      "Fix hips in space and avoid sitting back onto heels.",
      "Flex spine by curling ribcage toward pelvic bone, contracting rectus abdominis.",
      "Hold peak contraction for 1 second, then uncurl torso smoothly."
    ],
    primary_muscles: ["Core"],
    secondary_muscles: [],
    equipment: "Cable",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Ab Wheel Rollout", "Hanging Leg Raise", "Decline Sit-up"],
    created_at: "2026-01-01T00:00:00Z"
  }
];
