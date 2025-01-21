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
						<div className="min-h-dvh">
							<Navigator />
							{children}
						</div>
						<Footer />
					</FontProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
