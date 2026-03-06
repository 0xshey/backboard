import { GameChip } from "@/components/game/game-chip";
import type { TeamStanding } from "@/app/(app)/rankings/functions";

const warriors      = { id: "1610612744", name: "Warriors" };
const celtics       = { id: "1610612738", name: "Celtics" };
const heat          = { id: "1610612748", name: "Heat" };
const nuggets       = { id: "1610612743", name: "Nuggets" };
const timberwolves  = { id: "1610612750", name: "Timberwolves" };
const jazz          = { id: "1610612762", name: "Jazz" };
const thunder       = { id: "1610612760", name: "Thunder" };

// ~3 h 15 m from now so the countdown shows on the demo
const soonDatetime = new Date(Date.now() + (3 * 60 + 15) * 60 * 1000).toISOString();

const upcomingGame = {
	status_code: 1,
	status_text: "7:30 PM ET",
	datetime: soonDatetime,
	away_team: timberwolves,
	home_team: jazz,
	team_away_score: null,
	team_home_score: null,
};

const liveGame = {
	status_code: 2,
	status_text: "Q3 4:22",
	away_team: celtics,
	home_team: heat,
	team_away_score: 78,
	team_home_score: 82,
};

const finishedGame = {
	status_code: 3,
	status_text: "Final",
	away_team: nuggets,
	home_team: timberwolves,
	team_away_score: 112,
	team_home_score: 105,
};

const tiedGame = {
	status_code: 2,
	status_text: "Halftime",
	away_team: warriors,
	home_team: thunder,
	team_away_score: 54,
	team_home_score: 54,
};

const mockStandings: Record<string, TeamStanding> = {
	"1610612744": { record: "38-22", confRank: "W6" },  // Warriors
	"1610612738": { record: "47-12", confRank: "E1" },  // Celtics
	"1610612748": { record: "30-30", confRank: "E8" },  // Heat
	"1610612743": { record: "42-18", confRank: "W2" },  // Nuggets
	"1610612750": { record: "40-19", confRank: "W3" },  // Timberwolves
	"1610612762": { record: "22-38", confRank: "W13" }, // Jazz
	"1610612760": { record: "45-15", confRank: "W1" },  // Thunder
};

export default function DemoPage() {
	return (
		<div className="max-w-sm mx-auto px-4 py-12 flex flex-col gap-10">
			<div>
				<h1 className="text-xl font-semibold mb-1">Game Card Demo</h1>
				<p className="text-sm text-muted-foreground">
					All three status states at the same dimensions.
				</p>
			</div>

			<section className="flex flex-col gap-3">
				<Label>Status 1 — Upcoming</Label>
				<GameChip game={upcomingGame} standings={mockStandings} />
			</section>

			<section className="flex flex-col gap-3">
				<Label>Status 2 — Live</Label>
				<GameChip game={liveGame} standings={mockStandings} />
			</section>

			<section className="flex flex-col gap-3">
				<Label>Status 2 — Live (tied / halftime)</Label>
				<GameChip game={tiedGame} standings={mockStandings} />
			</section>

			<section className="flex flex-col gap-3">
				<Label>Status 3 — Finished</Label>
				<GameChip game={finishedGame} standings={mockStandings} />
			</section>

			<section className="flex flex-col gap-3">
				<Label>Loading skeleton</Label>
				<GameChip loading />
			</section>
		</div>
	);
}

function Label({ children }: { children: React.ReactNode }) {
	return (
		<p className="text-xs uppercase tracking-wider font-medium text-muted-foreground">
			{children}
		</p>
	);
}
