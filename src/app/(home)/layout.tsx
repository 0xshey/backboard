import { ReactNode } from "react";
import BackgroundProvider from "@/components/providers/background-provider";

export default function HomeLayout({ children }: { children: ReactNode }) {
	return (
		<>
			<BackgroundProvider />
			{children}
		</>
	);
}
