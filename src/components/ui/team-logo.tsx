import Image from "next/image";
import { teamLogoURL } from "@/lib/image-urls";
import { cn } from "@/lib/utils";

interface TeamLogoProps {
	teamId: string;
	size?: number;
	className?: string;
}

export function TeamLogo({ teamId, size = 20, className }: TeamLogoProps) {
	return (
		<Image
			src={teamLogoURL(teamId)}
			alt=""
			width={size}
			height={size}
			unoptimized
			className={cn("shrink-0", className)}
		/>
	);
}
