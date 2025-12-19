import { NavigationBar } from "@/components/navigation/navigation-bar";
import { createClient } from "@/lib/supabase/server";

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
			<NavigationBar signedIn={signedIn} user={user ?? null} />
			{/* <p>{JSON.stringify(user, null, 2)}</p> */}
			<main className="pt-20">{children}</main>
		</>
	);
}
