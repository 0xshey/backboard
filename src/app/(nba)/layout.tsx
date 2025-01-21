import PageLayout from "@/components/layouts/page-layout";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <PageLayout>{children}</PageLayout>;
}
