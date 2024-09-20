import readline from 'readline';
import chalk from 'chalk';
import { loadTrades, saveTrades, addTrade, getLoggedTrades } from './readWrite.js';

const calculateProfit = (cost, sold) => sold - cost;
const calculateTotalPnL = () => getLoggedTrades().reduce((total, trade) => total + trade.profit, 0);

const validateTrade = (ticker, ...numbers) => {
  if (typeof ticker !== 'string' || ticker.trim() === '') {
    console.log(chalk.red('Ticker must be a non-empty string.'));
    return false;
  }
  const parsedNumbers = numbers.map(parseFloat);
  if (parsedNumbers.some(isNaN)) {
    console.log(chalk.red('Market caps, cost, and sold values must be valid numbers.'));
    return false;
  }
  return true;
};


const logTrade = async (ticker, entryMarketcap, exitMarketcap, cost, sold) => {
  addTrade({ ticker, entryMarketcap, exitMarketcap, cost, sold, profit: calculateProfit(cost, sold) });
  await saveTrades();
  console.log(chalk.green.bold('trade logged! ~\n'));
};

const displayTrades = () => {
  console.log(chalk.yellow('\n~ logged trades ~'));
  getLoggedTrades().forEach(({ ticker, entryMarketcap, exitMarketcap, cost, sold, profit }, index) => {
    console.log(chalk.green(`\ntrade ${index + 1}`));
    console.log(chalk.magenta(`ticker: $${ticker}`),
                chalk.green(`\nentry mktcap: ${entryMarketcap}`),
                chalk.red(`\nexit mktcap: ${exitMarketcap}`),
                chalk.green(`\ncost: ${cost}`),
                chalk.red(`\nsold: ${sold}`),
                chalk.blue(`\nprofit: $${profit}`));
  });
  console.log(chalk.yellow.italic.underline(`\ntotal PnL: $${calculateTotalPnL().toFixed(2)}\n`));
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function promptTrade() {
  rl.question(chalk.blue('[d]') + chalk.green(' to ') + chalk.blue('show trades') + chalk.green(' or ') + chalk.red('[q]') + chalk.green(' to ') + chalk.red('exit') + chalk.green('\nlog [ticker entry exit cost sold]:\n'), async (input) => {
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

    const [ticker, entryMarketcap, exitMarketcap, cost, sold] = input.trim().split(/\s+/);

    if (!validateTrade(ticker, entryMarketcap, exitMarketcap, cost, sold)) {
      promptTrade();
      return;
    }

    await logTrade(ticker, parseFloat(entryMarketcap), parseFloat(exitMarketcap), parseFloat(cost), parseFloat(sold));
    promptTrade();
  });
}

const main = async () => {
  console.log(chalk.magenta('<trading journal>'));
  await loadTrades();
  promptTrade();
};

main();
