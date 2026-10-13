export const getSupabaseConfig = () => {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const url = rawUrl ? rawUrl.trim() : "";
  const anonKey = rawKey ? rawKey.trim() : "";

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
