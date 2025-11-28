"use client";
import { useState, useEffect } from "react";
import { fetchTeamHeader } from "@/lib/supabase";
import type { TeamHeader } from "@/lib/types";
import { cn, ordinalSuffix } from "@/lib/utils";

import TeamLogo from "@/components/nba/team-logo";
import Loader from "@/components/loader";

export default function TeamHeader({ teamId }: { teamId: string }) {
	const [team, setTeam] = useState<TeamHeader | null>(null);
	const [error, setError] = useState<Error | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchData = async (teamId: string) => {
			setLoading(true);
			setError(null);

			try {
				// Fetch team
				const { data, error } = await fetchTeamHeader(teamId);
				if (error) throw error;
				setTeam(data[0]);
			} catch (error) {
				setError(error as Error);
			} finally {
				setLoading(false);
			}
		};

		fetchData(teamId);
	}, [teamId]);

	if (loading) return <Loader className="w-full max-w-4xl" />;
	if (error) return <p>Error: {error.message}</p>;
	if (!team) return <p>No team found</p>;

	const getRankClasses = (rank: number, division: boolean = false) => {
		if (division && rank > 3) return "bg-gray-300 text-black";

		if (rank === 1)
			return "bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-[#C9B037] to-[#AF9500] border-[#AF9500] text-black";
		if (rank === 2)
			return "bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-[#B4B4B4] to-[#757575] border-[#757575] text-black";
		if (rank === 3)
			return "bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-[#AD8A56] to-[#6A3805] border-[#6A3805] text-black";
		// Playoff spots
		if (rank >= 4 && rank <= 6)
			return "bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-green-500 to-foreground border-green-500 text-background";
		// Play-in spots
		if (rank >= 7 && rank <= 10)
			return "bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] to-amber-500 from-foreground border-amber-500 text-background";
		// Lottery spots
		if (rank >= 11 && rank <= 14)
			return "bg-[radial-gradient(circle_at_bottom,var(--tw-gradient-stops))] to-orange-500 from-foreground border-orange-500 text-background";
		if (rank === 15)
			return "bg-[radial-gradient(circle_at_bottom,var(--tw-gradient-stops))] to-red-500 from-background border-red-800 text-foreground";
		return "";
	};

	return (
		<div className="rounded p-4 w-full max-w-4xl relative min-h-80">
			<TeamLogo
				teamId={teamId}
				size={400}
				className="opacity-40 -z-10 absolute-center"
			/>
			<div className="flex flex-col items-center gap-1 text-4xl whitespace-nowrap z-10 absolute-center pb-16">
				<p className="backdrop-blur-sm font-extralight">{team.city}</p>
				<p className="backdrop-blur-sm font-mono font-bold text-6xl">
					{team.name}
				</p>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2 text-center w-full absolute-center-x bottom-0">
				<DataChip className={getRankClasses(team.conferenceRank)}>
					<p className="font-medium md:font-bold leading-none">
						<span className="text-3xl">{team.conferenceRank}</span>
						<span className="">
							{ordinalSuffix(team.conferenceRank)}
						</span>
					</p>
					<div>
						{team.clinchedConference ? (
							// <TrophyIcon size={20} strokeWidth={3} />
							<span>🏆</span>
						) : team.clinchedPlayoff ? (
							// <LockIcon size={20} strokeWidth={2.5} />
							<span>🔒</span>
						) : team.clinchedPlayIn ? (
							// <MergeIcon size={20} strokeWidth={2.5} />
							<span>🔓</span>
						) : team.eliminatedConference ? (
							// <CircleSlashIcon size={20} strokeWidth={2.5} />
							<span>🚫</span>
						) : null}
					</div>
					<div className="flex flex-col items-end justify-between gap-0.5">
						<span className="leading-none font-mono text-xs font-bold uppercase">
							{team.conference}
						</span>
						<span className="leading-none font-mono text-xs font-medium uppercase">
							{team.conferenceRecord}
						</span>
					</div>
				</DataChip>
				<DataChip className={getRankClasses(team.divisionRank, true)}>
					<p className="font-medium md:font-bold leading-none">
						<span className="text-3xl">{team.divisionRank}</span>
						<span className="">
							{ordinalSuffix(team.divisionRank)}
						</span>
					</p>
					<div>
						{team.clinchedDivision ? (
							// <TrophyIcon size={20} strokeWidth={3} />
							<span>🏆</span>
						) : team.eliminatedDivision ? (
							// <CircleSlashIcon size={20} strokeWidth={2.5} />
							<span>🚫</span>
						) : null}
					</div>
					<div className="flex flex-col items-end justify-between gap-0.5">
						<span className="leading-none font-mono text-xs font-bold uppercase">
							{team.division}
						</span>
						<span className="leading-none font-mono text-xs font-medium uppercase">
							{team.divisionRecord}
						</span>
					</div>
				</DataChip>
				<DataChip className="justify-between bg-foreground text-background">
					<div className="flex flex-col items-start">
						<p className="font-medium md:font-bold text-lg leading-none">
							{team.wins}-{team.losses}
						</p>
						<p className="font-medium md:font-bold font-mono text-xs leading-none text-muted">
							{team.winPct}
						</p>
					</div>
					<div className="flex flex-col items-end">
						<p className="font-medium md:font-bold text-lg leading-none">
							{team.l10Record}
						</p>
						<p className="font-medium md:font-bold font-mono text-xs leading-none text-muted">
							L10
						</p>
					</div>
				</DataChip>
				<DataChip className="justify-between bg-foreground text-background">
					<div className="flex flex-col items-start">
						<p className="font-medium md:font-bold text-lg leading-none">
							{team.pointsFor}
						</p>
						<p className="font-medium md:font-bold font-mono text-xs leading-none text-muted">
							PF
						</p>
					</div>
					<div className="flex flex-col items-center">
						<p
							className={cn(
								"font-medium md:font-bold text-lg leading-none",
								{
									"text-green-700":
										team.pointsFor > team.pointsAgainst,
									"text-red-700":
										team.pointsFor < team.pointsAgainst,
									"text-muted-foreground":
										team.pointsFor === team.pointsAgainst,
								}
							)}
						>
							{team.pointsFor > team.pointsAgainst
								? `+${team.pointsFor - team.pointsAgainst}`
								: team.pointsFor - team.pointsAgainst}
						</p>
					</div>
					<div className="flex flex-col items-end">
						<p className="font-medium md:font-bold text-lg leading-none">
							{team.pointsAgainst}
						</p>
						<p className="font-medium md:font-bold font-mono text-xs leading-none text-muted">
							PA
						</p>
					</div>
				</DataChip>
			</div>

			{/* <pre>{JSON.stringify(team, null, 2)}</pre> */}
		</div>
	);
}

function DataChip({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className="flex flex-col w-full h-full">
			<div
				className={cn(
					"border-b-2 border-b-muted-foreground rounded-lg flex items-center justify-between px-3 py-1 h-12",
					className
				)}
			>
				{children}
			</div>
		</div>
	);
}
