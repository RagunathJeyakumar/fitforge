"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  X,
  Filter,
  SlidersHorizontal,
  Plus,
  Check,
  Flame,
  Dumbbell,
  Heart,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List,
  Scale,
  Calendar,
  UtensilsCrossed,
  ShieldAlert,
  Clock,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FoodItem,
  FoodCategory,
  DietaryType,
  NutritionGoal,
  PreparationState,
  MealType,
} from "@/lib/types";

interface FoodChartProps {
  foods: FoodItem[];
  onBatchLogMeals?: (
    items: { food: FoodItem; servings: number }[],
    mealType: MealType
  ) => void;
  onQuickLogFood?: (food: FoodItem, mealType: MealType, servings: number) => void;
}

const CATEGORY_CONFIG: {
  key: string;
  label: string;
  tamil: string;
  icon: string;
}[] = [
  { key: "all", label: "All Items", tamil: "அனைத்தும்", icon: "🍽️" },
  { key: "breads_bakery", label: "Breads & Bakery", tamil: "ரொட்டி & பேக்கரி", icon: "🍞" },
  { key: "spreads_toppings", label: "Spreads & Toppings", tamil: "ஸ்ப்ரெட்ஸ் & வெண்ணெய்", icon: "🍯" },
  { key: "fruits", label: "Fresh Fruits", tamil: "பழ வகைகள்", icon: "🍎" },
  { key: "vegetables", label: "Vegetables", tamil: "காய்கறிகள்", icon: "🥦" },
  { key: "grains_cereals", label: "Grains, Millets & Oats", tamil: "தானியங்கள் & ஓட்ஸ்", icon: "🌾" },
  { key: "pulses_legumes", label: "Pulses, Dals & Legumes", tamil: "பருப்பு & பயறுகள்", icon: "🫘" },
  { key: "dairy_cheese", label: "Dairy, Curd & Paneer", tamil: "பால் & பனீர்", icon: "🥛" },
  { key: "poultry_meat_eggs", label: "Poultry, Eggs & Fish", tamil: "முட்டை, கறி & மீன்", icon: "🍗" },
  { key: "nuts_seeds", label: "Nuts, Seeds & Peanuts", tamil: "கொட்டைகள் & விதைகள்", icon: "🥜" },
  { key: "oils_condiments", label: "Oils & Condiments", tamil: "எண்ணெய் & சாஸ்", icon: "🫒" },
  { key: "healthy_snacks", label: "Healthy Snacks & Treats", tamil: "சிற்றுண்டி", icon: "🍿" },
  { key: "tiffin_breakfast", label: "Tiffin & Dosa", tamil: "டிபன் & தோசை", icon: "🥞" },
  { key: "rice_curries", label: "Rice & Curries", tamil: "சாதம் & குழம்பு", icon: "🍛" },
  { key: "non_veg_specialties", label: "Chettinad Non-Veg", tamil: "அசைவ உணவுகள்", icon: "🥩" },
];

export function FoodChart({
  foods,
  onBatchLogMeals,
  onQuickLogFood,
}: FoodChartProps) {
  // Primary Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [dietaryFilter, setDietaryFilter] = useState<"all" | DietaryType>("all");
  const [goalFilter, setGoalFilter] = useState<"all" | NutritionGoal>("all");
  const [prepStateFilter, setPrepStateFilter] = useState<"all" | PreparationState>("all");

  // Nutrition Display & Layout Modes
  const [displayMode, setDisplayMode] = useState<"serving" | "100g">("serving");
  const [viewLayout, setViewLayout] = useState<"grid" | "table">("grid");
  const [sortBy, setSortBy] = useState<
    "recommended" | "protein_desc" | "calories_asc" | "calories_desc" | "fiber_desc" | "low_sat_fat" | "name_asc"
  >("recommended");

  // Advanced Range Filters Panel
  const [showMacroSliders, setShowMacroSliders] = useState(false);
  const [minProtein, setMinProtein] = useState<number>(0);
  const [maxCalories, setMaxCalories] = useState<number>(800);
  const [maxCarbs, setMaxCarbs] = useState<number>(100);
  const [maxFat, setMaxFat] = useState<number>(60);
  const [minFiber, setMinFiber] = useState<number>(0);

  // Multi-Select Food Calculator State
  const [selectedFoods, setSelectedFoods] = useState<
    Record<string, { food: FoodItem; servings: number }>
  >({});
  const [isTrayExpanded, setIsTrayExpanded] = useState(false);
  const [targetBatchMeal, setTargetBatchMeal] = useState<MealType>("lunch");

  // Detailed Food Nutrition Modal
  const [modalFood, setModalFood] = useState<FoodItem | null>(null);

  // Filter food items
  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      // 1. Search Query Match
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = food.name.toLowerCase().includes(q);
        const matchesTamil = food.tamil_name?.toLowerCase().includes(q);
        const matchesSubcat = food.subcategory?.toLowerCase().includes(q);
        const matchesServing = food.serving_unit?.toLowerCase().includes(q);
        const matchesCategory = food.category?.toLowerCase().includes(q);
        if (!matchesName && !matchesTamil && !matchesSubcat && !matchesServing && !matchesCategory) {
          return false;
        }
      }

      // 2. Category Match
      if (activeCategory !== "all") {
        if (food.category !== activeCategory) {
          return false;
        }
      }

      // 3. Dietary Match
      if (dietaryFilter !== "all") {
        if (dietaryFilter === "veg") {
          if (food.dietary_type !== "veg" && food.dietary_type !== "vegan") return false;
        } else if (food.dietary_type !== dietaryFilter) {
          return false;
        }
      }

      // 4. Goal Suitability Match
      if (goalFilter !== "all") {
        if (!food.goal_suitability || !food.goal_suitability.includes(goalFilter)) {
          // Fallback heuristic for legacy foods
          if (goalFilter === "muscle_gain" && food.protein_g < 14) return false;
          if (goalFilter === "fat_loss" && food.calories > 250) return false;
        }
      }

      // 5. Preparation State Match
      if (prepStateFilter !== "all") {
        if (food.preparation_state && food.preparation_state !== prepStateFilter) {
          return false;
        }
      }

      // 6. Macro Range Slider Filters (based on current display mode: per serving or per 100g)
      const protein = displayMode === "100g" && food.calories_per_100g
        ? ((food.protein_g / (food.serving_size_grams || 100)) * 100)
        : food.protein_g;
      const calories = displayMode === "100g" && food.calories_per_100g
        ? food.calories_per_100g
        : food.calories;
      const carbs = displayMode === "100g" && food.calories_per_100g
        ? ((food.carbs_g / (food.serving_size_grams || 100)) * 100)
        : food.carbs_g;
      const fat = displayMode === "100g" && food.calories_per_100g
        ? (((food.healthy_fat_g + (food.bad_nutrients?.saturated_fat_g || 0)) / (food.serving_size_grams || 100)) * 100)
        : (food.healthy_fat_g + (food.bad_nutrients?.saturated_fat_g || 0));
      const fiber = displayMode === "100g" && food.calories_per_100g
        ? ((food.fiber_g / (food.serving_size_grams || 100)) * 100)
        : food.fiber_g;

      if (protein < minProtein) return false;
      if (calories > maxCalories) return false;
      if (carbs > maxCarbs) return false;
      if (fat > maxFat) return false;
      if (fiber < minFiber) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "protein_desc") {
        return b.protein_g - a.protein_g;
      }
      if (sortBy === "calories_asc") {
        return a.calories - b.calories;
      }
      if (sortBy === "calories_desc") {
        return b.calories - a.calories;
      }
      if (sortBy === "fiber_desc") {
        return b.fiber_g - a.fiber_g;
      }
      if (sortBy === "low_sat_fat") {
        return (a.bad_nutrients?.saturated_fat_g || 0) - (b.bad_nutrients?.saturated_fat_g || 0);
      }
      if (sortBy === "name_asc") {
        return a.name.localeCompare(b.name);
      }
      return 0; // Default recommended curation
    });
  }, [
    foods,
    searchQuery,
    activeCategory,
    dietaryFilter,
    goalFilter,
    prepStateFilter,
    minProtein,
    maxCalories,
    maxCarbs,
    maxFat,
    minFiber,
    displayMode,
    sortBy,
  ]);

  // Combined Multi-Select Nutrition Calculation
  const combinedNutrition = useMemo(() => {
    const list = Object.values(selectedFoods);
    return list.reduce(
      (acc, item) => {
        const mult = item.servings;
        return {
          count: acc.count + 1,
          calories: acc.calories + item.food.calories * mult,
          protein_g: acc.protein_g + item.food.protein_g * mult,
          carbs_g: acc.carbs_g + item.food.carbs_g * mult,
          healthy_fat_g: acc.healthy_fat_g + item.food.healthy_fat_g * mult,
          fiber_g: acc.fiber_g + item.food.fiber_g * mult,
          saturated_fat_g: acc.saturated_fat_g + (item.food.bad_nutrients?.saturated_fat_g || 0) * mult,
          sodium_mg: acc.sodium_mg + (item.food.bad_nutrients?.sodium_mg || 0) * mult,
          added_sugar_g: acc.added_sugar_g + (item.food.bad_nutrients?.added_sugar_g || 0) * mult,
          cholesterol_mg: acc.cholesterol_mg + (item.food.bad_nutrients?.cholesterol_mg || 0) * mult,
          calcium_mg: acc.calcium_mg + (item.food.micronutrients?.calcium_mg || 0) * mult,
          iron_mg: acc.iron_mg + (item.food.micronutrients?.iron_mg || 0) * mult,
          potassium_mg: acc.potassium_mg + (item.food.micronutrients?.potassium_mg || 0) * mult,
          vitamin_c_mg: acc.vitamin_c_mg + (item.food.micronutrients?.vitamin_c_mg || 0) * mult,
          vitamin_d_iu: acc.vitamin_d_iu + (item.food.micronutrients?.vitamin_d_iu || 0) * mult,
          vitamin_b12_mcg: acc.vitamin_b12_mcg + (item.food.micronutrients?.vitamin_b12_mcg || 0) * mult,
        };
      },
      {
        count: 0,
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        healthy_fat_g: 0,
        fiber_g: 0,
        saturated_fat_g: 0,
        sodium_mg: 0,
        added_sugar_g: 0,
        cholesterol_mg: 0,
        calcium_mg: 0,
        iron_mg: 0,
        potassium_mg: 0,
        vitamin_c_mg: 0,
        vitamin_d_iu: 0,
        vitamin_b12_mcg: 0,
      }
    );
  }, [selectedFoods]);

  const selectedCount = Object.keys(selectedFoods).length;

  const toggleSelectFood = (food: FoodItem) => {
    setSelectedFoods((prev) => {
      const next = { ...prev };
      if (next[food.id]) {
        delete next[food.id];
      } else {
        next[food.id] = { food, servings: 1 };
      }
      return next;
    });
  };

  const updateSelectedServings = (id: string, delta: number) => {
    setSelectedFoods((prev) => {
      if (!prev[id]) return prev;
      const current = prev[id].servings;
      const nextServings = Math.max(0.25, Number((current + delta).toFixed(2)));
      return {
        ...prev,
        [id]: { ...prev[id], servings: nextServings },
      };
    });
  };

  const removeSelectedFood = (id: string) => {
    setSelectedFoods((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const clearAllSelected = () => {
    setSelectedFoods({});
  };

  const handleBatchLog = () => {
    if (!onBatchLogMeals || selectedCount === 0) return;
    const items = Object.values(selectedFoods);
    onBatchLogMeals(items, targetBatchMeal);
    setSelectedFoods({});
    setIsTrayExpanded(false);
  };

  const resetAllFilters = () => {
    setSearchQuery("");
    setActiveCategory("all");
    setDietaryFilter("all");
    setGoalFilter("all");
    setPrepStateFilter("all");
    setMinProtein(0);
    setMaxCalories(800);
    setMaxCarbs(100);
    setMaxFat(60);
    setMinFiber(0);
    setSortBy("recommended");
  };

  const isAnyFilterActive =
    searchQuery.trim() !== "" ||
    activeCategory !== "all" ||
    dietaryFilter !== "all" ||
    goalFilter !== "all" ||
    prepStateFilter !== "all" ||
    minProtein > 0 ||
    maxCalories < 800 ||
    maxCarbs < 100 ||
    maxFat < 60 ||
    minFiber > 0 ||
    sortBy !== "recommended";

  return (
    <div className="space-y-6">
      {/* Top Banner / Chart Header */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-charcoal-900 via-charcoal-900 to-charcoal-950 border border-white/10 shadow-2xl overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-lime-electric/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default" className="text-xs font-black shadow-lime-sm">
                Nutrition Database & Meal Planner
              </Badge>
              <Badge variant="secondary" className="text-xs font-tamil">
                உணவு அட்டவணை & ஊட்டச்சத்து கணக்கீடு
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                {foods.length} items loaded
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Comprehensive Food & Fitness Chart
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Everyday Indian staples, gym foods, bakery breads, wholesome spreads, fresh fruits,
              vegetables, and proteins. Multi-select foods to calculate total combined macros and
              micronutrients for your fat loss or muscle building meal plan.
            </p>
          </div>

          {/* Quick Metrics & Mode Toggles */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* 100g vs Serving Toggle */}
            <div className="flex items-center p-1 bg-charcoal-950/90 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => setDisplayMode("serving")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  displayMode === "serving"
                    ? "bg-lime-electric text-charcoal-950 shadow-lime-sm font-black"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                <UtensilsCrossed className="h-3.5 w-3.5" />
                Per Serving
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode("100g")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  displayMode === "100g"
                    ? "bg-lime-electric text-charcoal-950 shadow-lime-sm font-black"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                <Scale className="h-3.5 w-3.5" />
                Per 100g
              </button>
            </div>

            {/* Grid vs Table Layout Toggle */}
            <div className="flex items-center p-1 bg-charcoal-950/90 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => setViewLayout("grid")}
                className={`p-2 rounded-xl text-xs transition-all ${
                  viewLayout === "grid"
                    ? "bg-charcoal-800 text-lime-electric font-bold"
                    : "text-muted-foreground hover:text-white"
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewLayout("table")}
                className={`p-2 rounded-xl text-xs transition-all ${
                  viewLayout === "table"
                    ? "bg-charcoal-800 text-lime-electric font-bold"
                    : "text-muted-foreground hover:text-white"
                }`}
                title="Compact Table View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Search & Category Selector Bar */}
      <div className="space-y-3 p-4 sm:p-5 rounded-3xl bg-charcoal-900/90 border border-white/10 shadow-lg">
        {/* Search Input & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by food name, Tamil name (e.g. Whole wheat bread, Peanut butter, Apple, Paneer, Oats, Makhana)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-charcoal-950 border border-white/10 rounded-2xl pl-10 pr-10 py-3 text-sm text-white focus:outline-none focus:border-lime-electric placeholder:text-muted-foreground shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white p-1"
                title="Clear Search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-charcoal-950 border border-white/10 rounded-2xl px-3 py-3 text-xs text-white focus:outline-none focus:border-lime-electric font-bold shrink-0"
            >
              <option value="recommended">Sort: Recommended</option>
              <option value="protein_desc">Highest Protein</option>
              <option value="calories_asc">Lowest Calories</option>
              <option value="calories_desc">Highest Calories</option>
              <option value="fiber_desc">Highest Fiber</option>
              <option value="low_sat_fat">Lowest Saturated Fat</option>
              <option value="name_asc">Name (A-Z)</option>
            </select>

            <Button
              variant={showMacroSliders ? "default" : "outline"}
              size="sm"
              onClick={() => setShowMacroSliders(!showMacroSliders)}
              className={`rounded-2xl h-11 px-3 text-xs font-bold border-white/10 shrink-0 ${
                showMacroSliders ? "shadow-lime-sm" : ""
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
              Macro Sliders
              {(minProtein > 0 || maxCalories < 800 || maxCarbs < 100 || maxFat < 60 || minFiber > 0) && (
                <span className="ml-1.5 w-2 h-2 rounded-full bg-lime-electric animate-pulse" />
              )}
            </Button>
          </div>
        </div>

        {/* Category Pills Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          {CATEGORY_CONFIG.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-1.5 ${
                activeCategory === cat.key
                  ? "bg-lime-electric text-charcoal-950 border-lime-electric shadow-lime-sm font-black"
                  : "bg-charcoal-950 text-muted-foreground border-white/5 hover:text-white hover:bg-charcoal-800"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className="text-[10px] font-tamil opacity-75 hidden sm:inline">
                ({cat.tamil})
              </span>
            </button>
          ))}
        </div>

        {/* Secondary Filter Badges: Dietary, Goal, Prep State */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs">
          {/* Dietary Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-muted-foreground font-semibold text-[11px] mr-1">Diet:</span>
            {[
              { key: "all", label: "All" },
              { key: "veg", label: "🟢 Veg" },
              { key: "non_veg", label: "🔴 Non-Veg" },
              { key: "egg", label: "🟡 Egg" },
              { key: "vegan", label: "🌿 Vegan" },
            ].map((d) => (
              <button
                key={d.key}
                onClick={() => setDietaryFilter(d.key as typeof dietaryFilter)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  dietaryFilter === d.key
                    ? "bg-charcoal-800 text-lime-electric border-lime-electric/50 font-bold"
                    : "bg-charcoal-950 text-muted-foreground border-white/5 hover:text-white"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Goal Suitability Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-muted-foreground font-semibold text-[11px] mr-1">Goal:</span>
            {[
              { key: "all", label: "All" },
              { key: "fat_loss", label: "🔥 Fat Loss" },
              { key: "muscle_gain", label: "💪 Muscle Gain" },
              { key: "general_health", label: "🥗 Healthy Eating" },
            ].map((g) => (
              <button
                key={g.key}
                onClick={() => setGoalFilter(g.key as typeof goalFilter)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  goalFilter === g.key
                    ? "bg-charcoal-800 text-lime-electric border-lime-electric/50 font-bold"
                    : "bg-charcoal-950 text-muted-foreground border-white/5 hover:text-white"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Preparation State Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-muted-foreground font-semibold text-[11px] mr-1">State:</span>
            {[
              { key: "all", label: "All" },
              { key: "raw", label: "Fresh / Raw" },
              { key: "cooked", label: "Cooked" },
              { key: "packaged", label: "Packaged" },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => setPrepStateFilter(p.key as typeof prepStateFilter)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  prepStateFilter === p.key
                    ? "bg-charcoal-800 text-lime-electric border-lime-electric/50 font-bold"
                    : "bg-charcoal-950 text-muted-foreground border-white/5 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}

            {isAnyFilterActive && (
              <button
                onClick={resetAllFilters}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-bold ml-2 underline underline-offset-2"
              >
                Reset All
              </button>
            )}
          </div>
        </div>

        {/* Expandable Macro Range Sliders */}
        {showMacroSliders && (
          <div className="p-4 rounded-2xl bg-charcoal-950/80 border border-white/10 mt-3 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5 text-lime-electric" />
                Filter by Exact Macronutrient Thresholds ({displayMode === "100g" ? "Per 100g" : "Per Serving"})
              </span>
              <button
                onClick={() => {
                  setMinProtein(0);
                  setMaxCalories(800);
                  setMaxCarbs(100);
                  setMaxFat(60);
                  setMinFiber(0);
                }}
                className="text-[11px] text-muted-foreground hover:text-white font-mono"
              >
                Reset Sliders
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Min Protein */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Min Protein:</span>
                  <span className="font-mono font-bold text-lime-electric">{minProtein}g</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={1}
                  value={minProtein}
                  onChange={(e) => setMinProtein(Number(e.target.value))}
                  className="w-full accent-lime-electric cursor-pointer"
                />
              </div>

              {/* Max Calories */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Max Calories:</span>
                  <span className="font-mono font-bold text-white">{maxCalories} kcal</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={800}
                  step={20}
                  value={maxCalories}
                  onChange={(e) => setMaxCalories(Number(e.target.value))}
                  className="w-full accent-lime-electric cursor-pointer"
                />
              </div>

              {/* Max Carbs */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Max Carbs:</span>
                  <span className="font-mono font-bold text-amber-400">{maxCarbs}g</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={maxCarbs}
                  onChange={(e) => setMaxCarbs(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Max Fat */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Max Fat:</span>
                  <span className="font-mono font-bold text-sky-400">{maxFat}g</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={60}
                  step={2}
                  value={maxFat}
                  onChange={(e) => setMaxFat(Number(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>

              {/* Min Fiber */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Min Fiber:</span>
                  <span className="font-mono font-bold text-emerald-400">{minFiber}g</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={15}
                  step={1}
                  value={minFiber}
                  onChange={(e) => setMinFiber(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Status & Counter Bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
        <div>
          Showing <strong className="text-white font-mono">{filteredFoods.length}</strong> food items
          {displayMode === "100g" ? " (normalized per 100 grams)" : " (per standard household serving)"}
        </div>
        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="font-bold text-lime-electric">
              {selectedCount} item{selectedCount > 1 ? "s" : ""} selected for calculation
            </span>
            <Button
              variant="subtle"
              size="sm"
              onClick={() => setIsTrayExpanded(!isTrayExpanded)}
              className="text-xs font-bold h-7 py-0"
            >
              {isTrayExpanded ? "Hide Calculator Tray" : "View Combined Nutrition"}
            </Button>
          </div>
        )}
      </div>

      {/* Foods Display: Grid vs Table */}
      {filteredFoods.length === 0 ? (
        <Card className="p-12 text-center bg-charcoal-900/60 border-white/5 space-y-3">
          <UtensilsCrossed className="h-10 w-10 text-muted-foreground mx-auto opacity-40" />
          <h4 className="text-lg font-bold text-white">No food items found</h4>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Try adjusting your search query or reset category and macronutrient range filters.
          </p>
          <Button variant="default" size="sm" onClick={resetAllFilters} className="text-xs font-bold mt-2">
            Reset All Filters
          </Button>
        </Card>
      ) : viewLayout === "grid" ? (
        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFoods.map((food) => {
            const isSelected = Boolean(selectedFoods[food.id]);
            const selectedServings = selectedFoods[food.id]?.servings || 1;

            // Calculations based on display mode
            const servingLabel = displayMode === "100g" ? "100 grams" : food.serving_unit;
            const cals = displayMode === "100g" && food.calories_per_100g ? food.calories_per_100g : food.calories;
            const protein = displayMode === "100g" && food.calories_per_100g
              ? Number(((food.protein_g / (food.serving_size_grams || 100)) * 100).toFixed(1))
              : food.protein_g;
            const carbs = displayMode === "100g" && food.calories_per_100g
              ? Number(((food.carbs_g / (food.serving_size_grams || 100)) * 100).toFixed(1))
              : food.carbs_g;
            const fat = displayMode === "100g" && food.calories_per_100g
              ? Number((((food.healthy_fat_g + (food.bad_nutrients?.saturated_fat_g || 0)) / (food.serving_size_grams || 100)) * 100).toFixed(1))
              : Number((food.healthy_fat_g + (food.bad_nutrients?.saturated_fat_g || 0)).toFixed(1));
            const fiber = displayMode === "100g" && food.calories_per_100g
              ? Number(((food.fiber_g / (food.serving_size_grams || 100)) * 100).toFixed(1))
              : food.fiber_g;

            return (
              <Card
                key={food.id}
                className={`p-5 flex flex-col justify-between transition-all duration-200 border relative overflow-hidden group ${
                  isSelected
                    ? "bg-lime-electric/10 border-lime-electric shadow-lime-sm ring-1 ring-lime-electric/40"
                    : "bg-charcoal-900/90 border-white/5 hover:border-white/20 hover:bg-charcoal-900"
                }`}
              >
                {/* Dietary color indicator line at top */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    food.dietary_type === "non_veg"
                      ? "bg-rose-500"
                      : food.dietary_type === "egg"
                      ? "bg-amber-400"
                      : food.dietary_type === "vegan"
                      ? "bg-emerald-400"
                      : "bg-lime-electric"
                  }`}
                />

                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2 pt-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Dietary Type Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                          food.dietary_type === "non_veg"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : food.dietary_type === "egg"
                            ? "bg-amber-400/20 text-amber-400 border border-amber-400/30"
                            : food.dietary_type === "vegan"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-lime-electric/20 text-lime-electric border border-lime-electric/30"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {food.dietary_type?.replace("_", " ") || "veg"}
                      </span>

                      {/* Preparation state badge */}
                      {food.preparation_state && (
                        <span className="text-[10px] bg-charcoal-950 text-muted-foreground px-2 py-0.5 rounded-md border border-white/5 font-mono">
                          {food.preparation_state}
                        </span>
                      )}

                      {/* Subcategory */}
                      {food.subcategory && (
                        <span className="text-[10px] bg-charcoal-950 text-white/70 px-2 py-0.5 rounded-md border border-white/5">
                          {food.subcategory}
                        </span>
                      )}
                    </div>

                    {/* Multi-Select Checkbox/Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleSelectFood(food)}
                      className={`p-1.5 rounded-xl border transition-all flex items-center gap-1 text-xs font-bold ${
                        isSelected
                          ? "bg-lime-electric text-charcoal-950 border-lime-electric shadow-lime-sm"
                          : "bg-charcoal-950 text-muted-foreground border-white/10 hover:border-lime-electric/50 hover:text-white"
                      }`}
                      title={isSelected ? "Remove from plan" : "Select to calculate combined nutrition"}
                    >
                      <Check className={`h-3.5 w-3.5 ${isSelected ? "stroke-[3]" : "opacity-40"}`} />
                      <span className="text-[11px]">{isSelected ? "Selected" : "Plan"}</span>
                    </button>
                  </div>

                  {/* Food Names */}
                  <div className="space-y-0.5 mb-2">
                    <h3 className="font-black text-white text-base group-hover:text-lime-electric transition-colors leading-tight">
                      {food.name}
                    </h3>
                    {food.tamil_name && (
                      <p className="text-xs text-muted-foreground font-tamil font-medium">
                        {food.tamil_name}
                      </p>
                    )}
                  </div>

                  {/* Serving Size & Household Measurement */}
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mb-3 font-mono">
                    <Scale className="h-3 w-3 text-lime-electric shrink-0" />
                    <span>Serving: <strong className="text-white">{food.serving_unit}</strong> ({food.serving_size_grams}g)</span>
                  </div>

                  {/* Nutrition Highlights Box */}
                  <div className="p-3 rounded-2xl bg-charcoal-950 border border-white/5 space-y-2 mb-3">
                    <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                      <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                        Calories ({displayMode})
                      </span>
                      <span className="text-base font-black font-mono text-white">
                        {cals} <span className="text-[10px] font-sans font-normal text-muted-foreground">kcal</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1 text-center font-mono">
                      <div className="p-1 rounded-lg bg-charcoal-900/60">
                        <span className="text-[9px] text-muted-foreground block">Protein</span>
                        <span className="text-xs font-black text-lime-electric">{protein}g</span>
                      </div>
                      <div className="p-1 rounded-lg bg-charcoal-900/60">
                        <span className="text-[9px] text-muted-foreground block">Carbs</span>
                        <span className="text-xs font-black text-amber-400">{carbs}g</span>
                      </div>
                      <div className="p-1 rounded-lg bg-charcoal-900/60">
                        <span className="text-[9px] text-muted-foreground block">Fat</span>
                        <span className="text-xs font-black text-sky-400">{fat}g</span>
                      </div>
                      <div className="p-1 rounded-lg bg-charcoal-900/60">
                        <span className="text-[9px] text-muted-foreground block">Fiber</span>
                        <span className="text-xs font-black text-emerald-400">{fiber}g</span>
                      </div>
                    </div>
                  </div>

                  {/* Goal Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-3">
                    {food.goal_suitability?.map((g) => (
                      <span
                        key={g}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                          g === "fat_loss"
                            ? "bg-rose-500/10 text-rose-400"
                            : g === "muscle_gain"
                            ? "bg-lime-electric/10 text-lime-electric"
                            : "bg-sky-500/10 text-sky-400"
                        }`}
                      >
                        {g === "fat_loss" ? "🔥 Fat Loss" : g === "muscle_gain" ? "💪 Muscle Gain" : "🥗 Healthy"}
                      </span>
                    ))}
                    {food.suggested_timing && food.suggested_timing.length > 0 && (
                      <span className="text-[9px] bg-charcoal-950 text-muted-foreground px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {food.suggested_timing[0].replace("_", " ")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={() => setModalFood(food)}
                    className="flex-1 text-xs font-bold h-8"
                  >
                    <Info className="h-3 w-3 mr-1" />
                    Nutrient Profile
                  </Button>

                  <Button
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSelectFood(food)}
                    className={`text-xs font-bold h-8 px-3 border-white/10 ${
                      isSelected ? "shadow-lime-sm" : ""
                    }`}
                  >
                    {isSelected ? "In Plan" : "+ Add to Plan"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* COMPACT TABLE VIEW */
        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-charcoal-900/90 shadow-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-charcoal-950/80 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5 pl-4">Plan</th>
                <th className="p-3.5">Food Name & Tamil</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Diet & State</th>
                <th className="p-3.5">Serving Size</th>
                <th className="p-3.5 text-right font-mono">Calories</th>
                <th className="p-3.5 text-right font-mono text-lime-electric">Protein</th>
                <th className="p-3.5 text-right font-mono text-amber-400">Carbs</th>
                <th className="p-3.5 text-right font-mono text-sky-400">Fat</th>
                <th className="p-3.5 text-right font-mono text-emerald-400">Fiber</th>
                <th className="p-3.5 text-center">Nutrients</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredFoods.map((food) => {
                const isSelected = Boolean(selectedFoods[food.id]);
                const cals = displayMode === "100g" && food.calories_per_100g ? food.calories_per_100g : food.calories;
                const protein = displayMode === "100g" && food.calories_per_100g
                  ? Number(((food.protein_g / (food.serving_size_grams || 100)) * 100).toFixed(1))
                  : food.protein_g;
                const carbs = displayMode === "100g" && food.calories_per_100g
                  ? Number(((food.carbs_g / (food.serving_size_grams || 100)) * 100).toFixed(1))
                  : food.carbs_g;
                const fat = displayMode === "100g" && food.calories_per_100g
                  ? Number((((food.healthy_fat_g + (food.bad_nutrients?.saturated_fat_g || 0)) / (food.serving_size_grams || 100)) * 100).toFixed(1))
                  : Number((food.healthy_fat_g + (food.bad_nutrients?.saturated_fat_g || 0)).toFixed(1));
                const fiber = displayMode === "100g" && food.calories_per_100g
                  ? Number(((food.fiber_g / (food.serving_size_grams || 100)) * 100).toFixed(1))
                  : food.fiber_g;

                return (
                  <tr
                    key={food.id}
                    className={`hover:bg-charcoal-800/60 transition-colors ${
                      isSelected ? "bg-lime-electric/10" : ""
                    }`}
                  >
                    <td className="p-3 pl-4">
                      <button
                        type="button"
                        onClick={() => toggleSelectFood(food)}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-lime-electric text-charcoal-950 border-lime-electric font-black"
                            : "bg-charcoal-950 text-muted-foreground border-white/10 hover:border-lime-electric/50"
                        }`}
                      >
                        {isSelected ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <Plus className="h-3.5 w-3.5" />}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-white max-w-[200px] truncate">{food.name}</div>
                      <div className="text-[10px] text-muted-foreground font-tamil truncate">
                        {food.tamil_name}
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground capitalize">
                      {food.category.replace(/_/g, " ")}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            food.dietary_type === "non_veg"
                              ? "bg-rose-500/20 text-rose-400"
                              : food.dietary_type === "egg"
                              ? "bg-amber-400/20 text-amber-400"
                              : "bg-lime-electric/20 text-lime-electric"
                          }`}
                        >
                          {food.dietary_type || "veg"}
                        </span>
                        {food.preparation_state && (
                          <span className="text-[9px] text-muted-foreground font-mono">
                            {food.preparation_state}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground font-mono">
                      {food.serving_unit}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-white">
                      {cals} kcal
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-lime-electric">
                      {protein}g
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-amber-400">
                      {carbs}g
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-sky-400">
                      {fat}g
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400">
                      {fiber}g
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setModalFood(food)}
                        className="p-1 rounded-lg hover:bg-charcoal-700 text-muted-foreground hover:text-white"
                        title="View Full Nutrient Profile"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* STICKY BOTTOM MEAL PLANNING CALCULATOR TRAY */}
      {selectedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 bg-charcoal-950/95 backdrop-blur-xl border-t border-lime-electric/30 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto">
            {/* Header Line */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10 gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-lime-electric animate-ping" />
                <h4 className="text-sm font-black text-white">
                  Combined Meal Nutrition Calculator ({selectedCount} items)
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => setIsTrayExpanded(!isTrayExpanded)}
                  className="text-xs font-bold h-7 py-0"
                >
                  {isTrayExpanded ? (
                    <>
                      <ChevronDown className="h-3.5 w-3.5 mr-1" />
                      Collapse Items
                    </>
                  ) : (
                    <>
                      <ChevronUp className="h-3.5 w-3.5 mr-1" />
                      Adjust Portions ({selectedCount})
                    </>
                  )}
                </Button>
                <button
                  onClick={clearAllSelected}
                  className="text-xs text-rose-400 hover:text-rose-300 font-bold px-2 py-1"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Combined Nutrition Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-6 lg:grid-cols-7 gap-2 sm:gap-3 py-2.5 items-center">
              {/* Total Calories */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-charcoal-900 border border-white/5 text-center">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Total Calories
                </span>
                <span className="text-lg font-black font-mono text-white">
                  {Math.round(combinedNutrition.calories)}{" "}
                  <span className="text-[10px] font-sans text-muted-foreground font-normal">kcal</span>
                </span>
              </div>

              {/* Protein */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-charcoal-900 border border-white/5 text-center">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Protein
                </span>
                <span className="text-lg font-black font-mono text-lime-electric">
                  {combinedNutrition.protein_g.toFixed(1)}g
                </span>
              </div>

              {/* Carbs */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-charcoal-900 border border-white/5 text-center">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Carbs
                </span>
                <span className="text-lg font-black font-mono text-amber-400">
                  {combinedNutrition.carbs_g.toFixed(1)}g
                </span>
              </div>

              {/* Healthy Fats */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-charcoal-900 border border-white/5 text-center">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Fats
                </span>
                <span className="text-lg font-black font-mono text-sky-400">
                  {(combinedNutrition.healthy_fat_g + combinedNutrition.saturated_fat_g).toFixed(1)}g
                </span>
              </div>

              {/* Fiber */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-charcoal-900 border border-white/5 text-center">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Fiber
                </span>
                <span className="text-lg font-black font-mono text-emerald-400">
                  {combinedNutrition.fiber_g.toFixed(1)}g
                </span>
              </div>

              {/* Saturated Fat & Sodium Watch */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-charcoal-900 border border-white/5 text-center hidden sm:block">
                <span className="text-[10px] uppercase font-bold text-rose-400 block">
                  Sat Fat / Sodium
                </span>
                <span className="text-xs font-bold font-mono text-white">
                  {combinedNutrition.saturated_fat_g.toFixed(1)}g / {Math.round(combinedNutrition.sodium_mg)}mg
                </span>
              </div>

              {/* Batch Log Button */}
              <div className="col-span-2 sm:col-span-6 lg:col-span-1 flex items-center gap-2">
                {onBatchLogMeals ? (
                  <div className="flex items-center gap-1.5 w-full">
                    <select
                      value={targetBatchMeal}
                      onChange={(e) => setTargetBatchMeal(e.target.value as MealType)}
                      className="bg-charcoal-900 border border-white/10 rounded-xl px-2 py-2 text-xs text-white font-bold focus:outline-none focus:border-lime-electric shrink-0"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="morning_snack">Mid-Morning</option>
                      <option value="lunch">Lunch</option>
                      <option value="evening_snack">Snack</option>
                      <option value="post_workout">Post-Workout</option>
                      <option value="dinner">Dinner</option>
                    </select>

                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleBatchLog}
                      className="flex-1 font-black text-xs h-9 shadow-lime-sm whitespace-nowrap"
                    >
                      Log Meal
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground font-mono">
                    Balanced Fuel Planned
                  </span>
                )}
              </div>
            </div>

            {/* Expandable Selected Food Items with Quantity Multipliers */}
            {isTrayExpanded && (
              <div className="mt-2 pt-2 border-t border-white/10 max-h-48 overflow-y-auto space-y-2 animate-in fade-in duration-200">
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Adjust Item Portions:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {Object.entries(selectedFoods).map(([id, item]) => (
                    <div
                      key={id}
                      className="p-2 rounded-xl bg-charcoal-900/90 border border-white/10 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-white truncate max-w-[150px]">
                          {item.food.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {item.food.serving_unit} • {Math.round(item.food.calories * item.servings)} kcal
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center gap-1 bg-charcoal-950 border border-white/10 rounded-lg px-1.5 py-0.5">
                          <button
                            type="button"
                            onClick={() => updateSelectedServings(id, -0.5)}
                            className="text-muted-foreground hover:text-white px-1 font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="font-mono text-lime-electric font-bold min-w-[28px] text-center text-xs">
                            {item.servings}×
                          </span>
                          <button
                            type="button"
                            onClick={() => updateSelectedServings(id, 0.5)}
                            className="text-muted-foreground hover:text-white px-1 font-bold text-xs"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeSelectedFood(id)}
                          className="p-1 rounded text-muted-foreground hover:text-rose-400"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULL NUTRIENT PROFILE MODAL */}
      {modalFood && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-charcoal-900 border border-white/10 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-start justify-between bg-charcoal-950/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs uppercase tracking-wider font-bold">
                    {modalFood.category.replace(/_/g, " ")}
                  </Badge>
                  {modalFood.subcategory && (
                    <Badge variant="secondary" className="text-xs">
                      {modalFood.subcategory}
                    </Badge>
                  )}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      modalFood.dietary_type === "non_veg"
                        ? "bg-rose-500/20 text-rose-400"
                        : modalFood.dietary_type === "egg"
                        ? "bg-amber-400/20 text-amber-400"
                        : "bg-lime-electric/20 text-lime-electric"
                    }`}
                  >
                    {modalFood.dietary_type || "veg"}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white">{modalFood.name}</h3>
                {modalFood.tamil_name && (
                  <p className="text-xs text-lime-electric font-tamil">
                    {modalFood.tamil_name}
                  </p>
                )}
                <p className="text-xs text-muted-foreground font-mono">
                  Household Serving: <strong className="text-white">{modalFood.serving_unit}</strong> ({modalFood.serving_size_grams}g)
                  {modalFood.preparation_state && ` • State: ${modalFood.preparation_state}`}
                </p>
              </div>

              <button
                onClick={() => setModalFood(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5">
              {/* Per Serving vs Per 100g Comparison */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Core Macronutrient Breakdown
                </h4>
                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-charcoal-950">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-charcoal-900 text-muted-foreground font-bold text-[11px]">
                        <th className="p-3">Nutrient</th>
                        <th className="p-3 text-right">Per Serving ({modalFood.serving_unit})</th>
                        <th className="p-3 text-right font-mono text-lime-electric">Per 100g</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      <tr>
                        <td className="p-3 text-white font-sans font-bold">Calories</td>
                        <td className="p-3 text-right text-white font-bold">{modalFood.calories} kcal</td>
                        <td className="p-3 text-right text-lime-electric font-bold">
                          {modalFood.calories_per_100g || Math.round((modalFood.calories / (modalFood.serving_size_grams || 100)) * 100)} kcal
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 text-white font-sans font-bold">Protein</td>
                        <td className="p-3 text-right text-lime-electric font-bold">{modalFood.protein_g}g</td>
                        <td className="p-3 text-right text-lime-electric">
                          {((modalFood.protein_g / (modalFood.serving_size_grams || 100)) * 100).toFixed(1)}g
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 text-white font-sans font-bold">Carbohydrates</td>
                        <td className="p-3 text-right text-amber-400 font-bold">{modalFood.carbs_g}g</td>
                        <td className="p-3 text-right text-amber-400">
                          {((modalFood.carbs_g / (modalFood.serving_size_grams || 100)) * 100).toFixed(1)}g
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 text-white font-sans font-bold">Dietary Fiber</td>
                        <td className="p-3 text-right text-emerald-400 font-bold">{modalFood.fiber_g}g</td>
                        <td className="p-3 text-right text-emerald-400">
                          {((modalFood.fiber_g / (modalFood.serving_size_grams || 100)) * 100).toFixed(1)}g
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 text-white font-sans font-bold">Healthy Fats</td>
                        <td className="p-3 text-right text-sky-400 font-bold">{modalFood.healthy_fat_g}g</td>
                        <td className="p-3 text-right text-sky-400">
                          {((modalFood.healthy_fat_g / (modalFood.serving_size_grams || 100)) * 100).toFixed(1)}g
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bad Nutrients Watch */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-400 mb-2">
                  <ShieldAlert className="h-4 w-4" />
                  Health Watch Nutrients (Per Serving)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div className="p-3 rounded-xl bg-charcoal-950 border border-white/5">
                    <span className="text-[10px] text-muted-foreground block">Saturated Fat</span>
                    <span className="text-sm font-black font-mono text-white">
                      {modalFood.bad_nutrients?.saturated_fat_g ?? 0}g
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-charcoal-950 border border-white/5">
                    <span className="text-[10px] text-muted-foreground block">Trans Fat</span>
                    <span className="text-sm font-black font-mono text-emerald-400">
                      {modalFood.bad_nutrients?.trans_fat_g ?? 0}g
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-charcoal-950 border border-white/5">
                    <span className="text-[10px] text-muted-foreground block">Sodium</span>
                    <span className="text-sm font-black font-mono text-white">
                      {modalFood.bad_nutrients?.sodium_mg ?? 0}mg
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-charcoal-950 border border-white/5">
                    <span className="text-[10px] text-muted-foreground block">Added Sugar</span>
                    <span className="text-sm font-black font-mono text-white">
                      {modalFood.bad_nutrients?.added_sugar_g ?? 0}g
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-charcoal-950 border border-white/5">
                    <span className="text-[10px] text-muted-foreground block">Cholesterol</span>
                    <span className="text-sm font-black font-mono text-white">
                      {modalFood.bad_nutrients?.cholesterol_mg ?? 0}mg
                    </span>
                  </div>
                </div>
              </div>

              {/* Micronutrients & Vitamins */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-lime-electric mb-2">
                  <Sparkles className="h-4 w-4" />
                  Vitamins & Essential Minerals (Per Serving)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-charcoal-950 border border-white/5">
                    <span className="text-[10px] text-muted-foreground block">Calcium</span>
                    <span className="text-sm font-bold font-mono text-white">
                      {modalFood.micronutrients?.calcium_mg ?? 0} mg
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-charcoal-950 border border-white/5">
                    <span className="text-[10px] text-muted-foreground block">Iron</span>
                    <span className="text-sm font-bold font-mono text-white">
                      {modalFood.micronutrients?.iron_mg ?? 0} mg
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-charcoal-950 border border-white/5">
                    <span className="text-[10px] text-muted-foreground block">Potassium</span>
                    <span className="text-sm font-bold font-mono text-white">
                      {modalFood.micronutrients?.potassium_mg ?? 0} mg
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-charcoal-950 border border-white/5">
                    <span className="text-[10px] text-muted-foreground block">Zinc</span>
                    <span className="text-sm font-bold font-mono text-white">
                      {modalFood.micronutrients?.zinc_mg ?? 0} mg
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-charcoal-950 border border-white/5">
                    <span className="text-[10px] text-muted-foreground block">Vitamin C</span>
                    <span className="text-sm font-bold font-mono text-white">
                      {modalFood.micronutrients?.vitamin_c_mg ?? 0} mg
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-charcoal-950 border border-white/5">
                    <span className="text-[10px] text-muted-foreground block">Vitamin D</span>
                    <span className="text-sm font-bold font-mono text-white">
                      {modalFood.micronutrients?.vitamin_d_iu ?? 0} IU
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-charcoal-950 border border-white/5">
                    <span className="text-[10px] text-muted-foreground block">Vitamin B12</span>
                    <span className="text-sm font-bold font-mono text-white">
                      {modalFood.micronutrients?.vitamin_b12_mcg ?? 0} mcg
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-charcoal-950 border border-white/5">
                    <span className="text-[10px] text-muted-foreground block">Vitamin A</span>
                    <span className="text-sm font-bold font-mono text-white">
                      {modalFood.micronutrients?.vitamin_a_mcg ?? 0} mcg
                    </span>
                  </div>
                </div>
              </div>

              {/* Goal suitability & timings */}
              <div className="p-3.5 rounded-2xl bg-charcoal-950/60 border border-white/5 space-y-1.5 text-xs">
                <span className="text-muted-foreground block font-semibold">Recommended Fitness Integration:</span>
                <div className="flex flex-wrap items-center gap-2">
                  {modalFood.goal_suitability?.map((g) => (
                    <Badge key={g} variant="outline" className="text-xs">
                      {g === "fat_loss" ? "🔥 Excellent for Calorie Deficit / Fat Loss" : g === "muscle_gain" ? "💪 High Protein / Muscle Synthesis" : "🥗 General Longevity & Micronutrients"}
                    </Badge>
                  ))}
                </div>
                {modalFood.suggested_timing && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Optimal Meal Timings: <strong className="text-white">{modalFood.suggested_timing.join(", ").replace(/_/g, " ")}</strong>
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-charcoal-950/60 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalFood(null)}
                className="text-xs border-white/10"
              >
                Close
              </Button>

              <Button
                variant={selectedFoods[modalFood.id] ? "default" : "default"}
                size="sm"
                onClick={() => {
                  toggleSelectFood(modalFood);
                  setModalFood(null);
                }}
                className="font-bold text-xs shadow-lime-sm"
              >
                {selectedFoods[modalFood.id] ? "Remove from Meal Plan" : "+ Add to Meal Planner Tray"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
