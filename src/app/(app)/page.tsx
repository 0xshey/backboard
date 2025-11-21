// app/page.tsx

export default function Page() {
	return (
		<main className="mt-[30vh] text-foreground flex items-center justify-center px-6">
			<div className="max-w-2xl w-full text-center">
				{/* Title */}
				<h1 className="text-xl md:text-8xl font-bold tracking-tight">
					Backboard 2.0
				</h1>

				{/* Subtitle (optional) */}
				<p className="mt-4 text-lg">
					The dashboard that fantasy managers wish they had last
					season
				</p>
			</div>
		</main>
	);
}
