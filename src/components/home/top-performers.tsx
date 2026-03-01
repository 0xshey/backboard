"use client";

import Image from "next/image";
import { TZDate } from "@date-fns/tz";
import { playerHeadshotURL } from "@/lib/image-urls";
import { valueToRGB } from "@/lib/value-to-color";

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
		<div className="w-full max-w-5xl mx-auto px-4 flex flex-col items-center gap-6">
			{/* Header */}
			<div className="flex flex-col items-center gap-1">
				<h2 className="text-4xl md:text-5xl font-bold tracking-tight">
					Top Performers
				</h2>
				<p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">
					{dateLabel}
				</p>
			</div>

			{/* Glassy container */}
			<div className="w-full rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5 dark:bg-white/3 overflow-hidden shadow-2xl shadow-black/20">
				{/* Desktop table header */}
				<div className="hidden md:grid grid-cols-[3rem_1fr_4rem_4rem_4rem_4rem_4rem_4rem_5.5rem] items-center gap-0 px-5 py-3 border-b border-white/10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
					<div className="text-center">#</div>
					<div>Player</div>
					<div className="text-center">PTS</div>
					<div className="text-center">REB</div>
					<div className="text-center">AST</div>
					<div className="text-center">STL</div>
					<div className="text-center">BLK</div>
					<div className="text-center">TOV</div>
					<div className="text-right">FP</div>
				</div>

				{/* Rows */}
				{gamePlayers?.map((gp: any, index: number) => {
					const fpColor = valueToRGB({
						value: gp.fp || 0,
						min: 20,
						max: 70,
						midColor: [180, 180, 180, 1],
					});

					const stats = [
						{ label: "PTS", val: gp.points },
						{ label: "REB", val: gp.rebounds_total },
						{ label: "AST", val: gp.assists },
						{ label: "STL", val: gp.steals },
						{ label: "BLK", val: gp.blocks },
						{ label: "TOV", val: gp.turnovers },
					];

					return (
						<div
							key={gp.player_id}
							className="group border-b border-white/5 last:border-b-0 hover:bg-white/4 transition-colors duration-200"
						>
							{/* Desktop Row */}
							<div className="hidden md:grid grid-cols-[3rem_1fr_4rem_4rem_4rem_4rem_4rem_4rem_5.5rem] items-center gap-0 px-5 py-3">
								{/* Rank */}
								<div className="text-center text-lg font-bold text-muted-foreground/50 tabular-nums">
									{index + 1}
								</div>

								{/* Player info */}
								<div className="flex items-center gap-3 min-w-0">
									<div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted/30 shrink-0">
										<Image
											src={playerHeadshotURL(gp.player_id)}
											alt={gp.first_name + " " + gp.last_name}
											fill
											className="object-cover scale-[1.4] translate-y-[2px]"
										/>
									</div>
									<div className="min-w-0">
										<div className="font-bold text-base leading-tight truncate">
											{gp.first_name} {gp.last_name}
										</div>
										<div className="flex items-center gap-2 text-xs text-muted-foreground">
											<span>{gp.team?.tricode}</span>
											<span className="text-muted-foreground/30">|</span>
											<span>
												vs {gp.opp_team?.tricode}
											</span>
											<span className="text-[10px] px-1 py-0.5 rounded bg-muted/50 font-medium">
												{gp.game?.team_home_id === gp.opp_team_id ? "A" : "H"}
											</span>
										</div>
									</div>
								</div>

								{/* Stats */}
								{stats.map((s) => (
									<div
										key={s.label}
										className="text-center text-lg font-bold tabular-nums"
									>
										{s.val}
									</div>
								))}

								{/* FP */}
								<div className="text-right">
									<span
										className="text-2xl font-extrabold tabular-nums tracking-tight"
										style={{ color: fpColor }}
									>
										{(gp.fp || 0).toFixed(1)}
									</span>
								</div>
							</div>

							{/* Mobile Card */}
							<div className="md:hidden px-4 py-4">
								<div className="flex items-start gap-3">
									{/* Rank */}
									<div className="text-2xl font-bold text-muted-foreground/30 tabular-nums w-7 shrink-0 pt-1">
										{index + 1}
									</div>

									{/* Player avatar */}
									<div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted/30 shrink-0">
										<Image
											src={playerHeadshotURL(gp.player_id)}
											alt={gp.first_name + " " + gp.last_name}
											fill
											className="object-cover scale-[1.4] translate-y-[2px]"
										/>
									</div>

									{/* Info + Stats */}
									<div className="flex-1 min-w-0">
										<div className="flex items-start justify-between gap-2">
											<div className="min-w-0">
												<div className="font-bold text-base leading-tight truncate">
													{gp.first_name} {gp.last_name}
												</div>
												<div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
													<span>{gp.team?.tricode}</span>
													<span className="text-muted-foreground/30">|</span>
													<span>vs {gp.opp_team?.tricode}</span>
													<span className="text-[10px] px-1 py-0.5 rounded bg-muted/50 font-medium">
														{gp.game?.team_home_id === gp.opp_team_id ? "A" : "H"}
													</span>
												</div>
											</div>
											{/* FP prominent on mobile */}
											<div className="shrink-0 text-right">
												<span
													className="text-3xl font-extrabold tabular-nums tracking-tight leading-none"
													style={{ color: fpColor }}
												>
													{(gp.fp || 0).toFixed(1)}
												</span>
												<div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">
													FP
												</div>
											</div>
										</div>

										{/* Stat grid */}
										<div className="grid grid-cols-6 gap-1 mt-3">
											{stats.map((s) => (
												<div
													key={s.label}
													className="flex flex-col items-center"
												>
													<span className="text-base font-bold tabular-nums leading-none">
														{s.val}
													</span>
													<span className="text-[9px] text-muted-foreground/50 uppercase tracking-wide mt-0.5">
														{s.label}
													</span>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
