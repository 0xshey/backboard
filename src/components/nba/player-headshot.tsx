import Image from "next/image";

interface PlayerHeadshotProps {
	playerId: string;
	alt?: string;
	size?: number;
	className?: string;
}

export default function PlayerHeadshot({
	playerId,
	alt = "",
	size = 48,
	className = "",
}: PlayerHeadshotProps) {
	let resolution = "1040x760";
	if (size < 100) {
		resolution = "260x190";
	}
	return (
		<Image
			src={`https://cdn.nba.com/headshots/nba/latest/${resolution}/${playerId}.png`}
			alt={alt || "Team Logo"}
			width={size}
			height={size}
			className={className}
		/>
	);
}
