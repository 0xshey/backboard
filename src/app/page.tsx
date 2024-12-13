import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
	return (
		<div className="w-full min-h-[70vh] flex flex-col gap-8 items-center justify-center border rounded-xl">
			<h1 className="text-6xl tracking-tight max-w-1/4">
				YF Tools Fantasy Dashboard
			</h1>

			<Button asChild>
				<Link href="/overview">Overview</Link>
			</Button>
		</div>
	);
}
