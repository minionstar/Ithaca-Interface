import { useAppStore } from "@/UI/lib/zustand/store";
import LogoEth from "../Icons/LogoEth";
import LogoUsdc from "../Icons/LogoUsdc";
import styles from "./fundlock.module.scss";
import { useQuery } from "@tanstack/react-query";
import { formatNumberByCurrency } from "@/UI/utils/Numbers";
import { Currency } from "@/utils/types";
import classNames from "classnames";

interface FundlockValueProps {
  isAlwaysInline?: boolean;
}

const FundlockValue = ({ isAlwaysInline }: FundlockValueProps) => {
  const { ithacaSDK, isAuthenticated } = useAppStore();

  const { data } = useQuery({
    enabled: isAuthenticated,
    queryKey: ["fundlockValue"],
    queryFn: () => ithacaSDK.client.fundLockState(),
    refetchInterval: 10_000,
    select: data => {
      const fundlockWETH = data.find(fundlock => fundlock.currency === "WETH");
      const fundlockUSDC = data.find(fundlock => fundlock.currency === "USDC");

      return {
        usdcValue: fundlockUSDC?.fundLockValue,
        wethValue: fundlockWETH?.fundLockValue,
      };
    },
  });

  return (
    <div
      className={classNames(styles.fundlockContainer, {
        [styles.alwaysInLine]: isAlwaysInline,
      })}
    >
      <span className={styles.title}>Available Balance</span>
      <div className={styles.valueContainer}>
        <LogoUsdc />
        <span className={styles.currency}>USDC</span>
        <span className={styles.value}>
          {formatNumberByCurrency(Number(data?.usdcValue), "string", "USDC" as Currency, 2)}
        </span>
        <LogoEth />
        <span className={styles.currency}>WETH</span>
        <span className={styles.value}>
          {formatNumberByCurrency(Number(data?.wethValue), "string", "WETH" as Currency, 2)}
        </span>
      </div>
    </div>
  );
};

export default FundlockValue;
