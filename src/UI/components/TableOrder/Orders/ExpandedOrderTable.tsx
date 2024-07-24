import { Fragment } from "react";
// Constants
import { TABLE_ORDER_EXPANDED_HEADERS, TABLE_TYPE, TableExpandedRowData } from "../types";

// Utils
import { getSideIcon } from "@/UI/utils/TableOrder";

// Styles
import { SingleCurrencyAmount } from "../../CollateralAmount/CollateralAmount";
import styles from "../TableOrder.module.scss";

// Types
type ExpandedTableProps = {
  data: TableExpandedRowData[];
  type: TABLE_TYPE;
};

type EmptyDivProps = {
  className?: string;
};

const EmptyDiv = ({ className = "" }: EmptyDivProps) => <div className={className}></div>;

const ExpandedOrderTable = ({ data, type }: ExpandedTableProps) => {
  const isLiveTable = type === TABLE_TYPE.LIVE;
  return (
    <>
      <EmptyDiv />
      <div className={styles.headerExpandedTable}>Strategy</div>
      <EmptyDiv />
      {TABLE_ORDER_EXPANDED_HEADERS.map((header, idx) => (
        <div
          key={idx}
          className={`${styles.cell} ${idx === 3 ? styles.emptyDiv : ""}`}
          style={{ flexDirection: "column", ...header.style }}
        >
          <div className={styles.cell} key={idx}>
            {header.name}
          </div>
        </div>
      ))}
      <EmptyDiv />
      <div style={{ gridColumn: isLiveTable ? "b/k" : "b/i" }}>
        <div className={styles.separator} />
      </div>
      <EmptyDiv />
      {data.map((item, index) => (
        <Fragment key={index}>
          <div style={{ gridColumn: isLiveTable ? "a/l" : "a/j", marginTop: 5 }}></div>
          <EmptyDiv />
          <div className={`${styles.cellContentExpanded} ${styles.bolded}`}>{item.type}</div>
          <EmptyDiv />
          <EmptyDiv className={styles.emptyDiv} />
          <div className={styles.cellContentExpanded}>{getSideIcon(item.side)}</div>
          <div className={styles.cellContentExpanded}>
            <span className={styles.date}>{item.expiryDate}</span>
          </div>
          <div className={styles.cellContentExpanded} style={{ justifyContent: "flex-end" }}>
            <SingleCurrencyAmount amount={item.size} currency={item.sizeCurrency} />
          </div>
          <div className={styles.cellContentExpanded} style={{ justifyContent: "flex-end" }}>
            {item.strike && item.strikeCurrency && (
              <SingleCurrencyAmount amount={item.strike} currency={item.strikeCurrency} />
            )}
          </div>
          {isLiveTable && (
            <>
              <EmptyDiv />
              <EmptyDiv />
            </>
          )}
          <EmptyDiv />
        </Fragment>
      ))}
      <div style={{ gridColumn: isLiveTable ? "a/l" : "a/j", marginTop: 15 }}></div>
    </>
  );
};

export default ExpandedOrderTable;
