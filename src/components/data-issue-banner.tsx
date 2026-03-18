import { TriangleAlert } from "lucide-react";

export function DataIssueBanner() {
	return (
		<div className="w-full bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-3">
			<div className="max-w-6xl mx-auto flex items-start gap-3">
				<TriangleAlert className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
				<p className="text-sm text-yellow-700 dark:text-yellow-400 leading-snug">
					<span className="font-semibold">Data may be incomplete.</span>{" "}
					We&apos;re currently experiencing issues with our data pipeline. Some stats and rankings may be missing or outdated. This may take some time to repair — thank you for your patience.
				</p>
			</div>
		</div>
	);
}
