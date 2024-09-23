import readline from 'readline';
import chalk from 'chalk';
import { loadTrades, saveTrades, addTrade, getLoggedTrades } from './readWrite.js';
import getCryptoPrice from './cryptoPrice.js';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  currency: process.env.CURRENCY,
  crypto: process.env.CRYPTO.slice(0,3)
}

console.log(chalk.green(`[input: ${config.crypto} output: ${config.currency}]`));

async function calculateProfit(cost, sold) {
  const cryptoPrice = await getCryptoPrice();
  if (!cryptoPrice) {
    console.log('could not calculate profit. try again later.');
    return null;
  }
  return (sold - cost) * cryptoPrice;
}

const calculateTotalPnL = (trades) => {
  return trades.reduce((total, trade) => total + trade.profit, 0);
};

const validateTrade = (ticker, cost, sold) => {
  if (typeof ticker !== 'string' || ticker.trim() === '') {
    console.log(chalk.red('ticker must be a non-empty string.'));
    return false;
  }
  if (isNaN(cost) || isNaN(sold)) {
    console.log(chalk.red('cost and sold values must be valid numbers.'));
    return false;
  }
  return true;
};

const logTrade = async (ticker, cost, sold) => {
  const profit = await calculateProfit(cost, sold);
  if (profit === null) {
    console.log(chalk.red('failed to log trade due to profit calculation error.'));
    return;
  }
  addTrade({ ticker, cost, sold, profit });
  await saveTrades();
  console.log(chalk.green.bold('trade logged! ~\n'));
};

const displayTrades = () => {
  const trades = getLoggedTrades(); 
  console.log(chalk.yellow('\n~ logged Trades ~'));

  trades.forEach(({ ticker, cost, sold, profit }, index) => {
    console.log(chalk.green.underline(`\ntrade ${index + 1}`));
    console.log(chalk.magenta(`ticker: $${ticker}`),
                chalk.red(`\ncost: ${cost} ${config.crypto}`),
                chalk.green(`\nsold: ${sold} ${config.crypto}`),
                chalk.magenta(`\n${config.crypto.slice(0, 3)} profit: `) + (profit >= 0 ? chalk.green : chalk.red)(`${(sold - cost).toFixed(2)} ${config.crypto}`),
                chalk.green(`\n${config.currency} profit: `) + (profit >= 0 ? chalk.green : chalk.red)(`$${profit.toFixed(0)}`));
  });

  const totalPnL = calculateTotalPnL(trades); 
  console.log(chalk.yellow.italic.underline(`\ntotal PnL: $${totalPnL.toFixed(0)} ${config.currency}\n`));
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function promptTrade() {
  rl.question(chalk.blue('[d]') + chalk.green(' to ') + chalk.blue('show trades') + chalk.green(' or ') + chalk.red('[q]') + chalk.green(' to ') + chalk.red('exit') + chalk.green('\nlog [ticker cost sold]:\n'), async (input) => {
    if (input.toLowerCase() === 'q') {
      rl.close();
      console.log(chalk.red.italic('goodbye!'));
      return;
    }

    if (input.toLowerCase() === 'd') {
      displayTrades();
      promptTrade();
      return;
    }

    const [ticker, cost, sold] = input.trim().split(/\s+/);

    if (!validateTrade(ticker, cost, sold)) {
      promptTrade();
      return;
    }

    await logTrade(ticker, parseFloat(cost), parseFloat(sold));
    promptTrade();
  });
}

const main = async () => {
  console.log(chalk.magenta('<trading journal>'));
  await loadTrades();
  promptTrade();
};

main();