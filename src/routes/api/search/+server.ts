import { searchGenius } from "$lib/geniusApi";

export async function GET({ url }) {
  const query = url.searchParams.get("query") || "Kendrick Lamar";
  try {
    const data = await searchGenius(query);
    return new Response(JSON.stringify(data.response.hits), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
