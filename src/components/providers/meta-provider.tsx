import Head from "next/head";

type MetaProviderProps = {
	title?: string;
	description?: string;
};

export default function MetaProvider({
	title = "NBA Dash",
	description = "Dashboard for NBA stats",
}: MetaProviderProps) {
	return (
		<>
			<Head>
				<title>0xshey</title>

				<meta name="title" key="title" content={title} />
				<meta
					name="description"
					key="description"
					content={description}
				/>
			</Head>
		</>
	);
}
