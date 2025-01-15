import { TeamHeader, TeamRoster, TeamGames } from "@/components/team";

export default async function TeamPage({
	params,
}: {
	params: Promise<{ teamId: string }>;
}) {
	const teamId = (await params).teamId;

	return (
		<>
			<TeamHeader teamId={teamId} />
			<TeamRoster teamId={teamId} />
			<TeamGames teamId={teamId} />
		</>
	);
}
