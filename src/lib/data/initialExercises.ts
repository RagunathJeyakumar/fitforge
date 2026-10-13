import { Exercise } from "../types";

export const INITIAL_EXERCISES: Exercise[] = [
  // ==========================================
  // CHEST
  // ==========================================
  {
    id: "ex-bench-press",
    name: "Barbell Bench Press",
    instructions: [
      "Lie flat on the bench with eyes directly under the racked bar.",
      "Grip the bar slightly wider than shoulder-width with a firm overhand grip.",
      "Retract and depress shoulder blades, plant feet firmly into the floor.",
      "Lower the bar under control to the mid-sternum, tucking elbows at roughly 45-70 degrees.",
      "Press explosively back up in a slight diagonal arc toward the rack position."
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
      "Retract scapulae and press dumbbells vertically without clashing them.",
      "Lower dumbbells steadily until elbows are level with your chest.",
      "Drive back to full extension, emphasizing upper clavicular head."
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
    id: "ex-db-bench-press",
    name: "Flat Dumbbell Bench Press",
    instructions: [
      "Sit on flat bench with dumbbells resting on thighs, then kick back to lying position.",
      "Keep feet planted and wrists stacked directly above elbows.",
      "Lower weights with control until you feel a deep pec stretch.",
      "Press dumbbells up in a slight converging arc to full lockout."
    ],
    primary_muscles: ["Chest"],
    secondary_muscles: ["Triceps", "Shoulders"],
    equipment: "Dumbbell",
    difficulty: "Beginner",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Barbell Bench Press", "Chest Press Machine"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-cable-flye",
    name: "Cable Chest Flye",
    instructions: [
      "Set cable pulleys at chest or shoulder height with D-handles attached.",
      "Take a step forward into a staggered stance with a slight forward torso lean.",
      "With elbows slightly unlocked, sweep handles together in a wide hugging motion.",
      "Squeeze pectorals intensely at the peak contraction for 1 second."
    ],
    primary_muscles: ["Chest"],
    secondary_muscles: ["Shoulders"],
    equipment: "Cable",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Dumbbell Flye", "Pec Deck Machine"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-pec-deck-machine",
    name: "Pec Deck / Chest Fly Machine",
    instructions: [
      "Adjust seat height so handles align with mid-chest.",
      "Rest forearms on pads or grip handles with elbows slightly bent.",
      "Draw arms together across chest, squeezing pecs at peak contraction.",
      "Return under control until a comfortable chest stretch is felt."
    ],
    primary_muscles: ["Chest"],
    secondary_muscles: ["Shoulders"],
    equipment: "Machine",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Cable Chest Flye", "Dumbbell Flye"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-chest-press-machine",
    name: "Seated Chest Press Machine",
    instructions: [
      "Adjust seat so horizontal handles align with mid-nipple line.",
      "Retract shoulder blades flat against backrest and plant feet.",
      "Press handles forward smoothly until arms are extended.",
      "Lower weight with slow 3-second eccentric tempo without clanging weights."
    ],
    primary_muscles: ["Chest"],
    secondary_muscles: ["Triceps", "Shoulders"],
    equipment: "Machine",
    difficulty: "Beginner",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Barbell Bench Press", "Dumbbell Bench Press"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-smith-incline-bench",
    name: "Smith Machine Incline Bench Press",
    instructions: [
      "Align incline bench directly under Smith machine bar at 30 degrees.",
      "Unrack with slight wrist rotation, lowering bar to upper clavicles.",
      "Drive weight up smoothly along fixed track, focusing purely on upper chest tension."
    ],
    primary_muscles: ["Chest"],
    secondary_muscles: ["Shoulders", "Triceps"],
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Incline Dumbbell Press", "Incline Barbell Bench Press"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-dips",
    name: "Chest Dips",
    instructions: [
      "Grip the parallel dip bars and suspend bodyweight with locked arms.",
      "Lean torso forward approximately 30 degrees and flare elbows slightly outward.",
      "Descend smoothly until shoulders reach elbow depth.",
      "Drive through palms to return to starting position."
    ],
    primary_muscles: ["Chest"],
    secondary_muscles: ["Triceps", "Shoulders"],
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Close Grip Bench Press", "Push-ups"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-floor-pushups",
    name: "Standard Floor Push-ups",
    instructions: [
      "Set hands slightly wider than shoulder-width on floor or mat.",
      "Lock body in straight rigid plank: glutes engaged, abs braced.",
      "Lower chest until 1 inch off floor with elbows tucked at 45 degrees.",
      "Push floor away explosively back to lockout."
    ],
    primary_muscles: ["Chest"],
    secondary_muscles: ["Triceps", "Shoulders", "Core"],
    equipment: "Ground / Mat",
    difficulty: "Beginner",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Diamond Push-up", "Barbell Bench Press"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-diamond-pushups",
    name: "Diamond Push-ups (Mat / Floor)",
    instructions: [
      "Place thumbs and index fingers touching together directly beneath chest.",
      "Maintain a rigid ground plank posture.",
      "Lower chest toward the diamond shape formed by hands.",
      "Press through triceps and inner chest to full lockout."
    ],
    primary_muscles: ["Chest", "Triceps"],
    secondary_muscles: ["Shoulders", "Core"],
    equipment: "Ground / Mat",
    difficulty: "Intermediate",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Standard Floor Push-ups", "Skull Crushers"],
    created_at: "2026-01-01T00:00:00Z"
  },

  // ==========================================
  // BACK
  // ==========================================
  {
    id: "ex-deadlift",
    name: "Conventional Barbell Deadlift",
    instructions: [
      "Stand with feet hip-width apart, barbell crossing mid-foot.",
      "Hinge at hips, grip bar outside knees, pull chest tall and pack lats.",
      "Drive floor away through mid-foot and heels, standing tall without hyper-extending.",
      "Hinge at hips first, lowering the bar along shins back to a dead stop."
    ],
    primary_muscles: ["Back", "Glutes", "Hamstrings"],
    secondary_muscles: ["Core", "Forearms"],
    equipment: "Barbell",
    difficulty: "Advanced",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Romanian Deadlift", "Trap Bar Deadlift"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-barbell-row",
    name: "Barbell Bent-Over Row",
    instructions: [
      "Hold barbell with an overhand grip slightly wider than shoulder width.",
      "Hinge hips backward until torso is at 45 degrees, spine rigid.",
      "Pull barbell toward lower ribcage, driving elbows toward ceiling.",
      "Squeeze shoulder blades together at peak contraction and lower steadily."
    ],
    primary_muscles: ["Back"],
    secondary_muscles: ["Biceps", "Shoulders", "Core"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Single-Arm Dumbbell Row", "Seated Cable Row"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-db-single-arm-row",
    name: "Single-Arm Dumbbell Row",
    instructions: [
      "Place one knee and hand on flat bench for support with spine neutral.",
      "Hold dumbbell in free hand hanging straight down with fully stretched lat.",
      "Pull dumbbell up toward hip crease, tucking elbow close to ribcage.",
      "Lower under control for full lat expansion."
    ],
    primary_muscles: ["Back"],
    secondary_muscles: ["Biceps", "Forearms"],
    equipment: "Dumbbell",
    difficulty: "Beginner",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Barbell Bent-Over Row", "Cable Row"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-pullups",
    name: "Strict Pull-up",
    instructions: [
      "Grip pull-up bar slightly wider than shoulder-width with overhand grip.",
      "Start from complete dead hang with engaged scapulae.",
      "Drive elbows down and back toward ribs, pulling chest up to bar level.",
      "Lower under strict control back to full dead hang extension."
    ],
    primary_muscles: ["Back"],
    secondary_muscles: ["Biceps", "Core", "Forearms"],
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1598266663439-2056e6900339?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Wide-Grip Lat Pulldown", "Chin-up"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-lat-pulldown",
    name: "Wide-Grip Lat Pulldown",
    instructions: [
      "Lock thighs snugly under pads, grip bar with wide overhand grip.",
      "Pull bar down toward upper collarbones by drawing elbows down to sides.",
      "Keep chest high and proud, avoiding excessive backward lean.",
      "Control the bar back up until full lat stretch is attained."
    ],
    primary_muscles: ["Back"],
    secondary_muscles: ["Biceps", "Shoulders"],
    equipment: "Cable",
    difficulty: "Beginner",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Strict Pull-up", "Seated Cable Row"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-seated-cable-row",
    name: "Seated Cable Row",
    instructions: [
      "Sit on cable bench with feet on footplates, knees softly bent.",
      "Grip V-bar handle with neutral grip, maintaining upright chest.",
      "Pull handle toward belly button, tucking elbows and squeezing mid-back.",
      "Resist weight smoothly as arms extend forward for full stretch."
    ],
    primary_muscles: ["Back"],
    secondary_muscles: ["Biceps", "Shoulders"],
    equipment: "Cable",
    difficulty: "Beginner",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Barbell Bent-Over Row", "Single-Arm Dumbbell Row"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-t-bar-row",
    name: "T-Bar Row Machine",
    instructions: [
      "Step onto platform and grab handles with overhand or neutral grip.",
      "Brace chest against pad (or maintain rigid 45-degree hip hinge).",
      "Pull handles toward chest, squeezing lats and rhomboids at peak.",
      "Lower under control for deep back stretch."
    ],
    primary_muscles: ["Back"],
    secondary_muscles: ["Biceps", "Shoulders"],
    equipment: "Machine",
    difficulty: "Intermediate",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Barbell Bent-Over Row", "Seated Cable Row"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-straight-arm-pulldown",
    name: "Straight-Arm Cable Pulldown",
    instructions: [
      "Attach straight or lat bar to high pulley with overhand grip.",
      "Step back slightly with soft knees and slight forward torso hinge.",
      "Keeping arms extended with only slight elbow unlock, sweep bar down to thighs.",
      "Squeeze lats hard at bottom, then raise slowly to eye level."
    ],
    primary_muscles: ["Back"],
    secondary_muscles: ["Core", "Triceps"],
    equipment: "Cable",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Dumbbell Pullover", "Lat Pulldown"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-superman-hold",
    name: "Floor Superman Hold (Ground / Mat)",
    instructions: [
      "Lie face down on exercise mat with arms and legs fully extended.",
      "Simultaneously lift arms, chest, and legs 4-6 inches off the ground.",
      "Contract lower back, glutes, and rear shoulders.",
      "Hold for 3-5 seconds or perform rhythmic extensions."
    ],
    primary_muscles: ["Back", "Glutes"],
    secondary_muscles: ["Hamstrings", "Shoulders"],
    equipment: "Ground / Mat",
    difficulty: "Beginner",
    movement_type: "Isometric",
    media_url: "https://images.unsplash.com/photo-1598266663439-2056e6900339?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Back Extension Machine", "Bird Dog"],
    created_at: "2026-01-01T00:00:00Z"
  },

  // ==========================================
  // SHOULDERS
  // ==========================================
  {
    id: "ex-overhead-press",
    name: "Standing Barbell Overhead Press (OHP)",
    instructions: [
      "Grip bar just outside shoulders with stacked wrists at collarbone.",
      "Squeeze glutes, quads, and abdominal wall.",
      "Tuck chin slightly to clear bar trajectory and press straight upward overhead.",
      "Lock out shoulders with shrug at top, then descend with control to clavicle."
    ],
    primary_muscles: ["Shoulders"],
    secondary_muscles: ["Triceps", "Core", "Chest"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Seated Dumbbell Shoulder Press", "Arnold Press"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-seated-db-press",
    name: "Seated Dumbbell Shoulder Press",
    instructions: [
      "Sit upright with back supported by 90-degree bench.",
      "Hold dumbbells at shoulder height with palms facing forward.",
      "Press dumbbells upward until arms are straight without clacking weights.",
      "Lower under control back to ear level."
    ],
    primary_muscles: ["Shoulders"],
    secondary_muscles: ["Triceps"],
    equipment: "Dumbbell",
    difficulty: "Beginner",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Standing Barbell Overhead Press", "Machine Shoulder Press"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-arnold-press",
    name: "Arnold Dumbbell Press",
    instructions: [
      "Start with dumbbells at chin height, palms facing your chest.",
      "As you press upward, rotate wrists so palms face forward at lockout.",
      "Reverse rotation smoothly on the way down back to starting position."
    ],
    primary_muscles: ["Shoulders"],
    secondary_muscles: ["Triceps"],
    equipment: "Dumbbell",
    difficulty: "Intermediate",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Seated Dumbbell Shoulder Press", "Lateral Raise"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-lateral-raise",
    name: "Dumbbell Lateral Raise",
    instructions: [
      "Stand with dumbbells at sides, slight forward lean.",
      "Maintain a soft 15-degree bend in elbows.",
      "Raise arms out to sides in scapular plane until elbows reach shoulder height.",
      "Lower under control for 2-3 seconds to prevent momentum."
    ],
    primary_muscles: ["Shoulders"],
    secondary_muscles: ["Forearms"],
    equipment: "Dumbbell",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Cable Lateral Raise", "Machine Lateral Raise"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-cable-lateral-raise",
    name: "Single-Arm Cable Lateral Raise",
    instructions: [
      "Set cable pulley to lowest position with single D-handle.",
      "Stand perpendicular to machine, grab handle with far hand across body.",
      "Raise arm sideways in scapular plane until parallel to floor.",
      "Continuous tension through entire range of motion."
    ],
    primary_muscles: ["Shoulders"],
    secondary_muscles: [],
    equipment: "Cable",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Dumbbell Lateral Raise", "Machine Lateral Raise"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-machine-shoulder-press",
    name: "Machine Overhead Shoulder Press",
    instructions: [
      "Adjust seat height so handles sit at shoulder level.",
      "Plant feet, brace core, and press handles upward along guided path.",
      "Lower steadily until hands reach chin height."
    ],
    primary_muscles: ["Shoulders"],
    secondary_muscles: ["Triceps"],
    equipment: "Machine",
    difficulty: "Beginner",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Seated Dumbbell Shoulder Press", "Barbell OHP"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-face-pulls",
    name: "Cable Face Pull",
    instructions: [
      "Attach rope to cable pulley set at eye level.",
      "Grip ends with thumbs facing backwards.",
      "Pull rope straight toward bridge of nose, separating hands wide.",
      "Squeeze rear deltoids and rotator cuff for 1 full second."
    ],
    primary_muscles: ["Shoulders"],
    secondary_muscles: ["Back"],
    equipment: "Cable",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Rear Delt Dumbbell Flye", "Reverse Pec Deck"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-rear-delt-flye",
    name: "Dumbbell Rear Delt Flye",
    instructions: [
      "Hinge forward at hips until torso is almost parallel to floor.",
      "With slight elbow bend, raise dumbbells outward to sides like wings.",
      "Squeeze rear deltoids and upper back at top before slow descent."
    ],
    primary_muscles: ["Shoulders", "Back"],
    secondary_muscles: [],
    equipment: "Dumbbell",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Cable Face Pull", "Reverse Pec Deck"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-pike-pushups",
    name: "Pike Push-ups (Ground / Mat)",
    instructions: [
      "Begin in standard push-up position, then walk feet forward into an inverted V-shape.",
      "Lower head toward floor in front of hands by bending elbows diagonally back.",
      "Press through palms to return to pike position, overloading front deltoids."
    ],
    primary_muscles: ["Shoulders"],
    secondary_muscles: ["Triceps", "Core"],
    equipment: "Ground / Mat",
    difficulty: "Intermediate",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Handstand Push-ups", "Overhead Press"],
    created_at: "2026-01-01T00:00:00Z"
  },

  // ==========================================
  // LEGS - QUADS, HAMSTRINGS, GLUTES, CALVES
  // ==========================================
  {
    id: "ex-barbell-squat",
    name: "Barbell Back Squat",
    instructions: [
      "Rest barbell across upper traps, feet shoulder-width, toes out 15 degrees.",
      "Brace core 360 degrees and break at hips and knees simultaneously.",
      "Descend until hip crease is below knee cap.",
      "Drive upward forcefully through midfoot back to full standing lockout."
    ],
    primary_muscles: ["Quads", "Glutes"],
    secondary_muscles: ["Hamstrings", "Core", "Calves"],
    equipment: "Barbell",
    difficulty: "Advanced",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Front Squat", "Leg Press", "Goblet Squat"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-front-squat",
    name: "Barbell Front Squat",
    instructions: [
      "Rest bar across anterior deltoids in front rack position with elbows high.",
      "Maintain upright torso posture as you descend into deep squat.",
      "Drives massive quad quad hypertrophy and upper back strength."
    ],
    primary_muscles: ["Quads"],
    secondary_muscles: ["Glutes", "Core"],
    equipment: "Barbell",
    difficulty: "Advanced",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Barbell Back Squat", "Goblet Squat"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-leg-press",
    name: "45-Degree Leg Press",
    instructions: [
      "Seat back firmly against padding, feet shoulder-width in center of sled.",
      "Lower sled slowly until knees reach roughly 90 degrees.",
      "Press the sled up through mid-foot without hyper-extending knees."
    ],
    primary_muscles: ["Quads"],
    secondary_muscles: ["Glutes", "Hamstrings"],
    equipment: "Machine",
    difficulty: "Beginner",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Barbell Back Squat", "Hack Squat"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-hack-squat",
    name: "Hack Squat Machine",
    instructions: [
      "Step into machine with shoulders under pads and back pressed to support.",
      "Feet forward at shoulder-width, descend smoothly to full knee flexion.",
      "Push through heels and midfoot for extreme quad isolation."
    ],
    primary_muscles: ["Quads"],
    secondary_muscles: ["Glutes"],
    equipment: "Machine",
    difficulty: "Intermediate",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Leg Press", "Barbell Back Squat"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-bulgarian-split-squat",
    name: "Bulgarian Split Squat",
    instructions: [
      "Place one foot elevated rearward on a bench or box behind you.",
      "Hold dumbbells at sides, descend until back knee approaches floor.",
      "Drive through lead foot heel and midfoot to return to top."
    ],
    primary_muscles: ["Quads", "Glutes"],
    secondary_muscles: ["Hamstrings", "Calves", "Core"],
    equipment: "Dumbbell",
    difficulty: "Intermediate",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Walking Dumbbell Lunges", "Leg Press"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-db-walking-lunges",
    name: "Walking Dumbbell Lunges",
    instructions: [
      "Hold dumbbells at sides with upright posture.",
      "Step forward into lunge, lowering back knee until 1 inch off ground.",
      "Push off front foot directly into next stride forward."
    ],
    primary_muscles: ["Quads", "Glutes"],
    secondary_muscles: ["Hamstrings", "Calves"],
    equipment: "Dumbbell",
    difficulty: "Beginner",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Bulgarian Split Squat", "Bodyweight Walking Lunges"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-goblet-squat",
    name: "Dumbbell Goblet Squat",
    instructions: [
      "Hold single dumbbell vertically against chest with both palms cupping top.",
      "Keep elbows tucked, feet slightly wider than shoulder width.",
      "Squat down between knees while maintaining vertical torso.",
      "Drive back to standing lockout."
    ],
    primary_muscles: ["Quads", "Glutes"],
    secondary_muscles: ["Core"],
    equipment: "Dumbbell",
    difficulty: "Beginner",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Barbell Back Squat", "Bodyweight Air Squats"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-leg-extension",
    name: "Leg Extension Machine",
    instructions: [
      "Sit back against backrest with knees aligned with machine pivot.",
      "Position lower pad above ankles and extend knees to full lockout.",
      "Hold peak contraction for 1 second, then lower with slow tempo."
    ],
    primary_muscles: ["Quads"],
    secondary_muscles: [],
    equipment: "Machine",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Barbell Back Squat", "Goblet Squat"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-romanian-deadlift",
    name: "Romanian Deadlift (RDL)",
    instructions: [
      "Hold barbell in front of thighs with slight knee softness.",
      "Hinge hips backward until deep hamstring stretch is felt.",
      "Keep bar sliding against shins with flat spine.",
      "Squeeze glutes and drive hips forward to return tall."
    ],
    primary_muscles: ["Hamstrings", "Glutes"],
    secondary_muscles: ["Back", "Core"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Dumbbell RDL", "Seated Leg Curl"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-db-rdl",
    name: "Dumbbell Romanian Deadlift",
    instructions: [
      "Hold pair of dumbbells resting on thighs.",
      "Hinge at hips, pushing glutes backward while keeping spine neutral.",
      "Descend until mid-shin level, feeling intense hamstring tension.",
      "Contract glutes and hamstrings to snap hips forward."
    ],
    primary_muscles: ["Hamstrings", "Glutes"],
    secondary_muscles: ["Core", "Forearms"],
    equipment: "Dumbbell",
    difficulty: "Beginner",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Romanian Deadlift (Barbell)", "Lying Leg Curl"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-leg-curl",
    name: "Seated Leg Curl",
    instructions: [
      "Adjust thigh pad firmly down to lock quads.",
      "Place Achilles tendon area on the lever roller pad.",
      "Curl legs downward under full control, squeezing hamstrings at bottom.",
      "Control the eccentric phase for 2 to 3 seconds."
    ],
    primary_muscles: ["Hamstrings"],
    secondary_muscles: ["Calves"],
    equipment: "Machine",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Romanian Deadlift", "Glute Bridge"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-barbell-hip-thrust",
    name: "Barbell Hip Thrust",
    instructions: [
      "Position upper back across flat bench with padded barbell across hips.",
      "Feet planted flat, shoulder-width apart, shins vertical at top.",
      "Drive through heels to extend hips fully until thighs and torso align.",
      "Squeeze glutes with maximum tension for 1 second at apex."
    ],
    primary_muscles: ["Glutes"],
    secondary_muscles: ["Hamstrings", "Quads"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Glute Bridge", "Romanian Deadlift"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-glute-bridge-mat",
    name: "Floor Glute Bridge (Ground / Mat)",
    instructions: [
      "Lie face up on mat, knees bent at 90 degrees, feet flat on floor.",
      "Push through heels, lifting hips off mat until knees, hips, shoulders form a line.",
      "Squeeze glutes hard at top for 2 seconds before lowering."
    ],
    primary_muscles: ["Glutes"],
    secondary_muscles: ["Hamstrings", "Core"],
    equipment: "Ground / Mat",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1598266663439-2056e6900339?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Barbell Hip Thrust", "Donkey Kicks"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-air-squats-mat",
    name: "Bodyweight Air Squats (Ground / Mat)",
    instructions: [
      "Stand tall, feet shoulder-width apart, arms held out for balance.",
      "Squat down keeping chest proud and knees tracking with toes.",
      "Break parallel, then push through ground back to standing position."
    ],
    primary_muscles: ["Quads", "Glutes"],
    secondary_muscles: ["Hamstrings", "Calves"],
    equipment: "Ground / Mat",
    difficulty: "Beginner",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Goblet Squat", "Wall Sit"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-calf-raise",
    name: "Standing Calf Raise",
    instructions: [
      "Stand on balls of feet on elevated block or calf machine platform.",
      "Lower heels down for deep 2-second gastrocnemius stretch.",
      "Explosively press through big toes up onto tiptoes."
    ],
    primary_muscles: ["Calves"],
    secondary_muscles: [],
    equipment: "Machine",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Seated Calf Raise"],
    created_at: "2026-01-01T00:00:00Z"
  },

  // ==========================================
  // ARMS - BICEPS, TRICEPS, FOREARMS
  // ==========================================
  {
    id: "ex-barbell-curl",
    name: "Standing Barbell Bicep Curl",
    instructions: [
      "Hold straight or EZ bar with shoulder-width underhand grip.",
      "Pin elbows firmly against sides and stand upright.",
      "Curl bar upward in a smooth arc until biceps are fully contracted.",
      "Lower under control with 2-second eccentric tempo."
    ],
    primary_muscles: ["Biceps"],
    secondary_muscles: ["Forearms"],
    equipment: "Barbell",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Incline Dumbbell Bicep Curl", "Preacher Curl"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-incline-db-curl",
    name: "Incline Dumbbell Bicep Curl",
    instructions: [
      "Adjust bench to 45-60 degree incline, sit back with dumbbells hanging straight down.",
      "Keep elbows pinned backward for maximum bicep stretch.",
      "Supinate wrists as you curl dumbbells toward shoulders."
    ],
    primary_muscles: ["Biceps"],
    secondary_muscles: ["Forearms"],
    equipment: "Dumbbell",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Barbell Bicep Curl", "Hammer Curl"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-hammer-curl",
    name: "Dumbbell Hammer Curl",
    instructions: [
      "Stand tall holding dumbbells with neutral palms-facing grip.",
      "Curl weights upward while maintaining neutral wrist orientation.",
      "Overloads the brachialis and brachioradialis for dense arm thickness."
    ],
    primary_muscles: ["Biceps", "Forearms"],
    secondary_muscles: [],
    equipment: "Dumbbell",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Cable Rope Hammer Curl", "Barbell Curl"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-preacher-curl",
    name: "Preacher Curl Machine",
    instructions: [
      "Rest armpits snugly over preacher bench pad, chest against support.",
      "Grasp handles with underhand grip and curl upward smoothly.",
      "Prevents any shoulder cheating or swinging momentum."
    ],
    primary_muscles: ["Biceps"],
    secondary_muscles: ["Forearms"],
    equipment: "Machine",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Incline Dumbbell Bicep Curl", "Barbell Curl"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-cable-tricep-pushdown",
    name: "Cable Tricep Pushdown (Rope)",
    instructions: [
      "Set cable pulley to top with rope attachment.",
      "Grab rope ends, pin elbows to ribcage, and push rope straight down.",
      "Flare ends outward at full extension for intense peak contraction."
    ],
    primary_muscles: ["Triceps"],
    secondary_muscles: [],
    equipment: "Cable",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Skull Crushers", "Close Grip Bench Press"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-skull-crushers",
    name: "Barbell Skull Crusher (Lying Tricep Extension)",
    instructions: [
      "Lie on flat bench holding EZ bar or barbell directly above chest.",
      "Angle upper arms slightly backward toward head.",
      "Bend only at elbows to lower the bar toward forehead.",
      "Extend elbows to press the bar back up."
    ],
    primary_muscles: ["Triceps"],
    secondary_muscles: ["Forearms"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Cable Tricep Pushdown", "Overhead Cable Extension"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-overhead-cable-tricep",
    name: "Overhead Cable Tricep Extension",
    instructions: [
      "Face away from high cable pulley holding rope over head.",
      "Hinge torso slightly forward with staggered stance.",
      "Extend arms forward and upward, locking out triceps in stretched position."
    ],
    primary_muscles: ["Triceps"],
    secondary_muscles: [],
    equipment: "Cable",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Skull Crushers", "Cable Tricep Pushdown"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-bench-dips-ground",
    name: "Bench Tricep Dips (Ground / Mat)",
    instructions: [
      "Place palms on edge of bench or ground behind you, fingers forward.",
      "Legs extended forward with heels on ground.",
      "Lower hips toward floor by bending elbows to 90 degrees.",
      "Press through palms to lockout."
    ],
    primary_muscles: ["Triceps"],
    secondary_muscles: ["Chest", "Shoulders"],
    equipment: "Ground / Mat",
    difficulty: "Beginner",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Diamond Push-ups", "Cable Tricep Pushdown"],
    created_at: "2026-01-01T00:00:00Z"
  },

  // ==========================================
  // CORE & GROUND WORKOUTS (MAT / FLOOR)
  // ==========================================
  {
    id: "ex-hanging-leg-raise",
    name: "Hanging Leg Raise",
    instructions: [
      "Hang from pull-up bar with overhand grip, shoulders engaged.",
      "Posteriorly tilt pelvis and engage abs before initiating movement.",
      "Raise legs with straight knees until feet reach waist or bar level.",
      "Lower legs slowly back down under strict control."
    ],
    primary_muscles: ["Core"],
    secondary_muscles: ["Forearms"],
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1598266663439-2056e6900339?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Plank Hold", "Floor Crunches"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-cable-crunch",
    name: "Kneeling Cable Crunch",
    instructions: [
      "Kneel a few feet in front of high cable with rope held next to ears.",
      "Fix hips in space and curl ribcage toward pelvic bone.",
      "Hold peak contraction for 1 second, then uncurl torso smoothly."
    ],
    primary_muscles: ["Core"],
    secondary_muscles: [],
    equipment: "Cable",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Floor Crunches", "Ab Wheel Rollout"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-plank-hold-mat",
    name: "Forearm Plank Hold (Ground / Mat)",
    instructions: [
      "Rest on forearms and toes on exercise mat, elbows under shoulders.",
      "Brace abs tightly as if preparing for a punch, squeeze glutes.",
      "Maintain flat rigid horizontal line from head to heels."
    ],
    primary_muscles: ["Core"],
    secondary_muscles: ["Shoulders", "Glutes"],
    equipment: "Ground / Mat",
    difficulty: "Beginner",
    movement_type: "Isometric",
    media_url: "https://images.unsplash.com/photo-1598266663439-2056e6900339?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Side Plank", "Dead Bug"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-side-plank-mat",
    name: "Side Plank Hold (Ground / Mat)",
    instructions: [
      "Lie on your side with elbow directly beneath shoulder, feet stacked.",
      "Lift hips off ground until body forms a straight diagonal line.",
      "Focus intensely on contracting lower obliques and lateral hip."
    ],
    primary_muscles: ["Core"],
    secondary_muscles: ["Glutes", "Shoulders"],
    equipment: "Ground / Mat",
    difficulty: "Beginner",
    movement_type: "Isometric",
    media_url: "https://images.unsplash.com/photo-1598266663439-2056e6900339?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Plank Hold", "Russian Twists"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-floor-crunches-mat",
    name: "Standard Floor Crunches (Ground / Mat)",
    instructions: [
      "Lie supine on mat with knees bent at 90 degrees and feet flat.",
      "Place fingers lightly behind ears without pulling neck.",
      "Curl ribcage toward pelvis, raising shoulder blades off mat.",
      "Exhale and squeeze abs at top before slow descent."
    ],
    primary_muscles: ["Core"],
    secondary_muscles: [],
    equipment: "Ground / Mat",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1598266663439-2056e6900339?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Bicycle Crunches", "Kneeling Cable Crunch"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-bicycle-crunches-mat",
    name: "Bicycle Crunches (Ground / Mat)",
    instructions: [
      "Lie on mat with knees lifted to tabletop and hands behind head.",
      "Rotate torso to bring right elbow toward left knee as right leg extends.",
      "Alternate sides smoothly in pedaling motion, maintaining oblique engagement."
    ],
    primary_muscles: ["Core"],
    secondary_muscles: [],
    equipment: "Ground / Mat",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1598266663439-2056e6900339?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Russian Twists", "Floor Crunches"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-russian-twists-mat",
    name: "Russian Twists (Ground / Mat)",
    instructions: [
      "Sit on mat with knees bent, lean torso back at 45 degrees.",
      "Elevate feet slightly for advanced balance, or keep heels grounded.",
      "Rotate torso and touch hands (or dumbbell) to floor on each side."
    ],
    primary_muscles: ["Core"],
    secondary_muscles: [],
    equipment: "Ground / Mat",
    difficulty: "Beginner",
    movement_type: "Isolation",
    media_url: "https://images.unsplash.com/photo-1598266663439-2056e6900339?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Side Plank", "Bicycle Crunches"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-mountain-climbers-mat",
    name: "Mountain Climbers (Ground / Mat)",
    instructions: [
      "Begin in full push-up high plank position on mat.",
      "Rapidly drive one knee toward chest, then quickly switch legs.",
      "Keep hips low and core braced throughout conditioning sprint."
    ],
    primary_muscles: ["Core", "Full Body"],
    secondary_muscles: ["Shoulders", "Quads"],
    equipment: "Ground / Mat",
    difficulty: "Beginner",
    movement_type: "Cardio",
    media_url: "https://images.unsplash.com/photo-1598266663439-2056e6900339?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Burpees", "Plank Hold"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-dead-bug-mat",
    name: "Dead Bug (Ground / Mat)",
    instructions: [
      "Lie on back with arms pointing to ceiling and knees at 90 degrees.",
      "Flatten lower back into the floor with no gap.",
      "Slowly extend opposite arm and opposite leg toward floor without arching back.",
      "Return and repeat on opposite side."
    ],
    primary_muscles: ["Core"],
    secondary_muscles: [],
    equipment: "Ground / Mat",
    difficulty: "Beginner",
    movement_type: "Isometric",
    media_url: "https://images.unsplash.com/photo-1598266663439-2056e6900339?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Bird Dog", "Plank Hold"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-bird-dog-mat",
    name: "Bird Dog (Ground / Mat)",
    instructions: [
      "Start on all fours with hands under shoulders, knees under hips.",
      "Simultaneously extend right arm forward and left leg backward until parallel with floor.",
      "Hold for 1 second, maintaining square pelvis, then alternate sides."
    ],
    primary_muscles: ["Core", "Back"],
    secondary_muscles: ["Glutes"],
    equipment: "Ground / Mat",
    difficulty: "Beginner",
    movement_type: "Isometric",
    media_url: "https://images.unsplash.com/photo-1598266663439-2056e6900339?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Dead Bug", "Superman Hold"],
    created_at: "2026-01-01T00:00:00Z"
  },

  // ==========================================
  // FUNCTIONAL & KETTLEBELL & FULL BODY
  // ==========================================
  {
    id: "ex-kettlebell-swing",
    name: "Kettlebell Swing",
    instructions: [
      "Stand with feet shoulder-width, kettlebell on ground slightly in front.",
      "Hinge at hips, hike kettlebell back between legs.",
      "Explosively snap hips forward and squeeze glutes, driving bell to chest level.",
      "Let bell swing back down naturally into hip hinge; do not squat."
    ],
    primary_muscles: ["Glutes", "Hamstrings", "Full Body"],
    secondary_muscles: ["Core", "Back", "Shoulders"],
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Romanian Deadlift", "Barbell Hip Thrust"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-kettlebell-clean-press",
    name: "Kettlebell Clean & Press",
    instructions: [
      "Hike kettlebell and clean it smoothly into rack position on forearm.",
      "Dip knees slightly and drive overhead to full vertical lockout.",
      "Lower under control back to rack, then repeat."
    ],
    primary_muscles: ["Shoulders", "Full Body"],
    secondary_muscles: ["Core", "Triceps", "Glutes"],
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Overhead Press", "Dumbbell Thrusters"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-burpees-mat",
    name: "Full Body Burpees (Ground / Mat)",
    instructions: [
      "From standing, drop hands to floor and kick feet back into high plank.",
      "Lower chest to floor into push-up.",
      "Press up, snap feet forward under hips, and jump into air with hands overhead."
    ],
    primary_muscles: ["Full Body", "Core"],
    secondary_muscles: ["Chest", "Quads", "Shoulders"],
    equipment: "Ground / Mat",
    difficulty: "Intermediate",
    movement_type: "Cardio",
    media_url: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Mountain Climbers", "Jump Squats"],
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "ex-db-thrusters",
    name: "Dumbbell Thrusters",
    instructions: [
      "Hold dumbbells at shoulder height with neutral grip.",
      "Perform a full deep front squat.",
      "Drive upward out of the squat with hip extension, using momentum to press dumbbells overhead."
    ],
    primary_muscles: ["Quads", "Shoulders", "Full Body"],
    secondary_muscles: ["Glutes", "Triceps", "Core"],
    equipment: "Dumbbell",
    difficulty: "Intermediate",
    movement_type: "Compound",
    media_url: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=60",
    alternatives: ["Kettlebell Clean & Press", "Goblet Squat"],
    created_at: "2026-01-01T00:00:00Z"
  }
];
