import "@/styles/globals.css";

import FontProvider from "@/components/providers/font-provider";
import ThemeProvider from "@/components/providers/theme-provider";
import MetaProvider from "@/components/providers/meta-provider";

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
					<FontProvider>{children}</FontProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
