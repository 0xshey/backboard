"use client";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

export default function DatePicker({
	date,
	setDate,
	className,
}: {
	date: Date;
	setDate: (date: Date) => void;
	className?: string;
}) {
	const isNow = date.toDateString() === new Date().toDateString();

	return (
		<div className={`flex items-center gap-8 p-2 ${className}`}>
			{/* Prev. Date Button */}
			<Button
				variant="outline"
				size="icon"
				onClick={() =>
					setDate(new Date(date.setDate(date.getDate() - 1)))
				}
				className="px-4"
			>
				<ChevronLeft />
			</Button>

			{/* Date */}
			<div className="w-full flex flex-col items-center my-8 relative">
				{isNow && (
					<div className="absolute left-0 right-0 m-auto bg-green-500/60 rounded-full w-18 h-12 blur-xl animate-pulse -z-10" />
				)}

				<div className="flex flex-col items-center gap-1">
					<h2 className="text-lg text-center font-medium">
						{format(
							date.toLocaleString(),
							isNow ? "h:mm a" : "MMM. do"
						)}
					</h2>
					<h2 className="text-xs font-medium text-center">
						{format(
							date.toLocaleString(),
							isNow ? "EE — MMM d" : "EEEE"
						)}
					</h2>
				</div>
			</div>

			{/* Next Date Button */}
			<Button
				variant="outline"
				size="icon"
				onClick={() =>
					setDate(new Date(date.setDate(date.getDate() + 1)))
				}
				className="px-4"
			>
				<ChevronRight />
			</Button>
		</div>
	);
}
