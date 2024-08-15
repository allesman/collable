import { fetchData } from "$lib/readDB"; // adjust path accordingly

export async function load() {
  let data = await fetchData();
  return { dbData: data };
}
