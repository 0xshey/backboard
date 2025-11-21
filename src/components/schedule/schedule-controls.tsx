// app/schedule/ScheduleControls.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { PlusIcon, MinusIcon } from "lucide-react";

export function ScheduleControls() {
	const router = useRouter();
	const searchParams = useSearchParams();

	// Parse initial values from the URL, with safe defaults
	const initialProvider = searchParams.get("provider") ?? "yahoo";
	const initialWeek = (() => {
		const w = Number(searchParams.get("week"));
		return Number.isFinite(w) && w > 0 ? w : 1;
	})();

	const [provider, setProvider] = useState(initialProvider);
	const [week, setWeek] = useState(initialWeek);

	// Keep local state in sync if user navigates (e.g., back/forward) and params change
	useEffect(() => {
		const spProvider = searchParams.get("provider") ?? "yahoo";
		const spWeekVal = Number(searchParams.get("week"));
		const spWeek =
			Number.isFinite(spWeekVal) && spWeekVal > 0 ? spWeekVal : 1;

		setProvider(spProvider);
		setWeek(spWeek);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);

	// When provider/week change, update URL params on the same route.
	useEffect(() => {
		const params = new URLSearchParams(Array.from(searchParams.entries()));
		params.set("provider", provider);
		params.set("week", String(week));
		// replace keeps history cleaner; push if you want back-button to step through changes
		router.replace(`/schedule?${params.toString()}`);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [provider, week]);

	const decrementWeek = () => {
		setWeek((w) => Math.max(1, w - 1)); // guard lower bound
	};

	const incrementWeek = () => {
		setWeek((w) => w + 1);
	};

	return (
		<div className="w-full max-w-md mb-10 flex flex-col gap-4">
			{/* No need to submit a form; URL updates are handled in the effect */}
			<div className="flex gap-8">
				<Select
					value={provider}
					onValueChange={setProvider}
					// remove disabled if you want to allow changing provider
					disabled
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Provider" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="yahoo">Yahoo</SelectItem>
						<SelectItem value="espn">ESPN</SelectItem>
						<SelectItem value="sleeper">Sleeper</SelectItem>
					</SelectContent>
				</Select>

				<div className="flex gap-2 items-center">
					<Button
						variant="outline"
						size="icon"
						onClick={decrementWeek}
						aria-label="Previous week"
					>
						<MinusIcon />
					</Button>
					<div className="flex justify-center whitespace-nowrap px-2">
						Week {week}
					</div>
					<Button
						variant="outline"
						size="icon"
						onClick={incrementWeek}
						aria-label="Next week"
					>
						<PlusIcon />
					</Button>
				</div>
			</div>
		</div>
	);
}
