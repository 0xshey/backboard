"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type RankingsFilterProps = {
	/** Search param this filter writes, e.g. "view" or "scoring". */
	param: string;
	options: { value: string; label: string }[];
	/** Value used when the param is absent; selecting it removes the param. */
	defaultValue: string;
};

/** Single-select toggle that keeps its state in the URL so views are linkable. */
export function RankingsFilter({ param, options, defaultValue }: RankingsFilterProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const value = searchParams.get(param) ?? defaultValue;

	function onValueChange(next: string) {
		if (!next) return;
		const params = new URLSearchParams(searchParams);
		if (next === defaultValue) params.delete(param);
		else params.set(param, next);
		const qs = params.toString();
		router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
	}

	return (
		<ToggleGroup type="single" variant="outline" size="sm" value={value} onValueChange={onValueChange}>
			{options.map((o) => (
				<ToggleGroupItem key={o.value} value={o.value} className="px-3">
					{o.label}
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
}
