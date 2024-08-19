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
      // console.log("No data available");
      return null;
    }

    // Fetch the data
    const data = snapshot.val();

    // Get the data relevant for the current date in YYYY-MM-DD format and Berlin timezone
    const date = new Date();
    const berlinDate = new Date(
      date.toLocaleString("en-US", { timeZone: "Europe/Berlin" })
    );
    const year = berlinDate.getFullYear();
    const month = String(berlinDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(berlinDate.getDate()).padStart(2, "0");
    const today = `${year}-${month}-${day}`;

    const todayData = data[today];
    return todayData;
  } catch (error) {
    console.error("Error reading data:", error);
  }
}
