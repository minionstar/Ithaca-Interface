// Packages
import { useEffect, useState } from "react";
import classNames from "classnames";
// Constants
import { TableFundLockDataProps } from "@/UI/constants/tableFundLock";

// Utils
import { renderDate } from "@/UI/utils/TableOrder";

// Components
import Asset from "@/UI/components/Asset/Asset";
import Button from "@/UI/components/Button/Button";
import CurrencyDisplay from "@/UI/components/CurrencyDisplay/CurrencyDisplay";
import LogoEth from "@/UI/components/Icons/LogoEth";
import LogoUsdc from "@/UI/components/Icons/LogoUsdc";

// Styles
import { useAppStore } from "@/UI/lib/zustand/store";
import { addMinutes } from "date-fns";
import Loader from "../Loader/Loader";
import styles from "./TableFundLock.module.scss";

export const HOW_MANY_MINUTES_AFTER_DEPOSIT_CAN_RELEASE = 40;

interface SingleFundlockRowProps {
  item: TableFundLockDataProps;
  refetch?: () => void;
}

const SingleFundlockRow = ({ item, refetch }: SingleFundlockRowProps) => {
  const { ithacaSDK } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [timeTillRelease, setTimeTillRelease] = useState("");
  const [isReleaseAvailable, setIsReleaseAvailable] = useState(false);
  const { timestamp, orderDate, withdrawalSlot, asset, auction, currency, amount, token } = item;

  const handleReleaseClick = (token: `0x${string}`, withdrawalSlot?: string) => async () => {
    try {
      setIsLoading(true);
      await ithacaSDK.fundlock.release(token, Number(withdrawalSlot));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);

      // Refetch new data
      setTimeout(() => {
        refetch?.();
      }, 5_000);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const timeDiff =
        addMinutes(new Date(Number(timestamp) * 1000), HOW_MANY_MINUTES_AFTER_DEPOSIT_CAN_RELEASE).getTime() -
        Date.now();
      const minutes = Math.floor(timeDiff / 1000 / 60);
      const seconds = Math.floor((timeDiff / 1000) % 60);
      if (timeDiff <= 0) {
        setTimeTillRelease("Release in 00:00");
        setIsReleaseAvailable(true);
        clearInterval(interval);
        return;
      }
      const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
      setTimeTillRelease(`Release in ${formattedTime}`);
    }, 1_000);

    return () => {
      clearInterval(interval);
    };
  }, [timestamp]);

  return (
    <>
      <div className={styles.cell}>{renderDate(orderDate)}</div>
      <div className={styles.cell}>
        <Asset size='sm' icon={asset === "USDC" ? <LogoUsdc /> : <LogoEth />} label={asset} />
      </div>
      <div className={styles.cell}>{auction}</div>
      <div className={styles.cell}>
        <CurrencyDisplay
          size='md'
          amount={amount}
          symbol={currency === "USDC" ? <LogoUsdc /> : <LogoEth />}
          currency={currency}
        />
      </div>
      <div className={styles.cell}>
        <span style={{ display: "flex", justifyContent: "flex-end" }}>
          {auction === "Withdraw" && !isReleaseAvailable ? timeTillRelease : ""}
        </span>
      </div>
      <div className={classNames(styles.cell, styles.releaseButtonCell)}>
        {auction === "Withdraw" && (
          <Button
            disabled={!isReleaseAvailable}
            size='sm'
            title='Click to release'
            className={styles.releaseButton}
            onClick={handleReleaseClick(token, withdrawalSlot)}
          >
            {isLoading ? <Loader type='sm' /> : "Release"}
          </Button>
        )}
      </div>
    </>
  );
};

export default SingleFundlockRow;
