import { useEffect, useState } from "react";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { useAppStore } from "@/UI/lib/zustand/store";

export interface Strike {
  [key: string]: {
    [product: string]: number;
  };
}

export type TradeDetail = {
  date: string;
  volume: number;
  [key: string]: number | string;
};

export type TradeVolumes = {
  [date: string]: {
    [expiryDate: string]: number;
  };
};

const DATE_FORMAT_OUTPUT = "yyyy-MM-dd";
const EXPIRY_FORMAT_OUTPUT = "dMMMyy";

const transformTrades = (results: TradeVolumes | undefined) => {
  if (!results) return [];
  const formattedData: TradeDetail[] = Object.keys(results).map(singleDay => {
    const dayFormatted = format(new Date(singleDay), EXPIRY_FORMAT_OUTPUT);
    let volume = 0;
    const data: TradeDetail = { date: dayFormatted, volume: 0 };

    Object.keys(results[singleDay]).forEach(singleExpiry => {
      const formattedKey = format(new Date(singleExpiry), EXPIRY_FORMAT_OUTPUT);

      data[formattedKey] = results[singleDay][singleExpiry];
      volume += results[singleDay][singleExpiry];
    });

    data.volume = volume;
    return data as TradeDetail;
  });

  return formattedData;
};

export const useData = () => {
  const { ithacaSDK } = useAppStore();
  const [tradeCount, setTradeCount] = useState<TradeDetail[]>([]);
  const [tradeVolume, setTradeVolume] = useState<TradeDetail[]>([]);

  const START_DATE = format(startOfMonth(new Date()), DATE_FORMAT_OUTPUT);
  const END_DATE = format(endOfMonth(new Date()), DATE_FORMAT_OUTPUT);

  useEffect(() => {
    fetchAllTrades();
    fetchDailyVolume();
  }, []);

  const fetchAllTrades = async () => {
    const results: TradeVolumes = await ithacaSDK.analytics.tradesDetail("WETH", "USDC", START_DATE, END_DATE);

    setTradeCount(transformTrades(results));
  };

  const fetchDailyVolume = async () => {
    const results = await ithacaSDK.analytics.dailyVolumeDetail("WETH", "USDC", START_DATE, END_DATE);
    setTradeVolume(transformTrades(results));
  };

  return {
    tradeCount,
    tradeVolume,
  };
};

export default useData;
