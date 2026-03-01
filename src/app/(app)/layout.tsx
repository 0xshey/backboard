import { ReactNode } from "react";
import Footer from "@/components/footer";

export default function AppLayout({ children }: { children: ReactNode }) {
	return (
		<>
			{children}
			{/* <Footer /> */}
		</>
	);
}
