import { createClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_SUPABASE_URL || "https://dedgyznbbmkfssnrpjqg.supabase.co";
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_4hFl0gymacD8s9-F9M8dTw_Z98FwbY1";
export const supabase = createClient(url, key);