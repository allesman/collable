import { searchGenius } from "$lib/geniusApi";

export async function load() {
  try {
    const data = await searchGenius("Kendrick Lamar");

    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
