"use client";

import React, { useState, useMemo } from "react";
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  Search,
  Check,
  Flame,
  X,
  PieChart,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Target,
  PlusCircle,
  ArrowUpDown,
  Filter,
  Clock,
  Info,
  SlidersHorizontal,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFitness } from "@/lib/store/fitnessStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MealType,
  FoodItem,
  FoodCategory,
  LoggedMealEntry,
  NutritionDailyTargets,
} from "@/lib/types";

const MEAL_TIMES: { type: MealType; label: string; tamilLabel: string; timeHint: string }[] = [
  { type: "breakfast", label: "Breakfast", tamilLabel: "காலை உணவு", timeHint: "07:30 - 09:30 AM" },
  { type: "morning_snack", label: "Mid-Morning", tamilLabel: "காலை சிற்றுண்டி", timeHint: "11:00 - 11:30 AM" },
  { type: "lunch", label: "Lunch", tamilLabel: "மதிய உணவு", timeHint: "01:00 - 02:30 PM" },
  { type: "evening_snack", label: "Evening / Pre-Workout", tamilLabel: "மாலை சிற்றுண்டி", timeHint: "05:00 - 06:30 PM" },
  { type: "post_workout", label: "Post-Workout", tamilLabel: "உடற்பயிற்சி பின் உணவு", timeHint: "07:30 - 08:30 PM" },
  { type: "dinner", label: "Dinner", tamilLabel: "இரவு உணவு", timeHint: "08:30 - 10:00 PM" },
];

const CATEGORY_TABS: { key: string; label: string; tamil: string }[] = [
  { key: "all", label: "All Items", tamil: "அனைத்தும்" },
  { key: "tandoori_grills", label: "🍗 Tandoori & Grills", tamil: "தந்தூரி & கிரில்" },
  { key: "chinese_indochinese", label: "🥢 Chinese & Indo-Chinese", tamil: "சைனீஸ் & நூடுல்ஸ்" },
  { key: "tiffin_breakfast", label: "🥞 Tiffin & Breakfast", tamil: "டிபன்" },
  { key: "rice_curries", label: "🍛 Rice & Curries", tamil: "சாதம் & குழம்பு" },
  { key: "non_veg_specialties", label: "🥩 Non-Veg Specialties", tamil: "அசைவ உணவுகள்" },
  { key: "fitness_staples", label: "⚡ Gym High-Protein", tamil: "ஜிம் உணவுகள்" },
  { key: "lentils_sundal", label: "🌱 Lentils & Sundal", tamil: "சுண்டல் & பயறு" },
  { key: "snacks_beverages", label: "🥥 Drinks & Snacks", tamil: "பானங்கள்" },
];

export default function NutritionPage() {
  const {
    foodDatabase,
    customFoods,
    addCustomFood,
    deleteCustomFood,
    loggedMeals,
    nutritionTargets,
    addMealEntry,
    updateMealEntryServings,
    removeMealEntry,
    updateNutritionTargets,
    clearTodayMeals,
  } = useFitness();

  // Dynamic Date state (defaults to today YYYY-MM-DD)
  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr);

  // Modal states
  const [selectedMealForAdd, setSelectedMealForAdd] = useState<MealType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(null);
  const [servingsMultiplier, setServingsMultiplier] = useState(1);
  const [showMicronutrientsDetail, setShowMicronutrientsDetail] = useState(false);
  const [sortBy, setSortBy] = useState<"recommended" | "protein_desc" | "calories_asc" | "fat_asc" | "name_asc">("recommended");
  const [dietaryFilter, setDietaryFilter] = useState<"all" | "veg" | "non_veg" | "high_protein" | "custom">("all");

  const [isEditTargetsOpen, setIsEditTargetsOpen] = useState(false);
  const [isAddCustomFoodOpen, setIsAddCustomFoodOpen] = useState(false);

  // Targets form state
  const [targetForm, setTargetForm] = useState<NutritionDailyTargets>(nutritionTargets);

  // Custom food form state
  const [customFoodForm, setCustomFoodForm] = useState({
    name: "",
    tamil_name: "",
    category: "fitness_staples" as FoodCategory,
    serving_unit: "1 portion (150g)",
    serving_size_grams: 150,
    calories: 250,
    protein_g: 25,
    carbs_g: 15,
    fiber_g: 2,
    healthy_fat_g: 5,
    saturated_fat_g: 1.5,
    trans_fat_g: 0,
    sodium_mg: 350,
    added_sugar_g: 0,
    cholesterol_mg: 50,
    iron_mg: 2,
    calcium_mg: 50,
    potassium_mg: 300,
  });

  // Date formatted display
  const formattedDate = useMemo(() => {
    try {
      const [year, month, day] = selectedDate.split("-").map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  const isToday = selectedDate === getTodayStr();

  const shiftDate = (days: number) => {
    const [year, month, day] = selectedDate.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() + days);
    const nextStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    setSelectedDate(nextStr);
  };

  // Dynamic meals filtered strictly for the selected date
  const daysMeals = useMemo(() => {
    return loggedMeals.filter((m) => m.logged_at.startsWith(selectedDate));
  }, [loggedMeals, selectedDate]);

  // Compute daily aggregates for the selected date
  const totalCalories = daysMeals.reduce((acc, m) => acc + m.calories, 0);
  const totalProtein = daysMeals.reduce((acc, m) => acc + m.protein_g, 0);
  const totalCarbs = daysMeals.reduce((acc, m) => acc + m.carbs_g, 0);
  const totalFiber = daysMeals.reduce((acc, m) => acc + m.fiber_g, 0);
  const totalHealthyFat = daysMeals.reduce((acc, m) => acc + m.healthy_fat_g, 0);

  // Bad Nutrients totals
  const totalSaturatedFat = daysMeals.reduce(
    (acc, m) => acc + (m.bad_nutrients?.saturated_fat_g || 0),
    0
  );
  const totalTransFat = daysMeals.reduce(
    (acc, m) => acc + (m.bad_nutrients?.trans_fat_g || 0),
    0
  );
  const totalSodium = daysMeals.reduce(
    (acc, m) => acc + (m.bad_nutrients?.sodium_mg || 0),
    0
  );
  const totalAddedSugar = daysMeals.reduce(
    (acc, m) => acc + (m.bad_nutrients?.added_sugar_g || 0),
    0
  );
  const totalCholesterol = daysMeals.reduce(
    (acc, m) => acc + (m.bad_nutrients?.cholesterol_mg || 0),
    0
  );

  // Micronutrients totals
  const totalVitaminA = daysMeals.reduce(
    (acc, m) => acc + (m.micronutrients?.vitamin_a_mcg || 0),
    0
  );
  const totalVitaminC = daysMeals.reduce(
    (acc, m) => acc + (m.micronutrients?.vitamin_c_mg || 0),
    0
  );
  const totalVitaminD = daysMeals.reduce(
    (acc, m) => acc + (m.micronutrients?.vitamin_d_iu || 0),
    0
  );
  const totalVitaminB12 = daysMeals.reduce(
    (acc, m) => acc + (m.micronutrients?.vitamin_b12_mcg || 0),
    0
  );
  const totalIron = daysMeals.reduce(
    (acc, m) => acc + (m.micronutrients?.iron_mg || 0),
    0
  );
  const totalCalcium = daysMeals.reduce(
    (acc, m) => acc + (m.micronutrients?.calcium_mg || 0),
    0
  );
  const totalPotassium = daysMeals.reduce(
    (acc, m) => acc + (m.micronutrients?.potassium_mg || 0),
    0
  );
  const totalZinc = daysMeals.reduce(
    (acc, m) => acc + (m.micronutrients?.zinc_mg || 0),
    0
  );

  // Filter & sort foods for modal dynamically
  const filteredFoods = useMemo(() => {
    let list = foodDatabase.filter((food) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        food.name.toLowerCase().includes(q) ||
        food.tamil_name.includes(q) ||
        food.serving_unit.toLowerCase().includes(q) ||
        food.category.toLowerCase().includes(q);

      let matchesCategory = true;
      if (activeCategory === "all") {
        matchesCategory = true;
      } else if (activeCategory === "tandoori_grills") {
        matchesCategory =
          food.name.toLowerCase().includes("tandoori") ||
          food.name.toLowerCase().includes("grilled") ||
          food.name.toLowerCase().includes("alfaham") ||
          food.name.toLowerCase().includes("bbq") ||
          food.name.toLowerCase().includes("shawarma") ||
          food.name.toLowerCase().includes("tikka");
      } else {
        matchesCategory = food.category === activeCategory;
      }

      let matchesDietary = true;
      if (dietaryFilter === "custom") {
        matchesDietary = Boolean(food.is_custom);
      } else if (dietaryFilter === "high_protein") {
        matchesDietary = food.protein_g >= 20;
      } else if (dietaryFilter === "veg") {
        matchesDietary =
          food.category === "tiffin_breakfast" ||
          food.category === "lentils_sundal" ||
          food.name.toLowerCase().includes("veg") ||
          food.name.toLowerCase().includes("paneer") ||
          food.name.toLowerCase().includes("gobi") ||
          food.name.toLowerCase().includes("mushroom") ||
          food.name.toLowerCase().includes("sambar") ||
          food.name.toLowerCase().includes("dal");
      } else if (dietaryFilter === "non_veg") {
        matchesDietary =
          food.name.toLowerCase().includes("chicken") ||
          food.name.toLowerCase().includes("mutton") ||
          food.name.toLowerCase().includes("fish") ||
          food.name.toLowerCase().includes("prawn") ||
          food.name.toLowerCase().includes("egg");
      }

      return matchesSearch && matchesCategory && matchesDietary;
    });

    if (sortBy === "protein_desc") {
      list = [...list].sort((a, b) => b.protein_g - a.protein_g);
    } else if (sortBy === "calories_asc") {
      list = [...list].sort((a, b) => a.calories - b.calories);
    } else if (sortBy === "fat_asc") {
      list = [...list].sort(
        (a, b) =>
          a.healthy_fat_g + a.bad_nutrients.saturated_fat_g -
          (b.healthy_fat_g + b.bad_nutrients.saturated_fat_g)
      );
    } else if (sortBy === "name_asc") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [foodDatabase, searchQuery, activeCategory, dietaryFilter, sortBy]);

  const handleConfirmAddFood = () => {
    if (!selectedFoodItem || !selectedMealForAdd) return;
    addMealEntry(selectedMealForAdd, selectedFoodItem, servingsMultiplier, selectedDate);
    setSelectedFoodItem(null);
    setSelectedMealForAdd(null);
    setServingsMultiplier(1);
    setSearchQuery("");
  };

  const handleSaveCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFoodForm.name.trim()) return;
    const created = addCustomFood({
      name: customFoodForm.name.trim(),
      tamil_name: customFoodForm.tamil_name.trim() || customFoodForm.name.trim(),
      category: customFoodForm.category,
      serving_unit: customFoodForm.serving_unit.trim(),
      serving_size_grams: Number(customFoodForm.serving_size_grams) || 100,
      calories: Number(customFoodForm.calories) || 0,
      protein_g: Number(customFoodForm.protein_g) || 0,
      carbs_g: Number(customFoodForm.carbs_g) || 0,
      fiber_g: Number(customFoodForm.fiber_g) || 0,
      healthy_fat_g: Number(customFoodForm.healthy_fat_g) || 0,
      bad_nutrients: {
        saturated_fat_g: Number(customFoodForm.saturated_fat_g) || 0,
        trans_fat_g: Number(customFoodForm.trans_fat_g) || 0,
        sodium_mg: Number(customFoodForm.sodium_mg) || 0,
        added_sugar_g: Number(customFoodForm.added_sugar_g) || 0,
        cholesterol_mg: Number(customFoodForm.cholesterol_mg) || 0,
      },
      micronutrients: {
        vitamin_a_mcg: 0,
        vitamin_c_mg: 0,
        vitamin_d_iu: 0,
        vitamin_b12_mcg: 0,
        iron_mg: Number(customFoodForm.iron_mg) || 0,
        calcium_mg: Number(customFoodForm.calcium_mg) || 0,
        potassium_mg: Number(customFoodForm.potassium_mg) || 0,
        zinc_mg: 0,
      },
    });

    setIsAddCustomFoodOpen(false);
    if (selectedMealForAdd) {
      setSelectedFoodItem(created);
    }
  };

  const handleSaveTargets = (e: React.FormEvent) => {
    e.preventDefault();
    updateNutritionTargets(targetForm);
    setIsEditTargetsOpen(false);
  };

  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="default" className="text-xs">
                South Indian & Tamil Nadu Diet Tracker
              </Badge>
              <Badge variant="secondary" className="text-xs font-tamil">
                தமிழ்நாட்டு பாரம்பரிய உணவுகள்
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Food & Diet Nutrition Tracker
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Log meals across eating times with complete protein, carbs, healthy fats, vitamins, and bad-nutrient monitoring.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditTargetsOpen(true)}
              className="text-xs border-white/10 hover:border-lime-electric/50"
            >
              <Target className="h-3.5 w-3.5 mr-1.5 text-lime-electric" />
              Edit Targets
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setSelectedMealForAdd("lunch")}
              className="font-bold text-xs shadow-lime-sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Quick Log Food
            </Button>
          </div>
        </div>

        {/* Dynamic Date Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-charcoal-900/90 border border-white/5 rounded-2xl shadow-lg">
          <div className="flex items-center gap-2">
            <button
              onClick={() => shiftDate(-1)}
              className="p-2 rounded-xl bg-charcoal-950 hover:bg-charcoal-800 text-white border border-white/5 transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-charcoal-950 border border-white/10">
              <Calendar className="h-4 w-4 text-lime-electric shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-white font-mono">{formattedDate}</span>
              {isToday && (
                <span className="text-[10px] bg-lime-electric/20 text-lime-electric font-black px-1.5 py-0.5 rounded-full">
                  Today
                </span>
              )}
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                title="Click to pick a specific calendar date"
              />
            </div>

            <button
              onClick={() => shiftDate(1)}
              className="p-2 rounded-xl bg-charcoal-950 hover:bg-charcoal-800 text-white border border-white/5 transition-colors"
              title="Next Day"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {!isToday && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDate(getTodayStr())}
                className="text-xs text-lime-electric hover:bg-lime-electric/10 h-8 font-bold"
              >
                Jump to Today
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddCustomFoodOpen(true)}
              className="text-xs text-white border-white/10 hover:border-lime-electric/50 h-8"
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1 text-lime-electric" />
              Add Custom Food
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearTodayMeals(selectedDate)}
              className="text-xs text-rose-400 border-rose-500/20 hover:bg-rose-500/10 h-8"
            >
              Clear Day
            </Button>
          </div>
        </div>

        {/* Top Primary Macros & Calories Gauge */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Calories Card */}
          <Card className="p-5 border-white/5 bg-charcoal-900/90 relative overflow-hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Calories Consumed
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              {Math.round(totalCalories)}{" "}
              <span className="text-xs font-sans font-normal text-muted-foreground">
                / {nutritionTargets.calories} kcal
              </span>
            </div>
            <div className="w-full bg-charcoal-950 rounded-full h-2 mt-3 overflow-hidden border border-white/5">
              <div
                className="bg-lime-electric h-full transition-all duration-500 rounded-full"
                style={{
                  width: `${Math.min(100, (totalCalories / nutritionTargets.calories) * 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-1.5 font-mono">
              <span>{Math.round((totalCalories / nutritionTargets.calories) * 100)}% of goal</span>
              <span>{Math.max(0, nutritionTargets.calories - Math.round(totalCalories))} kcal left</span>
            </div>
          </Card>

          {/* Protein Card */}
          <Card className="p-5 border-white/5 bg-charcoal-900/90 relative overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Protein Target
              </span>
              <Badge variant="default" className="text-[10px] px-1.5 py-0">
                Primary Goal
              </Badge>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-lime-electric">
              {totalProtein.toFixed(1)}g{" "}
              <span className="text-xs font-sans font-normal text-muted-foreground">
                / {nutritionTargets.protein_g}g
              </span>
            </div>
            <div className="w-full bg-charcoal-950 rounded-full h-2 mt-3 overflow-hidden border border-white/5">
              <div
                className="bg-lime-electric h-full transition-all duration-500 rounded-full shadow-lime-sm"
                style={{
                  width: `${Math.min(100, (totalProtein / nutritionTargets.protein_g) * 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-1.5 font-mono">
              <span>{Math.round((totalProtein / nutritionTargets.protein_g) * 100)}% completed</span>
              <span>{Math.max(0, Number((nutritionTargets.protein_g - totalProtein).toFixed(1)))}g left</span>
            </div>
          </Card>

          {/* Carbs Card */}
          <Card className="p-5 border-white/5 bg-charcoal-900/90">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Carbohydrates & Fiber
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              {totalCarbs.toFixed(1)}g{" "}
              <span className="text-xs font-sans font-normal text-muted-foreground">
                / {nutritionTargets.carbs_g}g
              </span>
            </div>
            <div className="w-full bg-charcoal-950 rounded-full h-2 mt-3 overflow-hidden border border-white/5">
              <div
                className="bg-amber-400 h-full transition-all duration-500 rounded-full"
                style={{
                  width: `${Math.min(100, (totalCarbs / nutritionTargets.carbs_g) * 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-1.5 font-mono">
              <span>Fiber: {totalFiber.toFixed(1)}g / {nutritionTargets.fiber_g}g</span>
              <span>{Math.round((totalCarbs / nutritionTargets.carbs_g) * 100)}%</span>
            </div>
          </Card>

          {/* Healthy Fats Card */}
          <Card className="p-5 border-white/5 bg-charcoal-900/90">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Healthy Unsaturated Fats
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              {totalHealthyFat.toFixed(1)}g{" "}
              <span className="text-xs font-sans font-normal text-muted-foreground">
                / {nutritionTargets.fat_g}g
              </span>
            </div>
            <div className="w-full bg-charcoal-950 rounded-full h-2 mt-3 overflow-hidden border border-white/5">
              <div
                className="bg-sky-400 h-full transition-all duration-500 rounded-full"
                style={{
                  width: `${Math.min(100, (totalHealthyFat / nutritionTargets.fat_g) * 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-1.5 font-mono">
              <span>Good plant/nut oils</span>
              <span>{Math.round((totalHealthyFat / nutritionTargets.fat_g) * 100)}%</span>
            </div>
          </Card>
        </div>

        {/* Bad Nutrients Watch & Health Guard */}
        <Card className="p-6 border-white/5 bg-charcoal-900/90 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-400" />
              <div>
                <h3 className="text-base font-black text-white">
                  Bad Nutrients & Health Risk Watch
                </h3>
                <p className="text-xs text-muted-foreground">
                  Monitoring saturated fats, trans fats, sodium, added sugars, and dietary cholesterol.
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs font-mono self-start sm:self-auto">
              Heart & Arterial Safety
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
            {/* Saturated Fat */}
            <div className="p-3 rounded-2xl bg-charcoal-950 border border-white/5">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Saturated Fat</span>
                {totalSaturatedFat > nutritionTargets.max_saturated_fat_g && (
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                )}
              </div>
              <div
                className={`text-lg font-black font-mono ${
                  totalSaturatedFat > nutritionTargets.max_saturated_fat_g
                    ? "text-rose-400"
                    : "text-white"
                }`}
              >
                {totalSaturatedFat.toFixed(1)}g
              </div>
              <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                Limit: {nutritionTargets.max_saturated_fat_g}g
              </div>
            </div>

            {/* Trans Fat */}
            <div className="p-3 rounded-2xl bg-charcoal-950 border border-white/5">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Trans Fat</span>
                {totalTransFat > 0.5 && <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />}
              </div>
              <div
                className={`text-lg font-black font-mono ${
                  totalTransFat > 0.5 ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {totalTransFat.toFixed(2)}g
              </div>
              <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                Target: 0.0g (zero)
              </div>
            </div>

            {/* Sodium */}
            <div className="p-3 rounded-2xl bg-charcoal-950 border border-white/5">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Sodium</span>
                {totalSodium > nutritionTargets.max_sodium_mg && (
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                )}
              </div>
              <div
                className={`text-lg font-black font-mono ${
                  totalSodium > nutritionTargets.max_sodium_mg ? "text-amber-400" : "text-white"
                }`}
              >
                {Math.round(totalSodium)}mg
              </div>
              <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                Limit: {nutritionTargets.max_sodium_mg}mg
              </div>
            </div>

            {/* Added Sugar */}
            <div className="p-3 rounded-2xl bg-charcoal-950 border border-white/5">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Added Sugar</span>
                {totalAddedSugar > nutritionTargets.max_added_sugar_g && (
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                )}
              </div>
              <div
                className={`text-lg font-black font-mono ${
                  totalAddedSugar > nutritionTargets.max_added_sugar_g ? "text-rose-400" : "text-white"
                }`}
              >
                {totalAddedSugar.toFixed(1)}g
              </div>
              <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                Limit: {nutritionTargets.max_added_sugar_g}g
              </div>
            </div>

            {/* Cholesterol */}
            <div className="p-3 rounded-2xl bg-charcoal-950 border border-white/5">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Cholesterol</span>
              </div>
              <div className="text-lg font-black font-mono text-white">
                {Math.round(totalCholesterol)}mg
              </div>
              <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                Limit: 300mg
              </div>
            </div>
          </div>
        </Card>

        {/* Micronutrients & Vitamins Breakdown */}
        <Card className="p-6 border-white/5 bg-charcoal-900/90">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-lime-electric" />
              <div>
                <h3 className="text-base font-black text-white">
                  Micronutrients & Vitamins Profile
                </h3>
                <p className="text-xs text-muted-foreground">
                  Essential electrolytes and immunity vitamins extracted from logged foods.
                </p>
              </div>
            </div>
            <Button
              variant="subtle"
              size="sm"
              onClick={() => setShowMicronutrientsDetail(!showMicronutrientsDetail)}
              className="text-xs font-bold"
            >
              {showMicronutrientsDetail ? "Hide Details" : "View Breakdown"}
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-charcoal-950 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-muted-foreground block">Calcium (Bone)</span>
                <span className="text-sm font-black font-mono text-white">{Math.round(totalCalcium)} mg</span>
              </div>
              <Badge variant="secondary" className="text-[10px] font-mono">
                {Math.round((totalCalcium / 1000) * 100)}%
              </Badge>
            </div>

            <div className="p-3 rounded-xl bg-charcoal-950 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-muted-foreground block">Iron (Blood/Oxygen)</span>
                <span className="text-sm font-black font-mono text-white">{totalIron.toFixed(1)} mg</span>
              </div>
              <Badge variant="secondary" className="text-[10px] font-mono">
                {Math.round((totalIron / 17) * 100)}%
              </Badge>
            </div>

            <div className="p-3 rounded-xl bg-charcoal-950 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-muted-foreground block">Potassium (Electrolyte)</span>
                <span className="text-sm font-black font-mono text-white">{Math.round(totalPotassium)} mg</span>
              </div>
              <Badge variant="secondary" className="text-[10px] font-mono">
                {Math.round((totalPotassium / 3500) * 100)}%
              </Badge>
            </div>

            <div className="p-3 rounded-xl bg-charcoal-950 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-muted-foreground block">Vitamin C (Immunity)</span>
                <span className="text-sm font-black font-mono text-white">{Math.round(totalVitaminC)} mg</span>
              </div>
              <Badge variant="secondary" className="text-[10px] font-mono">
                {Math.round((totalVitaminC / 80) * 100)}%
              </Badge>
            </div>
          </div>

          {showMicronutrientsDetail && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-white/5 animate-in fade-in duration-200">
              <div className="p-3 rounded-xl bg-charcoal-950/60 border border-white/5">
                <span className="text-[11px] text-muted-foreground block">Vitamin A</span>
                <span className="text-sm font-bold font-mono text-white">{Math.round(totalVitaminA)} mcg</span>
              </div>
              <div className="p-3 rounded-xl bg-charcoal-950/60 border border-white/5">
                <span className="text-[11px] text-muted-foreground block">Vitamin D</span>
                <span className="text-sm font-bold font-mono text-white">{Math.round(totalVitaminD)} IU</span>
              </div>
              <div className="p-3 rounded-xl bg-charcoal-950/60 border border-white/5">
                <span className="text-[11px] text-muted-foreground block">Vitamin B12</span>
                <span className="text-sm font-bold font-mono text-white">{totalVitaminB12.toFixed(1)} mcg</span>
              </div>
              <div className="p-3 rounded-xl bg-charcoal-950/60 border border-white/5">
                <span className="text-[11px] text-muted-foreground block">Zinc</span>
                <span className="text-sm font-bold font-mono text-white">{totalZinc.toFixed(1)} mg</span>
              </div>
            </div>
          )}
        </Card>

        {/* 6 Eating Times Modules */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white">
                Daily Eating Windows
              </h2>
              <p className="text-xs text-muted-foreground">
                Showing logs for {formattedDate}. Add dishes, adjust portions, and monitor time-specific macros.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MEAL_TIMES.map((meal) => {
              const mealItems = daysMeals.filter((m) => m.meal_type === meal.type);
              const mealCalories = mealItems.reduce((acc, i) => acc + i.calories, 0);
              const mealProtein = mealItems.reduce((acc, i) => acc + i.protein_g, 0);
              const mealCarbs = mealItems.reduce((acc, i) => acc + i.carbs_g, 0);
              const mealFat = mealItems.reduce((acc, i) => acc + (i.healthy_fat_g + i.bad_nutrients.saturated_fat_g), 0);

              return (
                <Card
                  key={meal.type}
                  className="p-5 border-white/5 bg-charcoal-900/90 flex flex-col justify-between"
                >
                  <div>
                    {/* Meal Header */}
                    <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-white/5">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-white text-base">
                            {meal.label}
                          </h3>
                          <span className="text-xs text-muted-foreground font-tamil">
                            ({meal.tamilLabel})
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {meal.timeHint}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-white text-sm block">
                          {mealCalories} kcal
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
                          <span className="text-lime-electric font-bold">{mealProtein.toFixed(1)}g P</span>
                          <span>•</span>
                          <span>{mealCarbs.toFixed(0)}g C</span>
                          <span>•</span>
                          <span>{mealFat.toFixed(0)}g F</span>
                        </div>
                      </div>
                    </div>

                    {/* Meal Items List */}
                    {mealItems.length === 0 ? (
                      <div className="py-6 text-center text-xs text-muted-foreground/60 italic">
                        No food added yet for this meal.
                      </div>
                    ) : (
                      <div className="space-y-2 mb-3">
                        {mealItems.map((item) => (
                          <div
                            key={item.id}
                            className="p-2.5 rounded-xl bg-charcoal-950/70 border border-white/5 flex items-center justify-between text-xs group"
                          >
                            <div className="min-w-0 pr-2 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-white truncate max-w-[140px] sm:max-w-[200px]">
                                  {item.food_name}
                                </span>
                                <span className="text-[10px] text-lime-electric font-tamil truncate">
                                  ({item.tamil_name})
                                </span>
                              </div>
                              <div className="text-[10px] text-muted-foreground flex flex-wrap items-center gap-2 mt-0.5">
                                <span className="text-white font-semibold">
                                  {item.serving_unit}
                                </span>
                                <span>•</span>
                                <span className="text-lime-electric font-semibold font-mono">
                                  {item.protein_g}g P
                                </span>
                                {item.bad_nutrients.saturated_fat_g > 3 && (
                                  <span className="text-rose-400 font-semibold text-[9px]">
                                    ({item.bad_nutrients.saturated_fat_g}g Sat Fat)
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {/* Dynamic Servings Adjuster */}
                              <div className="flex items-center gap-1 bg-charcoal-900 border border-white/10 rounded-lg px-1.5 py-0.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateMealEntryServings(item.id, Number((item.servings - 0.5).toFixed(1)))
                                  }
                                  className="text-muted-foreground hover:text-white px-1 text-xs font-bold"
                                  title="Decrease portion"
                                >
                                  -
                                </button>
                                <span className="font-mono text-[11px] text-lime-electric font-bold min-w-[24px] text-center">
                                  {item.servings}×
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateMealEntryServings(item.id, Number((item.servings + 0.5).toFixed(1)))
                                  }
                                  className="text-muted-foreground hover:text-white px-1 text-xs font-bold"
                                  title="Increase portion"
                                >
                                  +
                                </button>
                              </div>

                              <span className="font-mono font-bold text-white text-xs min-w-[55px] text-right">
                                {item.calories} kcal
                              </span>
                              <button
                                onClick={() => removeMealEntry(item.id)}
                                className="p-1 rounded text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title="Remove food"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add Food Button */}
                  <div className="pt-2 border-t border-white/5">
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={() => {
                        setSelectedMealForAdd(meal.type);
                        setSelectedFoodItem(null);
                        setServingsMultiplier(1);
                      }}
                      className="w-full text-xs font-bold h-8"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Food to {meal.label}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Modal: Select Food & Quantity */}
        {selectedMealForAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-charcoal-900 border border-white/10 shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">
                    Add Food to{" "}
                    <span className="text-lime-electric">
                      {MEAL_TIMES.find((m) => m.type === selectedMealForAdd)?.label}
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Logging for <strong className="text-white">{formattedDate}</strong>. Tap to select/unselect or add custom portion.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedMealForAdd(null);
                    setSelectedFoodItem(null);
                  }}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search & Dynamic Filters Bar */}
              <div className="p-4 border-b border-white/5 space-y-3 bg-charcoal-950/40">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search food by English or Tamil (e.g. Tandoori, Grilled, Fried Rice, Momos, Idli)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-charcoal-950 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-lime-electric placeholder:text-muted-foreground"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="bg-charcoal-950 border border-white/10 rounded-xl px-2.5 py-2.5 text-xs text-white focus:outline-none focus:border-lime-electric font-bold"
                  >
                    <option value="recommended">Sort: Curated</option>
                    <option value="protein_desc">High Protein</option>
                    <option value="calories_asc">Low Calories</option>
                    <option value="fat_asc">Low Fat</option>
                    <option value="name_asc">Name A-Z</option>
                  </select>
                </div>

                {/* Dietary Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
                  <span className="text-muted-foreground font-semibold shrink-0 mr-1">Filter:</span>
                  {[
                    { key: "all", label: "All" },
                    { key: "custom", label: "✨ Custom Foods" },
                    { key: "high_protein", label: "⚡ High-Protein (>20g)" },
                    { key: "veg", label: "🌿 Vegetarian" },
                    { key: "non_veg", label: "🥩 Non-Veg" },
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => setDietaryFilter(filter.key as typeof dietaryFilter)}
                      className={`px-2.5 py-1 rounded-lg border font-semibold whitespace-nowrap transition-colors ${
                        dietaryFilter === filter.key
                          ? "bg-lime-electric text-charcoal-950 border-lime-electric font-black shadow-lime-sm"
                          : "bg-charcoal-900 text-muted-foreground border-white/5 hover:text-white"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}

                  <button
                    onClick={() => setIsAddCustomFoodOpen(true)}
                    className="ml-auto px-2.5 py-1 rounded-lg bg-lime-electric/15 text-lime-electric border border-lime-electric/30 hover:bg-lime-electric hover:text-charcoal-950 font-bold whitespace-nowrap transition-all flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    + New Food
                  </button>
                </div>

                {/* Categories */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {CATEGORY_TABS.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setActiveCategory(cat.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${
                        activeCategory === cat.key
                          ? "bg-lime-electric text-charcoal-950 border-lime-electric shadow-lime-sm"
                          : "bg-charcoal-900 text-muted-foreground border-white/5 hover:text-white"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Food Selection Grid */}
              <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
                {filteredFoods.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <p className="text-muted-foreground text-sm">No food items found matching your filters.</p>
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setActiveCategory("all");
                        setDietaryFilter("all");
                      }}
                      className="text-xs"
                    >
                      Reset Filters
                    </Button>
                  </div>
                ) : (
                  filteredFoods.map((food) => {
                    const isSelected = selectedFoodItem?.id === food.id;

                    return (
                      <div
                        key={food.id}
                        onClick={() => setSelectedFoodItem(isSelected ? null : food)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-lime-electric/15 border-lime-electric shadow-lime-sm ring-1 ring-lime-electric/50"
                            : "bg-charcoal-950/60 border-white/5 hover:border-white/20 hover:bg-charcoal-950/80"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-white text-sm">
                              {food.name}
                            </h4>
                            <span className="text-xs text-lime-electric font-tamil">
                              ({food.tamil_name})
                            </span>
                            {food.is_custom && (
                              <span className="text-[9px] bg-amber-400/20 text-amber-400 font-bold px-1.5 py-0.5 rounded-full">
                                Custom
                              </span>
                            )}
                            {isSelected && (
                              <span className="text-[10px] bg-lime-electric text-charcoal-950 font-black px-2 py-0.5 rounded-full">
                                Selected • Tap to unselect
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground mt-1">
                            <span className="font-semibold text-white">
                              {food.serving_unit}
                            </span>
                            <span>•</span>
                            <span className="text-lime-electric font-mono font-bold">
                              {food.protein_g}g Protein
                            </span>
                            <span>•</span>
                            <span>{food.carbs_g}g Carbs</span>
                            <span>•</span>
                            <span>{food.healthy_fat_g + food.bad_nutrients.saturated_fat_g}g Fat</span>
                            {food.bad_nutrients.saturated_fat_g > 3 && (
                              <span className="text-rose-400 font-semibold text-[10px]">
                                • {food.bad_nutrients.saturated_fat_g}g Sat Fat
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <span className="font-mono font-black text-sm text-white">
                            {food.calories} kcal
                          </span>

                          {/* Quick 1-tap Add Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addMealEntry(selectedMealForAdd, food, 1, selectedDate);
                              setSelectedFoodItem(null);
                              setSelectedMealForAdd(null);
                              setServingsMultiplier(1);
                            }}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/10 hover:bg-lime-electric hover:text-charcoal-950 text-white transition-all flex items-center gap-1"
                            title="Quick add 1 serving directly"
                          >
                            <Plus className="h-3 w-3" />
                            Add 1×
                          </button>

                          {/* Selection Check Circle */}
                          <div
                            className={`h-6 w-6 rounded-full flex items-center justify-center border transition-all ${
                              isSelected
                                ? "bg-lime-electric text-charcoal-950 border-lime-electric shadow-lime-sm scale-110"
                                : "border-white/20 text-transparent hover:border-white/40"
                            }`}
                            title={isSelected ? "Click to unselect" : "Click to select"}
                          >
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Portion Selector & Add Footer */}
              {selectedFoodItem && (
                <div className="p-4 bg-charcoal-950 border-t border-white/10 space-y-3 animate-in slide-in-from-bottom-2 duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        Selected: <strong className="text-white">{selectedFoodItem.name}</strong> ({selectedFoodItem.tamil_name})
                      </p>
                      <p className="text-[11px] text-lime-electric font-mono">
                        Base ({selectedFoodItem.serving_unit}): {selectedFoodItem.calories} kcal • {selectedFoodItem.protein_g}g Protein
                      </p>
                    </div>

                    {/* Prominent Unselect Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedFoodItem(null)}
                      className="text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-1 rounded-xl border border-rose-500/20 flex items-center gap-1 self-start sm:self-auto transition-colors"
                      title="Unselect food"
                    >
                      <X className="h-3.5 w-3.5" />
                      Unselect Food
                    </button>
                  </div>

                  {/* Smart Portion Selection Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground mr-1">Portion Size:</span>

                    {/* Quarter Chicken/Grill Items */}
                    {selectedFoodItem.name.toLowerCase().includes("quarter") ? (
                      <>
                        {[
                          { label: "Quarter (1×)", mult: 1, desc: "200g" },
                          { label: "Half (2×)", mult: 2, desc: "400g" },
                          { label: "Full (4×)", mult: 4, desc: "800g" },
                          { label: "0.5× Mini", mult: 0.5, desc: "100g" },
                        ].map((p) => (
                          <button
                            key={p.mult}
                            type="button"
                            onClick={() => setServingsMultiplier(p.mult)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              servingsMultiplier === p.mult
                                ? "bg-lime-electric text-charcoal-950 border-lime-electric font-black shadow-lime-sm"
                                : "bg-charcoal-900 text-muted-foreground border-white/5 hover:text-white"
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </>
                    ) : selectedFoodItem.name.toLowerCase().includes("half") ? (
                      <>
                        {[
                          { label: "Quarter (0.5×)", mult: 0.5, desc: "200g" },
                          { label: "Half (1×)", mult: 1, desc: "400g" },
                          { label: "Full (2×)", mult: 2, desc: "800g" },
                        ].map((p) => (
                          <button
                            key={p.mult}
                            type="button"
                            onClick={() => setServingsMultiplier(p.mult)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              servingsMultiplier === p.mult
                                ? "bg-lime-electric text-charcoal-950 border-lime-electric font-black shadow-lime-sm"
                                : "bg-charcoal-900 text-muted-foreground border-white/5 hover:text-white"
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </>
                    ) : selectedFoodItem.name.toLowerCase().includes("full") ? (
                      <>
                        {[
                          { label: "Quarter (0.25×)", mult: 0.25, desc: "200g" },
                          { label: "Half (0.5×)", mult: 0.5, desc: "400g" },
                          { label: "Full (1×)", mult: 1, desc: "800g" },
                        ].map((p) => (
                          <button
                            key={p.mult}
                            type="button"
                            onClick={() => setServingsMultiplier(p.mult)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              servingsMultiplier === p.mult
                                ? "bg-lime-electric text-charcoal-950 border-lime-electric font-black shadow-lime-sm"
                                : "bg-charcoal-900 text-muted-foreground border-white/5 hover:text-white"
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </>
                    ) : selectedFoodItem.name.toLowerCase().includes("momos") ? (
                      <>
                        {[
                          { label: "Half Plate (0.5× / 3 pcs)", mult: 0.5 },
                          { label: "Standard (1× / 6 pcs)", mult: 1 },
                          { label: "Large (1.5× / 9 pcs)", mult: 1.5 },
                          { label: "Double (2× / 12 pcs)", mult: 2 },
                        ].map((p) => (
                          <button
                            key={p.mult}
                            type="button"
                            onClick={() => setServingsMultiplier(p.mult)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              servingsMultiplier === p.mult
                                ? "bg-lime-electric text-charcoal-950 border-lime-electric font-black shadow-lime-sm"
                                : "bg-charcoal-900 text-muted-foreground border-white/5 hover:text-white"
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </>
                    ) : (
                      <>
                        {[
                          { label: "0.5× (Half)", mult: 0.5 },
                          { label: "1× (Standard)", mult: 1 },
                          { label: "1.5×", mult: 1.5 },
                          { label: "2× (Double)", mult: 2 },
                          { label: "3× (Triple)", mult: 3 },
                        ].map((p) => (
                          <button
                            key={p.mult}
                            type="button"
                            onClick={() => setServingsMultiplier(p.mult)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              servingsMultiplier === p.mult
                                ? "bg-lime-electric text-charcoal-950 border-lime-electric font-black shadow-lime-sm"
                                : "bg-charcoal-900 text-muted-foreground border-white/5 hover:text-white"
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </>
                    )}

                    {/* Fine-Tuning Stepper +/- */}
                    <div className="flex items-center gap-1 bg-charcoal-900 border border-white/10 rounded-xl px-1.5 py-0.5 ml-auto">
                      <button
                        type="button"
                        onClick={() =>
                          setServingsMultiplier(Math.max(0.25, Number((servingsMultiplier - 0.25).toFixed(2))))
                        }
                        className="w-6 h-6 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-white font-bold text-xs flex items-center justify-center transition-colors"
                        title="Decrease portion"
                      >
                        -
                      </button>
                      <span className="font-mono font-black text-lime-electric text-xs px-2 min-w-[42px] text-center">
                        {servingsMultiplier}×
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setServingsMultiplier(Number((servingsMultiplier + 0.25).toFixed(2)))
                        }
                        className="w-6 h-6 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-white font-bold text-xs flex items-center justify-center transition-colors"
                        title="Increase portion"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Calculated Preview & Confirm Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/5">
                    <div className="text-xs font-mono text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>
                        Total: <strong className="text-white font-black">{Math.round(selectedFoodItem.calories * servingsMultiplier)} kcal</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Protein: <strong className="text-lime-electric font-black">{(selectedFoodItem.protein_g * servingsMultiplier).toFixed(1)}g</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Carbs: <strong className="text-white">{(selectedFoodItem.carbs_g * servingsMultiplier).toFixed(1)}g</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Fat: <strong className="text-white">{((selectedFoodItem.healthy_fat_g + selectedFoodItem.bad_nutrients.saturated_fat_g) * servingsMultiplier).toFixed(1)}g</strong>
                      </span>
                      {selectedFoodItem.bad_nutrients.saturated_fat_g > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-rose-400 font-semibold">
                            Sat Fat: {(selectedFoodItem.bad_nutrients.saturated_fat_g * servingsMultiplier).toFixed(1)}g
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFoodItem(null)}
                        className="text-xs text-muted-foreground hover:text-white h-9"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleConfirmAddFood}
                        className="font-black px-6 shadow-lime-sm h-9"
                      >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Add {servingsMultiplier}× to Meal
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Edit Daily Targets */}
        {isEditTargetsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-3xl bg-charcoal-900 border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-lime-electric" />
                    Customize Daily Nutrition Goals
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Set your personalized daily macros, calories, and health safety limits.
                  </p>
                </div>
                <button
                  onClick={() => setIsEditTargetsOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTargets} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground block mb-1">
                      Calories Target (kcal)
                    </label>
                    <input
                      type="number"
                      required
                      value={targetForm.calories}
                      onChange={(e) => setTargetForm({ ...targetForm, calories: Number(e.target.value) })}
                      className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-lime-electric"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground block mb-1">
                      Protein Target (g)
                    </label>
                    <input
                      type="number"
                      required
                      value={targetForm.protein_g}
                      onChange={(e) => setTargetForm({ ...targetForm, protein_g: Number(e.target.value) })}
                      className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-lime-electric font-mono font-bold focus:outline-none focus:border-lime-electric"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground block mb-1">
                      Carbohydrates (g)
                    </label>
                    <input
                      type="number"
                      required
                      value={targetForm.carbs_g}
                      onChange={(e) => setTargetForm({ ...targetForm, carbs_g: Number(e.target.value) })}
                      className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-lime-electric"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground block mb-1">
                      Healthy Fats (g)
                    </label>
                    <input
                      type="number"
                      required
                      value={targetForm.fat_g}
                      onChange={(e) => setTargetForm({ ...targetForm, fat_g: Number(e.target.value) })}
                      className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-lime-electric"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground block mb-1">
                      Dietary Fiber (g)
                    </label>
                    <input
                      type="number"
                      required
                      value={targetForm.fiber_g}
                      onChange={(e) => setTargetForm({ ...targetForm, fiber_g: Number(e.target.value) })}
                      className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-lime-electric"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-rose-400 block mb-1">
                      Max Saturated Fat (g)
                    </label>
                    <input
                      type="number"
                      required
                      value={targetForm.max_saturated_fat_g}
                      onChange={(e) => setTargetForm({ ...targetForm, max_saturated_fat_g: Number(e.target.value) })}
                      className="w-full bg-charcoal-950 border border-rose-500/30 rounded-xl px-3 py-2 text-sm text-rose-300 font-mono focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-amber-400 block mb-1">
                      Max Sodium Limit (mg)
                    </label>
                    <input
                      type="number"
                      required
                      value={targetForm.max_sodium_mg}
                      onChange={(e) => setTargetForm({ ...targetForm, max_sodium_mg: Number(e.target.value) })}
                      className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-lime-electric"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-rose-400 block mb-1">
                      Max Added Sugar (g)
                    </label>
                    <input
                      type="number"
                      required
                      value={targetForm.max_added_sugar_g}
                      onChange={(e) => setTargetForm({ ...targetForm, max_added_sugar_g: Number(e.target.value) })}
                      className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-lime-electric"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditTargetsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="default" size="sm" className="font-bold shadow-lime-sm">
                    Save New Targets
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Custom Food */}
        {isAddCustomFoodOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-3xl bg-charcoal-900 border border-white/10 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <PlusCircle className="h-5 w-5 text-lime-electric" />
                    Create Custom Food Item
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Add your own homemade recipe, protein shake, or restaurant dish.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddCustomFoodOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCustomFood} className="p-5 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold text-muted-foreground block mb-1">
                      Food Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mutton Chukka, Oatmeal Shake"
                      value={customFoodForm.name}
                      onChange={(e) => setCustomFoodForm({ ...customFoodForm, name: e.target.value })}
                      className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-electric"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold text-muted-foreground block mb-1 font-tamil">
                      Tamil Name (உணவு பெயர்)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. மட்டன் சுக்கா"
                      value={customFoodForm.tamil_name}
                      onChange={(e) => setCustomFoodForm({ ...customFoodForm, tamil_name: e.target.value })}
                      className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-electric"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground block mb-1">
                      Category
                    </label>
                    <select
                      value={customFoodForm.category}
                      onChange={(e) =>
                        setCustomFoodForm({
                          ...customFoodForm,
                          category: e.target.value as FoodCategory,
                        })
                      }
                      className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-electric"
                    >
                      <option value="fitness_staples">Gym High-Protein</option>
                      <option value="non_veg_specialties">Non-Veg Specialties</option>
                      <option value="chinese_indochinese">Chinese & Indo-Chinese</option>
                      <option value="tiffin_breakfast">Tiffin & Breakfast</option>
                      <option value="rice_curries">Rice & Curries</option>
                      <option value="lentils_sundal">Lentils & Sundal</option>
                      <option value="snacks_beverages">Snacks & Beverages</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground block mb-1">
                      Serving Unit (e.g. plate, 150g)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1 plate (200g)"
                      value={customFoodForm.serving_unit}
                      onChange={(e) => setCustomFoodForm({ ...customFoodForm, serving_unit: e.target.value })}
                      className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-electric"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground block mb-1">
                      Calories (kcal) *
                    </label>
                    <input
                      type="number"
                      required
                      value={customFoodForm.calories}
                      onChange={(e) => setCustomFoodForm({ ...customFoodForm, calories: Number(e.target.value) })}
                      className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-lime-electric"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-lime-electric block mb-1">
                      Protein (g) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={customFoodForm.protein_g}
                      onChange={(e) => setCustomFoodForm({ ...customFoodForm, protein_g: Number(e.target.value) })}
                      className="w-full bg-charcoal-950 border border-lime-electric/40 rounded-xl px-3 py-2 text-sm text-lime-electric font-mono font-bold focus:outline-none focus:border-lime-electric"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground block mb-1">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={customFoodForm.carbs_g}
                      onChange={(e) => setCustomFoodForm({ ...customFoodForm, carbs_g: Number(e.target.value) })}
                      className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-lime-electric"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground block mb-1">
                      Healthy Fat (g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={customFoodForm.healthy_fat_g}
                      onChange={(e) => setCustomFoodForm({ ...customFoodForm, healthy_fat_g: Number(e.target.value) })}
                      className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-lime-electric"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-rose-400 block mb-1">
                      Saturated Fat (g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={customFoodForm.saturated_fat_g}
                      onChange={(e) => setCustomFoodForm({ ...customFoodForm, saturated_fat_g: Number(e.target.value) })}
                      className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-rose-300 font-mono focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground block mb-1">
                      Sodium (mg)
                    </label>
                    <input
                      type="number"
                      value={customFoodForm.sodium_mg}
                      onChange={(e) => setCustomFoodForm({ ...customFoodForm, sodium_mg: Number(e.target.value) })}
                      className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-lime-electric"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddCustomFoodOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="default" size="sm" className="font-bold shadow-lime-sm">
                    Save to Database
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
