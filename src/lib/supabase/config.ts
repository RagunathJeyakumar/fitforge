const FALLBACK_SUPABASE_URL = "https://prrokazgztrxztadqbqc.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBycm9rYXpnenRyeHp0YWRxYnFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3MzAxNDIsImV4cCI6MjEwNzMwNjE0Mn0.gB0WIBdftWZtbmsRPX4mUxO5GGhR1_zrEGeIvVkp_tM";

export const getSupabaseConfig = () => {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;
  const url = rawUrl ? rawUrl.trim() : "";
  const anonKey = rawKey ? rawKey.trim() : "";

  const isConfigured = Boolean(
    url &&
    anonKey &&
    url.startsWith("https://") &&
    !url.includes("your-project-id") &&
    !url.includes("placeholder-project")
  );

  return {
    url: url || FALLBACK_SUPABASE_URL,
    anonKey: anonKey || FALLBACK_SUPABASE_ANON_KEY,
    isConfigured,
  };
};

