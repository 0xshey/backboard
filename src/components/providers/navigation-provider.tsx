import Navigator from "@/components/navigation/navigator";
import { TOOL_LINKS } from "@/lib/navigation-links";

export default async function NavigationProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<Navigator links={TOOL_LINKS} />
			<main className="pt-20">{children}</main>
		</>
	);
}
