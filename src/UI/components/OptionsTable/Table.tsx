import { useEffect, useState } from "react";

// Constants
import { OptionsBidAskData, OptionsData, TableProps } from "@/UI/constants/prices";

// Utils
import { formatNumber } from "@/UI/utils/Points";
import { fetchPriceList, ReceivedContract } from "@/services/pricing/calcPrice.api.service";
import { DEFAULT_INPUT_DATE_FORMAT, formatDate } from "@/UI/utils/DateFormatting";

// Styles
import styles from "@/UI/components/OptionsTable/OptionsTable.module.scss";
import { calculateBidAsk } from "@/services/pricing/helpers";
import classNames from "classnames";
import SingleValueCell from "./SingleValueCell";

const Table = ({ type, data, strikes, currencyIcon }: TableProps) => {
  const [showingData, setShowingData] = useState<OptionsBidAskData[]>([]);

  useEffect(() => {
    if (!data.length) return;
    const tempData: OptionsData[] = [];
    for (let i = 0; i < strikes.length; i++) {
      const tempDataForStrike = data.reduce((acc: OptionsData | undefined, el: OptionsData) => {
        if (el.economics.strike === strikes[i]) {
          if (!acc || el.referencePrice > acc.referencePrice) {
            return el;
          } else if (el.referencePrice === acc.referencePrice) {
            return el;
          }
        }
        return acc;
      }, undefined);

      if (tempDataForStrike) {
        tempData.push(tempDataForStrike);
      }
    }

    const contracts = tempData.map(el => {
      const date = formatDate(el.economics.expiry.toString(), DEFAULT_INPUT_DATE_FORMAT, "YYYY-MM-DD");

      return {
        contractId: el.contractId,
        payoff: el.payoff,
        expiry: date,
        strike: el.economics.strike,
      };
    });

    fetchPriceList({ contracts }).then(({ data, error }) => {
      if (error) {
        console.log(error);
      } else if (data) {
        const showingList = tempData.map(el => {
          const newContract = data.find((newContract: ReceivedContract) => newContract.contractId === el.contractId);
          const pricingServerBid = calculateBidAsk(newContract.price, newContract.payoff, "SELL");
          const pricingServerAsk = calculateBidAsk(newContract.price, newContract.payoff, "BUY");
          const useBestAsk = el.bestAsk !== null;
          return {
            askVolume: el.askVolume,
            bidVolume: el.bidVolume,
            bestBid: el.bestBid || 0 > pricingServerBid ? Number(el.bestBid) : pricingServerBid,
            bestAsk: useBestAsk && Number(el.bestAsk) < pricingServerAsk ? Number(el.bestAsk) : pricingServerAsk,
            referencePrice: newContract.price,
          };
        });

        setShowingData(showingList);
      }
    });
  }, [data, strikes]);

  return (
    <div className={styles.table}>
      <h1>{type.charAt(0).toUpperCase() + type.slice(1)}</h1>
      <div className={`${styles.header} ${styles[type]}`}>
        <div className={styles.cell}>Bid</div>
        <div className={styles.cell}>Model</div>
        <div className={styles.cell}>Ask</div>
      </div>
      {showingData.map((el, index) => {
        return (
          <div
            key={index}
            className={classNames(
              `${styles.row} ${styles[type]} ${index % 2 === 1 && styles.darkRow} ${index === 5 && styles.selectedRow}`,
              "tw-h-[54px]"
            )}
          >
            <SingleValueCell
              textClassName='tw-text-ithaca-green-30'
              value={el.bestBid}
              depthValue={el.bidVolume}
              currencyIcon={currencyIcon}
            />
            <div className={classNames(styles.cell, "tw-flex tw-flex-col")}>
              <span className='tw-text-ithaca-white-60'>{formatNumber(el.referencePrice, 3)}</span>
            </div>
            <SingleValueCell
              textClassName='tw-text-ithaca-red-20'
              value={el.bestAsk}
              depthValue={el.askVolume}
              currencyIcon={currencyIcon}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Table;
