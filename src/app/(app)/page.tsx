import Image from "next/image";

export default function Page() {
	return (
		<main className="mt-[30vh] text-foreground flex items-center justify-center px-6 relative">
			<div className="absolute center-xy d-flex flex-column items-center text-center">
				{/* version */}
				<h2 className="z-10 text-[25rem] md:text-[40rem] font-semibold tracking-tighter whitespace-nowrap text-foreground/10">
					2.0
				</h2>
			</div>

			<div className="absolute center-xy d-flex flex-column items-center text-center">
				{/* Title */}
				<h1 className="z-20 text-6xl md:text-9xl font-semibold tracking-tighter whitespace-nowrap">
					BACKBOARD
				</h1>
			</div>
		</main>
	);
}
