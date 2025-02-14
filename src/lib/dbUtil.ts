import { ref, get, set } from "firebase/database";
import { db } from "./firebase.ts";
import type { DailyGame, StoredData } from "./types.ts";
export async function fetchData() {
  try {
    const data = await getAllData();

    // Get the data relevant for the current date in YYYY-MM-DD format and Berlin timezone
    const today = getCurrentDateString();

    // Get data for the current date, or otherwise the newest date existing
    // FIXME: yes in theory this is based on the assumption that there is no gap in the data (in that case, it would incorrectly show the newest data)
    let latestDate = today;
    let latestData = data[today];
    if (!latestData) {
      latestDate = Object.keys(data)[Object.keys(data).length - 1];;
      latestData = data[latestDate];
    }
    // add date stamp to the data
    latestData["date"] = latestDate;
    return latestData;

  } catch (error) {
    console.error("Error reading data:", error);
  }
}

export async function pushToDB(dailyGameEntry: DailyGame, dateStr: string | null = null) {
  try {
    // Reference to the database, specifically the dailyGames node
    const dbRef = ref(db, "dailyGames/" + (dateStr || getCurrentDateString()));
    await set(dbRef, dailyGameEntry);
  }
  catch (error) {
    console.error("Error pushing data:", error);
  }
}

export async function getAllData(): Promise<StoredData> {
  // Reference to the database, specifically the dailyGames node
  const dbRef = ref(db, "dailyGames");

  // Get the snapshot of the data
  const snapshot = await get(dbRef);

  if (!snapshot.exists()) {
    // console.log("No data available");
    return {};
  }

  // Fetch the data
  const data = snapshot.val();
  return data;
}

export function getCurrentDateString(): string {
  // FIXME: move this to client side so it uses the client's timezone
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date.getDate()).padStart(2, "0");
  const today = `${year}-${month}-${day}`;
  return today;
}