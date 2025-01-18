import Image from "next/image";

interface PlayerSiloProps {
	playerId: string;
	alt?: string;
	size?: number;
	className?: string;
}

export default function PlayerSilo({
	playerId,
	alt = "",
	size = 200,
	className = "",
}: PlayerSiloProps) {
	return (
		<Image
			src={`https://cdn.nba.com/silos/nba/latest/440x700/${playerId}.png`}
			alt={alt || "Player Silo"}
			width={size}
			height={size * 1.75}
			className={className}
		/>
	);
}
