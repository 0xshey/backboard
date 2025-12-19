import Image from "next/image";

export function Logo({
	theme = "light",
	withText = true,
	className,
}: {
	theme?: "light" | "dark";
	withText?: boolean;
	className?: string;
}) {
	const logoURL =
		theme == "dark" ? "/backboard-logo-white.png" : "/backboard-logo.png";

	return (
		<div className={`flex items-center gap-2 ${className}`}>
			<Image src={logoURL} height={30} width={30} alt="Backboard Logo" />
			{withText && (
				<>
					<h1 className="text-xl font-semibold tracking-tighter text-foreground">
						Backboard
					</h1>
					<span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-lg">
						alpha
					</span>
				</>
			)}
		</div>
	);
}
