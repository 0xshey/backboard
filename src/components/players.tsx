import { cn, parseDuration } from "@/lib/utils";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import TeamLogo from "@/components/nba/team-logo";

export default function PlayersTable({ players, tag, sortDefault, loading }) {
	if (loading) {
		return <Skeleton className="w-full h-20" />;
	}

	if (!players) {
		return <p>Players object is null</p>;
	}

	if (players.length == 0) {
		return <p>No players in the list yet</p>;
	}

	return (
		<>
			<p>Player Table has {players.length} players</p>
		</>
	);
}
