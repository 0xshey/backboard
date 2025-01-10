import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { VersionBadge } from "@/components/version-badge";

export default function Home() {
	return (
		<section className="container w-full">
			<div className="grid place-items-center lg:max-w-screen-xl gap-16 mx-auto py-20 md:py-32">
				<VersionBadge />
				<div className="flex flex-col items-center gap-8">
					<h1 className="text-center text-4xl md:text-5xl tracking-tight max-w-1/4">
						NBA Fantasy Point Rankings Daily
					</h1>
					<p className="text-center text-balance tracking-wide text-muted-foreground">
						See todays top &#40;and bottom&#41; NBA players ranked
						by their fantasy points.
					</p>
					<div className="border rounded-full border-green-500 bg-green-500 bg-opacity-20 px-4 py-2">
						<p className={"text-green-500"}>New Games Page!</p>
					</div>
					<div className="flex items-center gap-4">
						<Button asChild variant={"default"}>
							<Link href="/players">
								Player Rankings{" "}
								<ArrowRight className="w-6 h-6" />
							</Link>
						</Button>
						<Button asChild variant={"outline"}>
							<Link href="/games">
								Daily Games <ArrowRight className="w-6 h-6" />
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
