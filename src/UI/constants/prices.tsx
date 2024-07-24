import { Contract, ReferencePrice } from "@ithaca-finance/sdk";
import { ReactNode } from "react";

export type TableProps = {
  type: "puts" | "calls";
  data: OptionsData[];
  strikes: number[];
  currencyIcon: ReactNode;
};

export type OptionsData = Contract &
  ReferencePrice & {
    bestAsk: number | null;
    bestAskType: string | null;
    bestBid: number | null;
    bestBidType: string | null;
    askVolume: number | null;
    bidVolume: number | null;
  };

export type OptionsTableProps = {
  data: OptionsData[];
  currencyIcon: ReactNode;
};

export type ForwardTableData = {
  index: number;
  data: OptionsData;
};

export type OptionsBidAskData = {
  bestAsk: number;
  bestBid: number;
  referencePrice: number;
  askVolume: number | null;
  bidVolume: number | null;
};
