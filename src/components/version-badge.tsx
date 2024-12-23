// Version number is currently static, but should be replaced by package.json value in the future

export function VersionBadge() {
	return (
		<div className="bg-muted px-4 py-0.5 text-sm rounded-full border border-muted-foreground font-mono font-medium tracking-wide">
			v0.1.1b (alpha)
		</div>
	);
}
