import { Literata, Playfair_Display, Spline_Sans_Mono, Caveat, Roboto_Condensed  } from 'next/font/google';
import localFont from 'next/font/local'; // For Geist - not on next/font/google yet

export const fontSans = localFont({
	src: '/local-fonts/Geist-VariableFont_wght.ttf',
	variable: '--font-sans'
})

export const fontSerif = Literata({
	weight: ['400', '500', '600', '700'],
	subsets: ['latin'],
	variable: '--font-serif'
})

export const fontMono = Spline_Sans_Mono({
	subsets: ['latin'],
	variable: '--font-mono'
})

export const fontHeadline = Playfair_Display({
	subsets: ['latin'],
	variable: '--font-headline'
})

export const fontHandwritten = Caveat({
	subsets: ['latin'],
	variable: '--font-handwritten'
})

export const fontCondensed = Roboto_Condensed({
	subsets: ['latin'],
	variable: '--font-condensed'
})