import { NavigationBar } from "@/components/navigation/navigation-bar";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/(auth)/actions";

export async function NavigationBarProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	// Create the server-side Supabase client
	const supabase = await createClient();

	// Fetch the authenticated user (SSR)
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const signedIn = user !== null;

	return (
		<>
			<NavigationBar
				signedIn={signedIn}
				user={user ?? null}
				signOutAction
			/>
			{/* <p>{JSON.stringify(user, null, 2)}</p> */}
			<main className="pt-20">{children}</main>
		</>
	);
}
