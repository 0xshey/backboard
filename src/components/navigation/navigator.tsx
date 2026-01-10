"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { Equal, X } from "lucide-react";
import { Logo } from "../logo";
import { Button } from "../ui/button";
import { NavLink } from "@/lib/navigation-links";

export type NavigatorProps = {
	links: NavLink[];
	className?: string;
};

export default function Navigator({ links = [], className }: NavigatorProps) {
	const pathname = usePathname();
	const [activeSection, setActiveSection] = useState<string>("");
	const [isOpen, setIsOpen] = useState(false);
	const [hoveredPath, setHoveredPath] = useState<string | null>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveSection(entry.target.id);
					}
				});
			},
			{
				threshold: 0.5,
			}
		);

		links.forEach((link) => {
			if (link.href.startsWith("#")) {
				const section = document.getElementById(link.href.slice(1));
				if (section) observer.observe(section);
			}
		});

		return () => observer.disconnect();
	}, [links]);

	return (
		<nav
			className={cn(
				"w-full pointer-events-none fixed top-0 isolate z-50 flex justify-center py-4 px-1 md:justify-between px-4",
				className
			)}
		>
			<motion.div
				layout
				initial={{ y: -100, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{
					layout: {
						type: "tween",
						ease: "easeInOut",
						duration: 0.3,
					},
				}}
				className="pointer-events-auto relative flex flex-col items-center gap-1 rounded-xl bg-muted/80 backdrop-blur border border-border/50 shadow-md h-fit w-full md:w-fit md:min-w-120 mx-auto overflow-hidden"
				onMouseLeave={() => setHoveredPath(null)}
			>
				<motion.div
					layout="position"
					className="flex items-center justify-between w-full pl-2 p-1"
				>
					<Link
						href="/"
						className="p-1 flex items-center gap-2 hover:text-brand transition-colors duration-200"
					>
						<Logo className="text-foreground" />
						<span className="text-xl font-semibold tracking-tighter">
							Backboard
						</span>
					</Link>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setIsOpen(!isOpen)}
						className="hover:bg-foreground/10 rounded-xl relative overflow-hidden"
					>
						<AnimatePresence mode="wait">
							{isOpen ? (
								<motion.div
									key="close"
									initial={{ rotate: -90, opacity: 0 }}
									animate={{ rotate: 0, opacity: 1 }}
									exit={{ rotate: 90, opacity: 0 }}
									transition={{ duration: 0.2 }}
									className="flex items-center justify-center"
								>
									<X className="h-6 w-6" />
								</motion.div>
							) : (
								<motion.div
									key="menu"
									initial={{ rotate: 90, opacity: 0 }}
									animate={{ rotate: 0, opacity: 1 }}
									exit={{ rotate: -90, opacity: 0 }}
									transition={{ duration: 0.2 }}
									className="flex items-center justify-center"
								>
									<Equal className="h-6 w-6" />
								</motion.div>
							)}
						</AnimatePresence>
					</Button>
				</motion.div>

				<AnimatePresence>
					{isOpen && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.3, ease: "easeInOut" }}
							className="w-full flex flex-col gap-2 pt-0"
						>
							<div className="flex flex-col gap-1 w-full mt-4 px-1">
								{links.map((link) => (
									<Link
										key={link.href}
										href={link.href}
										className="w-fit text-xl font-medium text-foreground hover:bg-foreground/10 rounded-xl px-2 py-1 transition-colors duration-200"
										onClick={() => setIsOpen(false)}
									>
										{link.label}
									</Link>
								))}
							</div>

							<div className="flex items-center justify-end p-1">
								<ThemeToggle />
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>

			{/* Backdrop overlay */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => setIsOpen(false)}
						className="fixed inset-0 z-[-1] bg-background/60 pointer-events-auto"
					/>
				)}
			</AnimatePresence>
		</nav>
	);
}
