import Image from "next/image";

interface TeamLogoProps {
	teamId: string;
	alt?: string;
	size?: number;
	global?: boolean;
	className?: string;
}

export default function TeamLogo({
	teamId,
	alt = "",
	size = 48,
	className = "",
	global = false,
}: TeamLogoProps) {
	return (
		<Image
			src={`https://cdn.nba.com/logos/nba/${teamId}/${
				global ? "global" : "primary"
			}/L/logo.svg`}
			alt={alt || "Team Logo"}
			width={size}
			height={size}
			className={className}
		/>
	);
}
