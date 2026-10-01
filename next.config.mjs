/** @type {import('next').NextConfig} */
const nextConfig = {
	// Self-contained server bundle for the Docker image (see Dockerfile).
	output: "standalone",
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "cdn.nba.com",
				pathname: "/**",
			},
			{
				// ESPN headshots for players without an NBA.com id match (mostly rookies)
				protocol: "https",
				hostname: "a.espncdn.com",
				pathname: "/i/headshots/**",
			},
		],
	},
};

export default nextConfig;
