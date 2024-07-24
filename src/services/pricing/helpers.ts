export const VANILLA_SPREAD = 5.25;
export const BINARY_SPREAD = 0.05; //Digitals
export const FORWARD_SPREAD = 1.05;
const MINIMUM_PRICE = 0.01;

export const calculateBidAsk = (
  midPrice: number,
  optionType: string,
  side: "BUY" | "SELL",
  forcedSpread?: number
): number => {
  let totalSpread = VANILLA_SPREAD;

  if (optionType === "BinaryPut" || optionType === "BinaryCall") {
    totalSpread = BINARY_SPREAD;
  }
  if (optionType === "Forward") {
    totalSpread = FORWARD_SPREAD;
  }

  // Overwrite
  if (forcedSpread) {
    totalSpread = forcedSpread;
  }

  const halfSpread = totalSpread / 2;

  // Bid (user selling)
  if (side === "SELL") {
    const price = midPrice - halfSpread;
    return price > 0 ? price : MINIMUM_PRICE;
  } else {
    // Ask (user buying)
    const price = midPrice + halfSpread;
    return price > 0 ? price : MINIMUM_PRICE;
  }
};
