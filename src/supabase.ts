import { createClient } from "@supabase/supabase-js";
// Publishable key is safe in the browser; access is enforced by Row Level Security.
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
