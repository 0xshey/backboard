import { format } from "date-fns";
import { ExternalLink } from "lucide-react";

export default function Footer() {
	const today = new Date();
	return (
		<footer className="text-center mb-8 mt-20 flex flex-col gap-2 md:flex-row  relative items-center justify-between p-4">
			<div className="font-mono text-xs italic text-accent-foreground px-4 py-1 border rounded-full backdrop-blur-md bg-white/20">
				{format(today, "EEEE, do MMMM")}
			</div>
			<div className=" px-4 py-1 backdrop-blur-md flex items-center gap-2">
				<p className="underline underline-offset-4 font-mono text-xs italic text-accent-foreground cursor-pointer">
					0xshey.com
				</p>
			</div>
			<div className="font-mono text-xs italic text-accent-foreground px-4 py-1 border rounded-full backdrop-blur-md bg-white/20">
				&copy; {format(today, "yyyy")} Shey Laplanche
			</div>
		</footer>
	);
}
