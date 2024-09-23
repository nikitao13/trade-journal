import fs from "fs/promises";
import chalk from "chalk";
import dotenv from "dotenv";

dotenv.config();

const DATA_FILE = `./tradeHistory/${process.env.CRYPTO.slice(0, 3) + process.env.CURRENCY}.json`;
let loggedTrades = [];

export async function loadTrades() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf8");
    loggedTrades = JSON.parse(data);
    console.log(chalk.green("trades loaded ~"));
    return loggedTrades;
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log("no trade data. starting fresh.");
      return [];
    } else {
      console.error("error loading trades:", error);
      throw error;
    }
  }
}

export async function saveTrades() {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(loggedTrades, null, 2));
  } catch (error) {
    console.error("error saving trades:", error);
  }
}

export function getLoggedTrades() {
  return loggedTrades;
}

export function addTrade(trade) {
  loggedTrades.push(trade);
}
