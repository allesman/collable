import { ref, get } from "firebase/database";
import { db } from "$lib/firebase"; // adjust this path to where you initialize Firebase
const date = new Date();

export async function fetchData() {
  try {
    // Reference to the database, specifically the dailyGames node
    const dbRef = ref(db, "dailyGames");

    // Get the snapshot of the data
    const snapshot = await get(dbRef);

    if (!snapshot.exists()) {
      console.log("No data available");
      return null;
    }

    // Fetch the data
    const data = snapshot.val();

    // Get the data relevant for the current date
    const today = date.toISOString().split("T")[0];
    const todayData = data[today];
    return todayData;
  } catch (error) {
    console.error("Error reading data:", error);
  }
}
