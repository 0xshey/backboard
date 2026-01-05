import { cn } from "@/lib/utils";

interface LogoProps {
	fill?: string;
	size?: number;
	className?: string;
}

export function Logo({
	fill = "currentColor",
	size = 32,
	className,
}: LogoProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 706 420"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<path
				d="M46.7771 41.2118C50.1553 17.5647 70.4075 0 94.2947 0H611.034C634.922 0 655.174 17.5646 658.552 41.2118L704.838 365.212C708.969 394.129 686.53 420 657.32 420H48.009C18.7987 420 -3.63953 394.129 0.49144 365.212L46.7771 41.2118Z"
				fill={fill}
			/>
		</svg>
	);
}
