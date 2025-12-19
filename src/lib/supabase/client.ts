import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Client-side (browser) Supabase instance
export const supabaseClient = createClient<Database>(
	process.env.SUPABASE_URL!,
	process.env.SUPABASE_ANON_KEY!,
	{
		auth: {
			persistSession: true,
			autoRefreshToken: true,
			detectSessionInUrl: true,
		},
	}
);
