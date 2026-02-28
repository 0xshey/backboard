import Link from "next/link";
import { PlayerSearch } from "@/components/home/player-search";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChartScatter } from "lucide-react";

export default async function Page() {
	return (
		<div className="relative w-full min-h-screen flex flex-col items-center overflow-x-hidden">
			{/* Foreground Content */}
			<div className="relative z-10 w-full flex flex-col items-center pt-32 pb-24 px-4">
				{/* Hero Section */}
				<div className="flex flex-col items-center text-center max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
					<h1 className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tighter mb-6 drop-shadow-2xl">
						Track Today's Fantasy Performers
					</h1>
					<p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl drop-shadow-md">
						Daily rankings, deep analytics, and player consistency
						tools to help you dominate your fantasy basketball
						league.
					</p>

					<div className="flex flex-wrap gap-4 justify-center mb-10">
						<Button
							asChild
							size="lg"
							className="rounded-full text-base h-12 px-8 shadow-orange-500/20 shadow-lg hover:shadow-orange-500/40 transition-all"
						>
							<Link href="/rankings">
								Today's Rankings{" "}
								<ArrowRight className="ml-2 w-5 h-5" />
							</Link>
						</Button>
						<Button
							asChild
							variant="secondary"
							size="lg"
							className="rounded-full text-base h-12 px-8 backdrop-blur-sm bg-background/50 border hover:bg-background/80"
						>
							<Link href="/consistency">
								Season Consistency{" "}
								<ChartScatter className="ml-2 w-5 h-5" />
							</Link>
						</Button>
					</div>

					{/* Player search */}
					<div className="w-full max-w-lg mx-auto flex flex-col items-center gap-8 mt-24">
						<div className="flex items-center gap-3 w-full">
							<div className="flex-1 h-px bg-border/40" />
							<span className="text-xs text-muted-foreground/60 uppercase tracking-widest font-medium">
								or find a specific player
							</span>
							<div className="flex-1 h-px bg-border/40" />
						</div>
						<PlayerSearch />
					</div>
				</div>
			</div>
		</div>
	);
}
