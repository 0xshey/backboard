'use server'

export async function fetchOverview({date}: {date: string}) {
	const res = await fetch(`http://192.168.0.51:5000/api/overview/${date}`, {
		headers: {
			// cache for 10 seconds
			"Cache-Control": "no-cache",
		},
		next: {
			revalidate: 15,
		}
	});	
	
	const data = await res.json();
	return data;
}