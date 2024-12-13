import "@/styles/globals.css";

import FontProvider from "@/components/providers/font-provider";
import ThemeProvider from "@/components/providers/theme-provider";
import MetaProvider from "@/components/providers/meta-provider";

import Navigator from "@/components/navigator";
import Footer from "@/components/footer";

type LayoutProps = {
	children: React.ReactNode;
	metadata?: React.ComponentProps<typeof MetaProvider>;
};

export default function Layout({ children }: LayoutProps) {
	return (
		<html>
			<MetaProvider />
			<body>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					disableTransitionOnChange
				>
					<FontProvider>
						<div className="h-[100%]">
							<Navigator />
							<main className="w-full min-h-dvh flex flex-col items-center">
								{children}
							</main>
							<Footer />
						</div>
					</FontProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
