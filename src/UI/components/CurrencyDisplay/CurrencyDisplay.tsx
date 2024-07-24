// Packages
import { ReactNode } from "react";

// Styles
import styles from "./CurrencyDisplay.module.scss";

// Types
type CurrencyDisplayProps = {
  amount: number | string;
  symbol: ReactNode;
  currency: string;
  size?: string;
};

const CurrencyDisplay = ({ amount, symbol, currency, size }: CurrencyDisplayProps) => {
  const sizeClass = size ? styles[size] : "";

  return (
    <div className={`${styles.container} ${sizeClass}`.trim()}>
      {amount} {symbol} <span>{currency}</span>
    </div>
  );
};

export default CurrencyDisplay;
