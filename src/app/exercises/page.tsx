"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Star,
  BookOpen,
  Dumbbell,
  Sparkles,
  X,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFitness } from "@/lib/store/fitnessStore";
import { ExerciseCard } from "@/components/exercise/ExerciseCard";
import { ExerciseDetailModal } from "@/components/exercise/ExerciseDetailModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Exercise, MuscleGroup, EquipmentType, DifficultyLevel } from "@/lib/types";

export default function ExerciseLibraryPage() {
  const {
    exercises,
    favoriteExerciseIds,
    toggleFavoriteExercise,
    addCustomExercise,
  } = useFitness();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState<string>("All");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [activeDetailExercise, setActiveDetailExercise] = useState<Exercise | null>(null);

  // Custom Exercise Creation Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customMuscle, setCustomMuscle] = useState<MuscleGroup>("Chest");
  const [customEquipment, setCustomEquipment] = useState<EquipmentType>("Barbell");
  const [customDifficulty, setCustomDifficulty] = useState<DifficultyLevel>("Intermediate");
  const [customInstructions, setCustomInstructions] = useState("");

  const muscleGroups: string[] = [
    "All",
    "Chest",
    "Back",
    "Shoulders",
    "Quads",
    "Hamstrings",
    "Glutes",
    "Biceps",
    "Triceps",
    "Core",
    "Calves",
    "Full Body",
  ];

  const equipmentList: string[] = [
    "All",
    "Dumbbell",
    "Machine",
    "Ground / Mat",
    "Barbell",
    "Cable",
    "Bodyweight",
    "Kettlebell",
    "Smith Machine",
    "Resistance Band",
  ];

  const difficulties: string[] = ["All", "Beginner", "Intermediate", "Advanced"];

  // Filter exercises
  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.primary_muscles.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMuscle =
      selectedMuscle === "All" ||
      ex.primary_muscles.includes(selectedMuscle as MuscleGroup) ||
      ex.secondary_muscles.includes(selectedMuscle as MuscleGroup);

    const matchesEquipment =
      selectedEquipment === "All" || ex.equipment === selectedEquipment;

    const matchesDifficulty =
      selectedDifficulty === "All" || ex.difficulty === selectedDifficulty;

    const matchesFavorite = !onlyFavorites || favoriteExerciseIds.includes(ex.id);

    return (
      matchesSearch &&
      matchesMuscle &&
      matchesEquipment &&
      matchesDifficulty &&
      matchesFavorite
    );
  });

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newEx = addCustomExercise({
      name: customName.trim(),
      instructions: customInstructions
        .split("\n")
        .filter((line) => line.trim().length > 0),
      primary_muscles: [customMuscle],
      secondary_muscles: [],
      equipment: customEquipment,
      difficulty: customDifficulty,
      movement_type: "Compound",
    });

    setShowCreateModal(false);
    setCustomName("");
    setCustomInstructions("");
    setActiveDetailExercise(newEx);
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="default" className="text-xs">
                Biomechanics & Form
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Exercise Library
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Curated exercise directory with muscle activations, movement guides, and alternatives.
            </p>
          </div>

          <Button
            variant="default"
            size="lg"
            onClick={() => setShowCreateModal(true)}
            className="h-12 font-black shadow-lime-sm"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Custom Exercise
          </Button>
        </div>

        {/* Search & Filters Toolbar */}
        <div className="space-y-4 p-5 rounded-2xl bg-charcoal-900 border border-white/5">
          {/* Search bar + Favorites toggle */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search exercise name or target muscle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-charcoal-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-lime-electric placeholder:text-muted-foreground"
              />
            </div>

            <Button
              variant={onlyFavorites ? "default" : "secondary"}
              size="sm"
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className="w-full sm:w-auto h-10 px-4 text-xs font-bold gap-1.5"
            >
              <Star className={`h-4 w-4 ${onlyFavorites ? "fill-charcoal-950" : ""}`} />
              Favorites ({favoriteExerciseIds.length})
            </Button>
          </div>

          {/* Muscle Group Horizontal Pill Selector */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Target Muscle Group
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {muscleGroups.map((muscle) => (
                <button
                  key={muscle}
                  onClick={() => setSelectedMuscle(muscle)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${
                    selectedMuscle === muscle
                      ? "bg-lime-electric text-charcoal-950 border-lime-electric shadow-lime-sm"
                      : "bg-charcoal-950 text-muted-foreground border-white/5 hover:text-white"
                  }`}
                >
                  {muscle}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Filters: Equipment & Difficulty */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Equipment
              </label>
              <select
                value={selectedEquipment}
                onChange={(e) => setSelectedEquipment(e.target.value)}
                className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-lime-electric"
              >
                {equipmentList.map((eq) => (
                  <option key={eq} value={eq}>
                    {eq}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-lime-electric"
              >
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Exercises Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing {filteredExercises.length} exercises</span>
          </div>

          {filteredExercises.length === 0 ? (
            <div className="p-12 rounded-2xl bg-charcoal-900/60 border border-white/5 text-center space-y-3">
              <Dumbbell className="h-10 w-10 text-muted-foreground mx-auto" />
              <h3 className="text-base font-bold text-white">No exercises found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No exercises match your current search and filter combination. Try clearing your filters or add a custom exercise.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedMuscle("All");
                  setSelectedEquipment("All");
                  setSelectedDifficulty("All");
                  setOnlyFavorites(false);
                }}
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  isFavorite={favoriteExerciseIds.includes(exercise.id)}
                  onToggleFavorite={(e) => {
                    e.stopPropagation();
                    toggleFavoriteExercise(exercise.id);
                  }}
                  onClick={() => setActiveDetailExercise(exercise)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Exercise Detail Modal */}
        {activeDetailExercise && (
          <ExerciseDetailModal
            exercise={activeDetailExercise}
            onClose={() => setActiveDetailExercise(null)}
            onSelectAlternative={(altName) => {
              const matched = exercises.find(
                (e) => e.name.toLowerCase() === altName.toLowerCase()
              );
              if (matched) setActiveDetailExercise(matched);
            }}
          />
        )}

        {/* Create Custom Exercise Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-3xl bg-charcoal-900 border border-white/10 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white">Create Custom Lift</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCustom} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Exercise Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pendlay Row or Belt Squat"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lime-electric"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                      Target Muscle
                    </label>
                    <select
                      value={customMuscle}
                      onChange={(e) => setCustomMuscle(e.target.value as any)}
                      className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-lime-electric"
                    >
                      {muscleGroups
                        .filter((m) => m !== "All")
                        .map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                      Equipment
                    </label>
                    <select
                      value={customEquipment}
                      onChange={(e) => setCustomEquipment(e.target.value as any)}
                      className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-lime-electric"
                    >
                      {equipmentList
                        .filter((e) => e !== "All")
                        .map((e) => (
                          <option key={e} value={e}>
                            {e}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Coaching Cues & Instructions (one per line)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="1. Set your feet hip-width apart&#10;2. Pull elbows explosively to ribcage&#10;3. Lower with 2 second eccentric"
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    className="w-full bg-charcoal-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-lime-electric"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="default" className="font-bold shadow-lime-sm">
                    Save to Library
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
