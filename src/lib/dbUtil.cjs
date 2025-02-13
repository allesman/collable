const { ref, get, set } = require("firebase/database");
const { db } = require("./firebase.cjs");

module.exports = { pushToDB, fetchData, getAllData, getLatestDate };

async function fetchData() {
  try {
    data = getAllData();

    // Get the data relevant for the current date in YYYY-MM-DD format and Berlin timezone
    const today = getCurrentDateString();

    // Get data for the current date, or otherwise the newest date existing
    // FIXME: yes in theory this is based on the assumption that there is no gap in the data (in that case, it would incorrectly show the newest data)
    let latestDate = today;
    let latestData = data[today];
    if (!latestData) {
      latestDate = getLatestDate(data);
      latestData = data[latestDate];
    }
    // add date stamp to the data
    latestData["date"] = latestDate;
    return latestData;

  } catch (error) {
    console.error("Error reading data:", error);
  }
}

async function pushToDB(dailyGameEntry, dateStr = null) {
  try {
    // Reference to the database, specifically the dailyGames node
    const dbRef = ref(db, "dailyGames/" + (dateStr || getCurrentDateString()));
    await set(dbRef, dailyGameEntry);
  }
  catch (error) {
    console.error("Error pushing data:", error);
  }
}

function getLatestDate(data) {
  return Object.keys(data)[Object.keys(data).length - 1];
}

async function getAllData() {
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
  return data;
}

function getCurrentDateString() {
  const date = new Date();
  const berlinDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Europe/Berlin" })
  );
  const year = berlinDate.getFullYear();
  const month = String(berlinDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(berlinDate.getDate()).padStart(2, "0");
  const today = `${year}-${month}-${day}`;
  return today;
}