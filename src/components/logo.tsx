// IconProps
export interface IconProps {
	color?: string;
	size?: number;
	className?: string;
}

export default function Logo({
	color = "black",
	size = 64,
	className = "",
}: IconProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 256 256"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M197 80H42V170H165C165 187.673 179.327 202 197 202C214.673 202 229 187.673 229 170C229 152.327 214.673 138 197 138V80ZM197 138C179.327 138 165 152.327 165 170H197V138Z"
				fill={color}
			/>
		</svg>
	);
}
