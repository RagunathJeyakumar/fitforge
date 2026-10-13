import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export const getSupabaseBrowserClient = () => {
  if (supabaseClient) return supabaseClient;

  const { url, anonKey } = getSupabaseConfig();
  supabaseClient = createBrowserClient(url, anonKey);

  return supabaseClient;
};

