import { transformTradingPrice } from "@/UI/utils/Numbers";
import { ApiService } from "../api.service";
import dayjs from "dayjs";
import { fetchSingleConfigKey } from "../environment.service";
import { DEFAULT_INPUT_DATE_FORMAT, formatDate } from "@/UI/utils/DateFormatting";
import { AxiosError } from "axios";
import { calculateBidAsk } from "./helpers";

interface FetchPrice {
  optionType: string;
  date: string;
  strike: string | undefined;
}

export interface FetchPriceHelper extends Omit<FetchPrice, "date"> {
  isForward: boolean;
  expiryDate: number;
  side?: "BUY" | "SELL";
  forcedSpread?: number;
}

interface ApiResponse {
  data: number;
}

type Contract = {
  contractId: number;
  payoff: string;
  expiry: string;
  strike: number | undefined;
};

export type ReceivedContract = Contract & { price: number };

interface FetchPriceListParams {
  contracts: Contract[];
}

export const fetchPrice = async ({ optionType, date, strike }: FetchPrice): Promise<ApiResponse> => {
  const apiUrl = await fetchSingleConfigKey("TRADING_URL");
  const apiService = new ApiService(apiUrl);
  return apiService.get("/api/calc/price", {
    params: {
      payoff: optionType,
      date: date,
      strike: strike,
    },
  });
};

export const fetchForwardPrice = async ({ date }: { date: string }): Promise<ApiResponse> => {
  const apiUrl = await fetchSingleConfigKey("TRADING_URL");
  const apiService = new ApiService(apiUrl);
  return apiService.get("/api/calc/forward", {
    params: {
      date: date,
    },
  });
};

export const fetchPriceList = async ({ contracts }: FetchPriceListParams) => {
  const apiUrl = await fetchSingleConfigKey("TRADING_URL");

  const headers = {
    "Content-Type": "application/json;charset=UTF-8",
    Accept: "application/json, text/plain, */*",
  };

  try {
    const requestOptions = {
      method: "post",
      headers,
      ...{ body: JSON.stringify([...contracts]) },
    };

    const response = await fetch(`${apiUrl}/api/calc/price_list`, requestOptions);
    const responseData = await response.json();

    if (!response.ok) {
      const error = new Error();
      error.name = responseData.name;
      error.message = responseData.message;
      throw error;
    }

    return { data: responseData };
  } catch (error) {
    return { error: error as AxiosError };
  }
};

// If option is forward, date is current date
// otherwise use date from expiry date
export const fetchPriceForUnit = async ({
  isForward,
  optionType,
  expiryDate,
  strike,
  side,
  forcedSpread,
}: FetchPriceHelper): Promise<string | null> => {
  const dateInitial = formatDate(expiryDate.toString(), DEFAULT_INPUT_DATE_FORMAT, "YYYY-MM-DD");
  try {
    if (isForward) {
      const dateFinal = optionType === "NEXT_AUCTION" ? dayjs().format("YYYY-MM-DD") : dateInitial;
      const price = await fetchForwardPrice({ date: dateFinal });
      return transformTradingPrice(
        !side ? price.data : calculateBidAsk(Number(price.data), "Forward", side, forcedSpread)
      );
    } else if (strike && strike !== "-") {
      const price = await fetchPrice({
        optionType: optionType,
        date: dateInitial,
        strike: strike,
      });
      return transformTradingPrice(
        !side ? price.data : calculateBidAsk(Number(price.data), optionType, side, forcedSpread)
      );
    }
  } catch (error) {
    console.error("fetchPriceForUnit__error", error);
    return null;
  }
  console.error("fetchPriceForUnit__error", "no price");
  return null;
};
