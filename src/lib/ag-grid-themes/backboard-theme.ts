import { themeQuartz } from 'ag-grid-community';

// to use myTheme in an application, pass it to the theme grid option
export const backboardThemeMobile = themeQuartz
	.withParams({
        accentColor: "#FFFFFF",
        backgroundColor: "#000000",
        borderColor: "#FFFFFF1A",
        browserColorScheme: "dark",
        chromeBackgroundColor: {
            ref: "foregroundColor",
            mix: 0.07,
            onto: "backgroundColor"
        },
        foregroundColor: "#FFF",
        headerFontSize: 14,
        spacing: 8,
		cellHorizontalPaddingScale: 0.5,
		rowVerticalPaddingScale: 0.7,
		fontSize: 12,
    });

export const backboardThemeDesktop = themeQuartz
	.withParams({
        accentColor: "#FFFFFF",
        backgroundColor: "#000000",
        borderColor: "#FFFFFF1A",
        browserColorScheme: "dark",
        chromeBackgroundColor: {
            ref: "foregroundColor",
            mix: 0.07,
            onto: "backgroundColor"
        },
        foregroundColor: "#FFF",
        headerFontSize: 14,
        spacing: 8
    });
