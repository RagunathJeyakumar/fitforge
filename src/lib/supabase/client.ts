import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

let supabaseClient: ReturnType<typeof createClient> | null = null;

export const getSupabaseBrowserClient = () => {
  if (supabaseClient) return supabaseClient;

  const { url, anonKey } = getSupabaseConfig();
  supabaseClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return supabaseClient;
};
