import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarDays } from "lucide-react";

export default async function Page() {
	return (
		<div className="relative w-full min-h-screen flex flex-col items-center overflow-x-hidden">
			{/* Foreground Content */}
			<div className="relative z-10 w-full flex flex-col items-center pt-32 pb-24 px-4">
				{/* Hero Section */}
				<div className="flex flex-col items-center text-center max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
					<h1 className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tighter mb-6 drop-shadow-2xl">
						Win Your Fantasy Week
					</h1>
					<p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl drop-shadow-md">
						Weekly schedule planning and points, dynasty and
						category rankings to help you dominate your fantasy
						basketball league.
					</p>

					<div className="flex flex-wrap gap-4 justify-center mb-10">
						<Button
							asChild
							size="lg"
							className="rounded-full text-base h-12 px-8 shadow-orange-500/20 shadow-lg hover:shadow-orange-500/40 transition-all"
						>
							<Link href="/rankings/points">
								Rankings{" "}
								<ArrowRight className="ml-2 w-5 h-5" />
							</Link>
						</Button>
						<Button
							asChild
							variant="secondary"
							size="lg"
							className="rounded-full text-base h-12 px-8 backdrop-blur-sm bg-background/50 border hover:bg-background/80"
						>
							<Link href="/schedule">
								Weekly Schedule{" "}
								<CalendarDays className="ml-2 w-5 h-5" />
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
