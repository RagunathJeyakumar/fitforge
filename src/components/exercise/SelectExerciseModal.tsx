"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  X,
  Plus,
  Check,
  Dumbbell,
  Layers,
  Sparkles,
  RotateCcw,
  Activity,
  Flame,
  ShieldCheck,
  ChevronRight,
  Info,
} from "lucide-react";
import { Exercise, MuscleGroup, EquipmentType, MovementType } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SelectExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise) => void;
  title?: string;
  subtitle?: string;
  alreadySelectedIds?: string[];
}

export const SelectExerciseModal: React.FC<SelectExerciseModalProps> = ({
  isOpen,
  onClose,
  onSelectExercise,
  title = "Select Exercise",
  subtitle = "Filter by body part, equipment, and movement mechanics",
  alreadySelectedIds = [],
}) => {
  // Store all exercises from hook or data
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState<string>("All");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("All");
  const [selectedMovement, setSelectedMovement] = useState<string>("All");
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  // Lazy-load initial exercises if store is empty or loaded
  useEffect(() => {
    import("@/lib/data/initialExercises").then((mod) => {
      // Check localStorage for custom exercises
      let custom: Exercise[] = [];
      try {
        const stored = localStorage.getItem("fitforge_custom_exercises");
        if (stored) custom = JSON.parse(stored);
      } catch (e) {
        // ignore
      }
      setExercises([...mod.INITIAL_EXERCISES, ...custom]);
    });
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filter Categories
  const muscleGroups: { label: string; value: string }[] = [
    { label: "All Muscles", value: "All" },
    { label: "Chest", value: "Chest" },
    { label: "Back", value: "Back" },
    { label: "Shoulders", value: "Shoulders" },
    { label: "Biceps", value: "Biceps" },
    { label: "Triceps", value: "Triceps" },
    { label: "Quads", value: "Quads" },
    { label: "Hamstrings", value: "Hamstrings" },
    { label: "Glutes", value: "Glutes" },
    { label: "Core & Abs", value: "Core" },
    { label: "Calves", value: "Calves" },
    { label: "Full Body", value: "Full Body" },
  ];

  const equipmentCategories: { label: string; value: string; icon?: string }[] = [
    { label: "All Equipment", value: "All" },
    { label: "Dumbbell", value: "Dumbbell" },
    { label: "Barbell", value: "Barbell" },
    { label: "Machine", value: "Machine" },
    { label: "Ground / Mat", value: "Ground / Mat" },
    { label: "Cable", value: "Cable" },
    { label: "Bodyweight", value: "Bodyweight" },
    { label: "Kettlebell", value: "Kettlebell" },
    { label: "Smith Machine", value: "Smith Machine" },
    { label: "Resistance Band", value: "Resistance Band" },
  ];

  const movementMechanics: { label: string; value: string }[] = [
    { label: "All Movements", value: "All" },
    { label: "Compound (Multi-joint)", value: "Compound" },
    { label: "Isolation (Single-joint)", value: "Isolation" },
    { label: "Cardio", value: "Cardio" },
    { label: "Isometric", value: "Isometric" },
  ];

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedMuscle("All");
    setSelectedEquipment("All");
    setSelectedMovement("All");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedMuscle !== "All" ||
    selectedEquipment !== "All" ||
    selectedMovement !== "All";

  // Filter computation
  const filteredExercises = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return exercises.filter((ex) => {
      // Search text match
      const matchesSearch =
        q === "" ||
        ex.name.toLowerCase().includes(q) ||
        ex.primary_muscles.some((m) => m.toLowerCase().includes(q)) ||
        ex.secondary_muscles.some((m) => m.toLowerCase().includes(q)) ||
        ex.equipment.toLowerCase().includes(q);

      // Muscle match
      const matchesMuscle =
        selectedMuscle === "All" ||
        ex.primary_muscles.includes(selectedMuscle as MuscleGroup) ||
        ex.secondary_muscles.includes(selectedMuscle as MuscleGroup);

      // Equipment match
      const matchesEquipment =
        selectedEquipment === "All" || ex.equipment === selectedEquipment;

      // Movement match
      const matchesMovement =
        selectedMovement === "All" || ex.movement_type === selectedMovement;

      return matchesSearch && matchesMuscle && matchesEquipment && matchesMovement;
    });
  }, [exercises, searchQuery, selectedMuscle, selectedEquipment, selectedMovement]);

  // Color mapper for equipment badges
  const getEquipmentBadgeColor = (eq: EquipmentType) => {
    switch (eq) {
      case "Dumbbell":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "Barbell":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Machine":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Ground / Mat":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "Cable":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "Bodyweight":
        return "bg-lime-500/10 text-lime-400 border-lime-500/20";
      case "Kettlebell":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      default:
        return "bg-charcoal-800 text-muted-foreground border-white/10";
    }
  };

  const difficultyColors = {
    Beginner: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    Intermediate: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    Advanced: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl h-[94dvh] sm:h-auto sm:max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-charcoal-900 border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between shrink-0 bg-charcoal-950/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-lime-electric/10 border border-lime-electric/20 flex items-center justify-center text-lime-electric shadow-lime-sm">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {title}
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-lime-electric/10 text-lime-electric border border-lime-electric/20">
                  {filteredExercises.length} Exercises
                </span>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-white hover:bg-charcoal-800 transition-colors"
            title="Close (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Filter Header Section */}
        <div className="p-3 sm:p-4 border-b border-white/5 bg-charcoal-950/20 space-y-2.5 sm:space-y-3 shrink-0">
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search exercise name or muscle (e.g., Incline, Bench, Squat, Push-up, Lats)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full bg-charcoal-950 border border-white/10 rounded-2xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-muted-foreground/70 focus:outline-none focus:border-lime-electric focus:ring-1 focus:ring-lime-electric/40 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Row 1: Target Muscle / Body Part */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5">
                <Activity className="h-3 w-3 text-lime-electric" />
                Target Muscle
              </span>
              {selectedMuscle !== "All" && (
                <span className="text-[10px] text-lime-electric font-semibold">
                  Active: {selectedMuscle}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {muscleGroups.map((mg) => {
                const isActive = selectedMuscle === mg.value;
                return (
                  <button
                    key={mg.value}
                    onClick={() => setSelectedMuscle(mg.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border shrink-0",
                      isActive
                        ? "bg-lime-electric text-charcoal-950 border-lime-electric shadow-lime-sm scale-[1.02]"
                        : "bg-charcoal-900 text-muted-foreground border-white/5 hover:border-white/15 hover:text-white hover:bg-charcoal-800"
                    )}
                  >
                    {mg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter Row 2: Equipment (Dumbbells, Machine, Ground/Mat, Cable, etc.) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5">
                <Dumbbell className="h-3 w-3 text-cyan-400" />
                Equipment & Modality
              </span>
              {selectedEquipment !== "All" && (
                <span className="text-[10px] text-cyan-400 font-semibold">
                  Active: {selectedEquipment}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {equipmentCategories.map((eq) => {
                const isActive = selectedEquipment === eq.value;
                const isGround = eq.value === "Ground / Mat";
                return (
                  <button
                    key={eq.value}
                    onClick={() => setSelectedEquipment(eq.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border shrink-0 flex items-center gap-1",
                      isActive
                        ? "bg-cyan-400 text-charcoal-950 border-cyan-400 shadow-md scale-[1.02]"
                        : isGround
                        ? "bg-emerald-950/30 text-emerald-300 border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-900/30"
                        : "bg-charcoal-900 text-muted-foreground border-white/5 hover:border-white/15 hover:text-white hover:bg-charcoal-800"
                    )}
                  >
                    {isGround && <Sparkles className="h-3 w-3 text-emerald-400" />}
                    {eq.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter Row 3: Movement Mechanics & Quick Clear */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/80 mr-1 hidden sm:inline">
                Mechanics:
              </span>
              {movementMechanics.map((mv) => {
                const isActive = selectedMovement === mv.value;
                return (
                  <button
                    key={mv.value}
                    onClick={() => setSelectedMovement(mv.value)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap border shrink-0",
                      isActive
                        ? "bg-charcoal-700 text-white border-lime-electric/50"
                        : "bg-charcoal-950/60 text-muted-foreground border-white/5 hover:text-white hover:bg-charcoal-800"
                    )}
                  >
                    {mv.label}
                  </button>
                );
              })}
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-[11px] font-bold text-lime-electric hover:underline flex items-center gap-1 ml-auto"
              >
                <RotateCcw className="h-3 w-3" />
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* Exercise List / Cards Grid */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 min-h-0 space-y-2.5">
          {filteredExercises.length === 0 ? (
            <div className="py-14 px-4 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-charcoal-800 border border-white/5 flex items-center justify-center mx-auto text-muted-foreground">
                <Dumbbell className="h-8 w-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">No exercises match your filters</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Try clearing some filters or searching for a broader term like &quot;chest&quot;, &quot;squat&quot;, or &quot;press&quot;.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="text-xs font-bold border-lime-electric/30 text-lime-electric hover:bg-lime-electric/10"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredExercises.map((ex) => {
                const isAlreadySelected = alreadySelectedIds.includes(ex.id);
                const isExpanded = expandedExerciseId === ex.id;

                return (
                  <div
                    key={ex.id}
                    className="p-3.5 sm:p-4 rounded-2xl bg-charcoal-950/80 hover:bg-charcoal-800/90 border border-white/5 hover:border-lime-electric/40 transition-all group flex flex-col justify-between gap-2 shadow-sm"
                  >
                    <div>
                      {/* Top Badges & Name */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-sm group-hover:text-lime-electric transition-colors line-clamp-1">
                            {ex.name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            {/* Equipment Badge */}
                            <span
                              className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                                getEquipmentBadgeColor(ex.equipment)
                              )}
                            >
                              {ex.equipment}
                            </span>

                            {/* Primary Muscles */}
                            {ex.primary_muscles.map((muscle) => (
                              <span
                                key={muscle}
                                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-charcoal-800 text-neutral-300 border border-white/5"
                              >
                                {muscle}
                              </span>
                            ))}

                            {/* Movement Type */}
                            <span className="text-[10px] font-semibold text-muted-foreground px-1.5 py-0.5 rounded bg-charcoal-900 border border-white/5">
                              {ex.movement_type}
                            </span>
                          </div>
                        </div>

                        {/* Add Button */}
                        <Button
                          size="sm"
                          variant={isAlreadySelected ? "secondary" : "default"}
                          onClick={() => {
                            onSelectExercise(ex);
                            onClose();
                          }}
                          className={cn(
                            "h-9 px-3 rounded-xl font-bold text-xs shrink-0 transition-transform active:scale-95",
                            isAlreadySelected
                              ? "bg-charcoal-800 text-muted-foreground border border-white/10 hover:bg-charcoal-700 hover:text-white"
                              : "bg-lime-electric text-charcoal-950 hover:bg-lime-400 font-black shadow-lime-sm"
                          )}
                        >
                          {isAlreadySelected ? (
                            <>
                              <Check className="h-3.5 w-3.5 mr-1 text-lime-electric" />
                              Added
                            </>
                          ) : (
                            <>
                              <Plus className="h-3.5 w-3.5 mr-1" />
                              Add
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Brief Instructions Snippet */}
                      {ex.instructions && ex.instructions.length > 0 && (
                        <div className="mt-2 text-[11px] text-muted-foreground/80 line-clamp-1 group-hover:text-muted-foreground transition-colors">
                          {ex.instructions[0]}
                        </div>
                      )}
                    </div>

                    {/* Secondary muscles info & difficulty */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>
                        {ex.secondary_muscles.length > 0 ? (
                          <>Also hits: {ex.secondary_muscles.join(", ")}</>
                        ) : (
                          <>{ex.difficulty} Level</>
                        )}
                      </span>
                      <span className={cn("px-1.5 py-0.2 rounded font-semibold", difficultyColors[ex.difficulty])}>
                        {ex.difficulty}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-white/5 bg-charcoal-950/60 flex items-center justify-between text-xs text-muted-foreground shrink-0 pb-safe pb-4">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white">{filteredExercises.length}</span>
            <span>of {exercises.length} total exercises shown</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-white"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
