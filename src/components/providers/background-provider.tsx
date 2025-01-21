import Image from "next/image";

export default function BackgroundProvider({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<div className="relative">
			<Image
				src="logo-gradient.svg"
				alt="Backboard Gradient Background"
				layout="fill"
				objectFit="contain"
				objectPosition="center"
				className=" opacity-40 -z-10"
			/>

			<div>{children}</div>
		</div>
	);
}
