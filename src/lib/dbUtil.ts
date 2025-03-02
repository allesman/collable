import { ref, get, set } from "firebase/database";
import { db } from "./firebase.ts";
import type { AllData, DailyGame } from "./types.ts";
// import type { DailyGame, StoredData } from "./types.ts";
import { DateTime } from "luxon";
import { error } from "@sveltejs/kit";
export async function fetchData(date: string): Promise<DailyGame> {
  try {
    const data = await getAllData();
    const dates = Object.keys(data)

    // Get data for the current date, or otherwise the newest date existing
    let latestDate = date;
    let latestData = data[date];
    if (!latestData) {
      // today has no data, get the latest data available
      const lowerKeys = dates.filter(function (dateStr) {
        return DateTime.fromISO(dateStr) < DateTime.now();
      })
      latestDate = lowerKeys.pop() || "";
      if (!latestDate) {
        return error(500, { message: "No data available for any past date" });
      }
      latestData = data[latestDate];
    }

    latestData["date"] = DateTime.fromISO(latestDate).toFormat("MM-dd-yyyy");

    return latestData;

  } catch (error) {
    console.error("Error reading data:", error);
    throw error instanceof Error ? error : new Error("Error reading data");
  }
}

export async function pushToDB(dailyGameEntry: DailyGame, dateStr?: string) {
  try {
    // Reference to the database, specifically the dailyGames node and the correspending date node
    const dbRef = ref(db, "dailyGames/" + (dateStr || DateTime.now().setZone('Pacific/Kiritimati').toFormat("yyyy-MM-dd")));
    await set(dbRef, dailyGameEntry);
  }
  catch (error) {
    console.error("Error pushing data:", error);
  }
  return {
    date: dateStr || DateTime.now().setZone('Pacific/Kiritimati').toFormat("yyyy-MM-dd"),
    ...dailyGameEntry,
  }
}

export async function getAllData(): Promise<AllData> {
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
