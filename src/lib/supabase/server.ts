"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Database } from "@/types/supabase";

export async function createClient() {
	const cookieStore = await cookies();

	return createServerClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet) {
					try {
						cookiesToSet.forEach(({ name, value, options }) =>
							cookieStore.set(name, value, options)
						);
					} catch {
						// can be ignored in Server Components
					}
				},
			},
		}
	);
}

/**
 * Helper: fetch user safely and handle invalid refresh tokens
 */
export async function getUserOrRedirect() {
	const supabase = await createClient();
	const { data, error } = await supabase.auth.getUser();

	if (
		error?.code === "refresh_token_already_used" ||
		error?.message?.includes("Invalid Refresh Token")
	) {
		redirect("/login?message=session_expired");
	}

	return data.user;
}
