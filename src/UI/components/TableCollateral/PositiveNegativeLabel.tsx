import { formatNumberByCurrency, transformTradingPrice } from "@/UI/utils/Numbers";
import styles from "./TableCollateral.module.scss";
import { Currency } from "@/utils/types";

interface LabelProps {
  value: number;
  currency: string;
}
const PositiveNegativeLabel = ({ value, currency }: LabelProps) => {
  const finalValueToUse = `${value}`.includes("e") ? Number(transformTradingPrice(value)) : value;
  const formattedValue = formatNumberByCurrency(
    Number(finalValueToUse),
    "string",
    currency as Currency,
    undefined,
    true
  );
  if (finalValueToUse === 0) {
    return <p>{formattedValue}</p>;
  }

  const isPositive = finalValueToUse > 0;

  const label = isPositive ? "Pay" : "Receive";
  const className = isPositive ? styles.payValue : styles.receiveValue;

  return (
    <div className={styles.valueContainer}>
      <p>{label}</p>
      <p className={className}>{formattedValue}</p>
    </div>
  );
};

export default PositiveNegativeLabel;
