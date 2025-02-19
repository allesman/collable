import { ref, get, set } from "firebase/database";
import { db } from "./firebase.ts";
import type { DailyGame, StoredData } from "./types.ts";
import { DateTime } from "luxon";
import { error } from "@sveltejs/kit";
export async function fetchData(): Promise<StoredData> {
  try {
    let returnedData: StoredData;
    const data = await getAllData();
    const dates = Object.keys(data)

    // Get the data relevant for the current date in YYYY-MM-DD format and Berlin timezone
    const today = DateTime.now().toFormat("yyyy-MM-dd");

    // Get data for the current date, or otherwise the newest date existing
    let latestDate = today;
    let latestData = data[today];
    if (latestData) {
      // today has data
      // get Data for previous and next day just in case (timezones)
      const dateBefore = DateTime.fromISO(latestDate).minus({ days: 1 }).toFormat("yyyy-MM-dd");
      // const dateBefore = dateStringPlus(latestDate, -1);
      const dateAfter = DateTime.fromISO(latestDate).plus({ days: 1 }).toFormat("yyyy-MM-dd");
      returnedData = {
        [dateBefore]: data[dateBefore],
        [latestDate]: latestData,
      }
      if (data[dateAfter]) {
        returnedData[dateAfter] = data[dateAfter];
      }
      // const dateAfter = dateStringPlus(latestDate, +1)
    }
    else {
      // today has no data, get the latest data available
      var lowerKeys = dates.filter(function (dateStr) {
        return DateTime.fromISO(dateStr) < DateTime.now();
      })
      latestDate = lowerKeys.pop() || "";
      if (!latestDate) {
        return error(500, { message: "No data available for any past date" });
      }
      console.log("Getting data for " + latestDate);
      latestData = data[latestDate];
      returnedData = {
        [latestDate]: latestData,
      }
    }

    // add date stamps to the data
    Object.keys(returnedData).forEach(date => {
      returnedData[date]["date"] = date;
    });

    return returnedData;

  } catch (error) {
    console.error("Error reading data:", error);
    return {};
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
