import Link from "next/link";
import Image from "next/image";

import { ArrowRight } from "lucide-react";
import { VersionBadge } from "@/components/version-badge";

export default function Home() {
	return (
		<div className="w-full flex justify-center relative">
			<Image
				src="logo-gradient.svg"
				alt="Backboard Gradient Background"
				layout="fill"
				objectFit="fixed"
				className="opacity-40 -z-10 pb-[50vh] md:pb-[20vh] fixed"
			/>
			<section className="container w-full">
				<div className="grid place-items-center lg:max-w-screen-xl gap-16 mx-auto py-16 md:py-32">
					<h1 className="text-center text-7xl md:text-8xl tracking-tighter max-w-1/4 font-medium md:font-semibold">
						<span>Backboard</span>{" "}
						<span className="text-2xl">&trade;</span>
					</h1>
				</div>
				<div className="grid grid-cols-4 md:grid-cols-6 gap-4 px-4">
					<div className="col-span-4 aspect-[2] border bg-muted/50 rounded-xl backdrop-blur-lg shadow-sm p-6  flex flex-col justify-center gap-4">
						<div className="w-full flex items-center justify-between gap-4">
							<VersionBadge />
							<span className="text-sm font-mono text-muted-foreground/50">
								January 21, 2025
							</span>
						</div>
						<div className="text-pretty text-muted-foreground text-sm md:text-base">
							<ul className="list-disc pl-5 flex flex-col gap-2">
								<li>
									Added Standings and individual Team pages.
								</li>
								<li>
									This homepage is brand new with a fresh
									design and layout.
								</li>
							</ul>
						</div>
						<p className="text-muted-foreground/50 text-xs font-mono pl-5">
							New version coming soon... Almost at 1.0
						</p>
					</div>
					<Link
						href={"/games"}
						className="group cursor-pointer col-span-2 aspect-square border bg-foreground/10 rounded-xl backdrop-blur-lg shadow-sm p-4 flex flex-col justify-end gap-4 overflow-hidden"
					>
						<Image
							src={"/tile-glyphs/games.svg"}
							alt="Games Glyph"
							layout="fill"
							objectFit="contain"
							className="-z-10 filter grayscale opacity-80"
						/>
						<div className="absolute inset-0 h-full w-full bg-gradient-to-t from-background/90 to-background/10"></div>
						<div className="z-20 w-fit flex items-center gap-2 bg-orange-500/20 border-orange-500 text-orange-600 border px-4 py-0.5 rounded-full backdrop-blur">
							<p className="font-mono font-medium tracking-wide text-sm">
								Updated
							</p>
						</div>
						<h2 className="pl-1 z-20 text-2xl font-medium text-pretty">
							Today&apos; Games{" "}
							<ArrowRight className="w-6 h-6 inline-block ml-0 group-hover:ml-1 transition-all duration-300" />
						</h2>
					</Link>
					<Link
						href={"/players"}
						className="group cursor-pointer col-span-2 aspect-square border bg-foreground/10 rounded-xl backdrop-blur-lg shadow-sm p-4 flex flex-col justify-end gap-4 overflow-hidden"
					>
						<Image
							src={"/tile-glyphs/players.svg"}
							alt="Players Glyph"
							layout="fill"
							objectFit="contain"
							className="-z-10 filter grayscale opacity-80"
						/>
						<div className="absolute inset-0 h-full w-full bg-gradient-to-t from-background/90 to-background/10"></div>
						<h2 className="pl-1 z-20 text-2xl font-medium text-pretty">
							Today&apos;s Players{" "}
							<ArrowRight className="w-6 h-6 inline-block ml-0 group-hover:ml-1 transition-all duration-300" />
						</h2>
					</Link>

					<Link
						href={"/standings"}
						className="group cursor-pointer col-span-4 aspect-[2] border bg-foreground/10 rounded-xl backdrop-blur-lg shadow-sm p-4 flex flex-col justify-end gap-4 overflow-hidden"
					>
						<Image
							src={"/tile-glyphs/standings.svg"}
							alt="Standings Glyph"
							layout="fill"
							objectFit="contain"
							className="-z-10 filter grayscale opacity-80"
						/>
						<div className="absolute inset-0 h-full w-full bg-gradient-to-t from-background/90 to-background/10"></div>
						<div className="z-20 w-fit flex items-center gap-2 bg-green-500/20 border-green-500 text-green-600 border px-4 py-0.5 rounded-full backdrop-blur">
							<p className="font-mono font-medium tracking-wide text-sm">
								New
							</p>
						</div>
						<h2 className="pl-1 z-20 text-2xl font-medium text-pretty">
							League Standings{" "}
							<ArrowRight className="w-6 h-6 inline-block ml-0 group-hover:ml-1 transition-all duration-300" />
						</h2>
					</Link>
				</div>
			</section>
		</div>
	);
}
