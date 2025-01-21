import { TeamHeader, TeamRoster, TeamGames } from "@/components/team";

export default async function TeamPage({
	params,
}: {
	params: Promise<{ teamId: string }>;
}) {
	const teamId = (await params).teamId;

	return (
		<div className="mt-16 flex flex-col items-center gap-4 w-full max-w-full ">
			<TeamHeader teamId={teamId} />
			<TeamRoster teamId={teamId} />
			<TeamGames teamId={teamId} />
		</div>
	);
}
