import { createClient } from "@supabase/supabase-js";
// The URL and publishable key are public by design (access is enforced by Row Level Security).
// Fallbacks keep the site from crashing to a blank page if the env vars are missing on a deploy.
const url = import.meta.env.VITE_SUPABASE_URL || "https://dedgyznbbmkfssnrpjqg.supabase.co";
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_4hFl0gymacD8s9-F9M8dTw_Z98FwbY1";
export const supabase = createClient(url, key);
