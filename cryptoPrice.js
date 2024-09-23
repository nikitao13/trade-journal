export default async function getCryptoPrice() {
  const currency = process.env.CURRENCY.toLowerCase();
  const crypto = process.env.CRYPTO.toLowerCase();
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=${currency}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`[${crypto} ${currency}]`);
    return data[crypto][currency];
  } catch (error) {
    console.error(`Error fetching ${crypto} price:`, error);
    return null;
  }
}
