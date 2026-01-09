"use client";

import Image from "next/image";
import { TZDate } from "@date-fns/tz";
import { playerSiloURL, teamLogoURL } from "@/lib/image-urls";
import { valueToRGB } from "@/lib/value-to-color";
import { cn } from "@/lib/utils";

interface TopPerformersProps {
	gamePlayers: any[];
	nyDate: string;
}

export function TopPerformers({ gamePlayers, nyDate }: TopPerformersProps) {
	const nyDateObj = new TZDate(nyDate as string, "America/New_York");

	const dateLabel = (() => {
		const now = new TZDate(new Date(), "America/New_York");
		if (nyDateObj.toDateString() === now.toDateString()) return "Today";

		const yesterday = new TZDate(now, "America/New_York");
		yesterday.setDate(yesterday.getDate() - 1);
		if (nyDateObj.toDateString() === yesterday.toDateString())
			return "Yesterday";

		return nyDateObj.toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		});
	})();

	return (
		<div className="w-full flex flex-col items-center gap-6">
			<div className="flex flex-col items-center gap-1">
				<h2 className="text-2xl font-bold tracking-tight">
					Top Performers
				</h2>
				<p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">
					{dateLabel}
				</p>
			</div>

			<div
				className={cn(
					"w-full flex items-start gap-4 overflow-x-scroll justify-start xl:justify-center px-4 pb-4",
					"overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
				)}
			>
				{gamePlayers?.map((gp: any) => (
					<div
						key={gp.player_id}
						className="w-40 aspect-[440/900] relative flex flex-col items-center justify-end min-w-60 group overflow-hidden rounded-3xl transition-all duration-300"
					>
						{/* Background effects */}
						<div
							className="absolute inset-0 opacity-40 pointer-events-none max-w-40% -translate-y-30 transition-all duration-300 group-hover:opacity-80"
							style={{
								background: `radial-gradient(circle at center, ${
									(gp.team as any)?.color_primary_hex ||
									"#000"
								} 0%, transparent 40%)`,
							}}
						/>
						<div className="absolute inset-0 opacity-30 mix-blend-luminosity pointer-events-none group-hover:grayscale-0 transition-all duration-500 -translate-y-30">
							<Image
								src={teamLogoURL(gp.team_id)}
								alt={gp.team?.tricode || ""}
								fill
								className="object-contain p-4"
							/>
						</div>
						<div className="w-full h-full z-10 absolute inset-0 pointer-events-none -translate-y-15 aspect-[440/700]">
							<Image
								src={playerSiloURL(gp.player_id)}
								alt={gp.first_name + " " + gp.last_name}
								fill
								className="object-contain"
							/>
						</div>
						{/* Player Info Overlay */}
						<div className="w-full flex flex-col z-20 mb-4 px-4">
							<span className="text-xs font-mono uppercase text-foreground/70 tracking-widest">
								{gp.team?.tricode} #{gp.player.jersey_number}
							</span>
							<h2 className="text-xl font-bold leading-tight text-foreground whitespace-nowrap w-50 truncate">
								{gp.first_name}
								<br />
								{gp.last_name}
							</h2>
						</div>
						<div className="w-full bg-muted rounded-xl">
							{/* Statline */}
							<div className="grid grid-cols-6 gap-0 w-full border-t border-border/30 pt-4 px-2">
								{[
									{ label: "PTS", val: gp.points },
									{
										label: "REB",
										val: gp.rebounds_total,
									},
									{ label: "AST", val: gp.assists },
									{ label: "STL", val: gp.steals },
									{ label: "BLK", val: gp.blocks },
									{ label: "TOV", val: gp.turnovers },
								].map((s) => (
									<div
										key={s.label}
										className="flex flex-col items-center"
									>
										<span className="text-lg font-semibold leading-none mb-1">
											{s.val}
										</span>
										<span className="text-[10px] tracking-wide text-muted-foreground/60 tracking-tighter uppercase">
											{s.label}
										</span>
									</div>
								))}
							</div>
							{/* Info Box */}
							<div className="w-full relative z-20 bg-background/60 backdrop-blur-md px-4 py-2 border-t border-border/50">
								{/* Opp & FP */}
								<div className="flex items-end justify-between">
									<div className="flex flex-col items-start justify-end my-2 gap-2">
										<div className="text-2xl font-semibold tracking-tighter leading-none text-muted-foreground/40">
											{gp.opp_team.tricode}
										</div>
										<div>
											<div className="flex items-center justify-center bg-muted text-[10px] font-semibold text-muted-foreground leading-none px-1 aspect-square rounded">
												{gp.game.team_home_id ==
												gp.opp_team_id ? (
													<p>A</p>
												) : (
													<p>H</p>
												)}
											</div>
										</div>
									</div>
									<div className="flex flex-col items-end justify-end my-2">
										<div
											className="text-4xl font-semibold tracking-tighter leading-none"
											style={{
												color: valueToRGB({
													value: gp.fp || 0,
													min: 20,
													max: 70,
													midColor: [
														180, 180, 180, 1,
													],
												}),
											}}
										>
											{(gp.fp || 0).toFixed(1)}
										</div>
										<span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase mt-1">
											FP
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
