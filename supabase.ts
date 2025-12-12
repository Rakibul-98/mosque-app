import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ihgmqjedqdaszckogsgr.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZ21xamVkcWRhc3pja29nc2dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyOTMxNTEsImV4cCI6MjA4MDg2OTE1MX0.0nwEazKyT5EvcyZXjMPyjqzVJ1MYjPzp7eb3rvl0OHA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const getAuthSupabase = (userId?: string) => {
  const serviceRoleKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

  if (!serviceRoleKey) {
    console.error("Service role key is missing!");
    // Fall back to anon key for now
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  return createClient(SUPABASE_URL, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        "x-user-id": userId || "",
      },
    },
  });
};
