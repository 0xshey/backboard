export default function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="w-full mt-20">
			<div className="w-full overflow-hidden">
				{/* Giant BACKBOARD text */}
				<div className="select-none" aria-hidden="true">
					<h2 className="text-[20vw] font-stretch-75% font-black tracking-tighter leading-none text-foreground/4 text-center whitespace-nowrap">
						BACKBOARD
					</h2>
				</div>

				{/* Bottom row */}
				<div className="flex flex-col md:flex-row items-center justify-between gap-2 mt-4 text-xs text-muted-foreground p-4">
					<span>&copy; {year} Shey Laplanche</span>
					<a
						href="https://0xshey.com"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-foreground transition-colors"
					>
						0xshey.com
					</a>
				</div>
			</div>
		</footer>
	);
}
