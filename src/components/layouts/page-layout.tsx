type LayoutProps = {
	children: React.ReactNode;
};

export default function PageLayout({ children }: LayoutProps) {
	return (
		<main className="w-full max-w-full min-h-dvh flex flex-col items-center">
			{children}
		</main>
	);
}
