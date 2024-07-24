import { ContractDetails } from "@/UI/lib/zustand/slices/types";

export const getStrikes = (callContracts: ContractDetails, barrier: string, upOrDown: "UP" | "DOWN") => {
  if (callContracts) {
    const strikeInitialData = Object.keys(callContracts);
    strikeInitialData.pop();
    strikeInitialData.shift();
    return strikeInitialData.reduce<string[]>((strikeArr, currStrike) => {
      const isValidStrike = barrier
        ? upOrDown === "UP"
          ? parseFloat(currStrike) <= parseFloat(barrier)
          : parseFloat(currStrike) >= parseFloat(barrier)
        : true;
      if (isValidStrike) strikeArr.push(currStrike);
      return strikeArr;
    }, []);
  }
  return [];
};

export const getBarrierStrikes = (callContracts: ContractDetails, strike: string, upOrDown: "UP" | "DOWN") => {
  if (callContracts) {
    return Object.keys(callContracts).reduce<string[]>((strikeArr, currStrike) => {
      const isValidStrike = strike
        ? upOrDown === "UP"
          ? parseFloat(currStrike) > parseFloat(strike)
          : parseFloat(currStrike) < parseFloat(strike)
        : true;
      if (isValidStrike) strikeArr.push(currStrike);
      return strikeArr;
    }, []);
  }
  return [];
};
