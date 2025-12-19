import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavigationBarProps {
	signedIn: boolean;
	user: any | null;
}

export function NavigationBar({ signedIn, user }: NavigationBarProps) {
	return (
		<header className="bg-background sticky top-0 z-50">
			<div className="mx-auto flex w-full max-w-xl items-center justify-between gap-8 px-4 py-4 sm:px-6">
				<div className="w-full text-muted-foreground flex items-center gap-8 font-medium lg:gap-16">
					<a href="/">
						<Logo theme={"dark"} />
					</a>
				</div>

				<div className="flex items-center gap-4">
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}
