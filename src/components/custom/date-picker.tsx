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
	const serverTZ = "America/New_York";
	const isNow = date.toDateString() === new Date().toDateString();

	return (
		<div className={`flex items-center gap-8 ${className}`}>
			{/* Prev. Date Button */}
			<Button
				variant="secondary"
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
					<div className="absolute left-0 right-0 m-auto bg-green-500/60 w-32 h-20 blur-xl animate-pulse -z-10" />
				)}

				<div className="flex flex-col items-center gap-1">
					<h2 className="text-4xl text-center font-medium">
						{format(
							date.toLocaleString("en-US", {
								timeZone: serverTZ,
							}),
							isNow ? "h:mm a" : "MMM. do"
						)}
					</h2>
					<h2 className="text-sm md:text-lg font-medium">
						{format(
							date.toLocaleString("en-US", {
								timeZone: serverTZ,
							}),
							isNow ? "EEEE, MMMM do" : "EEEE"
						)}
					</h2>
				</div>
				<p className="text-xs text-gray-500">in New York</p>
			</div>

			{/* Next Date Button */}
			<Button
				variant="ghost"
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
