import { getAccessToken } from "./auth";
// TODO: class pattern
// TODO: singleton pattern?
export async function searchGenius(query: string) {
  const accessToken = await getAccessToken();
  const response = await fetch(
    `https://api.genius.com/search?q=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error fetching data: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function getArtistInfo(query: string) {
  const accessToken = await getAccessToken();
  const response = await fetch(
    `https://api.genius.com/artists/${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error fetching data: ${response.statusText}`);
  }

  const data = await response.json();
  // console.log(data.response.artist.name);
  return data;
}
