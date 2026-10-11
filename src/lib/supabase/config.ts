export const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isConfigured = Boolean(
    url &&
    anonKey &&
    url.startsWith("https://") &&
    !url.includes("your-project-id")
  );

  return {
    url: url || "https://placeholder-project.supabase.co",
    anonKey: anonKey || "placeholder-anon-key",
    isConfigured,
  };
};
