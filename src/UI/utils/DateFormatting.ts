import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

export const formatDate = (date: string | number, inputFormat: string | undefined, outputFormat: string) => {
  return readDate(date, inputFormat).format(outputFormat);
};

export const readDate = (date: string | number, format: string | undefined) => {
  return dayjs(date, format);
};

export const DEFAULT_OUTPUT_DATE_FORMAT = "DMMMYY";

export const DEFAULT_INPUT_DATE_FORMAT = "YYMMDDHHm";

export const API_DATE_FORMAT = "YYYY-MM-DD";
