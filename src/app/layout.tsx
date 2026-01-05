import "@/styles/globals.css";

// import FontProvider from "@/components/providers/font-provider";
import ThemeProvider from "@/components/providers/theme-provider";
import MetaProvider from "@/components/providers/meta-provider";
import NavigationProvider from "@/components/providers/navigation-provider";
import Footer from "@/components/footer";

type LayoutProps = {
	children: React.ReactNode;
	metadata?: React.ComponentProps<typeof MetaProvider>;
};

export default function Layout({ children }: LayoutProps) {
	return (
		<html lang="en" suppressHydrationWarning>
			<MetaProvider />
			<body>
				<ThemeProvider
					attribute="class"
					enableSystem
					disableTransitionOnChange
				>
					<NavigationProvider>
						<div className="h-full">
							<main className="w-full min-h-dvh flex flex-col items-center">
								{children}
							</main>
							<Footer />
						</div>
					</NavigationProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
