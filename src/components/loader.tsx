import { Skeleton } from "@/components/ui/skeleton";
import { LoaderIcon } from "lucide-react";

export default function Loader({ className = "" }: { className?: string }) {
	return (
		<Skeleton
			className={`flex justify-center items-center h-full p-2 text-muted-foreground animate-pulse ${className}`}
		>
			<LoaderIcon size="2em" className="animate-spin" />
		</Skeleton>
	);
}
