import { ReactNode } from "react";
import { NavigationBarProvider } from "@/components/providers/navigation-bar-provider";
import Footer from "@/components/footer";

export default function AppLayout({ children }: { children: ReactNode }) {
	return (
		<NavigationBarProvider>
			<div className="h-full">
				<main className="w-full min-h-dvh flex flex-col items-center">
					{children}
				</main>
				<Footer />
			</div>
		</NavigationBarProvider>
	);
}
