import { Fragment } from "react";
// Constants
import { TABLE_ORDER_EXPANDED_HEADERS_FOR_POSITIONS, PositionsExpandedRow } from "../types";

// Utils
import { formatCurrencyPair, getSideIcon } from "@/UI/utils/TableOrder";

// Styles
import { SingleCurrencyAmount } from "../../CollateralAmount/CollateralAmount";
import styles from "../TableOrder.module.scss";

// Types
type ExpandedTableProps = {
  data: PositionsExpandedRow[];
};

const EmptyDiv = () => <div></div>;

const ExpandedPositionTable = ({ data }: ExpandedTableProps) => {
  return (
    <>
      <EmptyDiv />
      <div className={styles.headerExpandedTable}>Strategy</div>
      <EmptyDiv />
      {TABLE_ORDER_EXPANDED_HEADERS_FOR_POSITIONS.map((header, idx) => (
        <div key={idx} className={styles.cell} style={{ flexDirection: "column", ...header.style }}>
          <div className={styles.cell} key={idx}>
            {header.name}
          </div>
        </div>
      ))}
      <EmptyDiv />
      <div style={{ gridColumn: "b/i" }}>
        <div className={styles.separator} />
      </div>
      <EmptyDiv />
      {data.map((item, index) => (
        <Fragment key={index}>
          <div style={{ gridColumn: "a/j", marginTop: 5 }}></div>
          <EmptyDiv />
          <div className={`${styles.cellContentExpanded} ${styles.bolded}`}>{item.orderDate}</div>
          <div className={styles.cellContentExpanded}>{formatCurrencyPair(item.currencyPair)}</div>
          <div className={styles.cellContentExpanded}>{item.product}</div>
          <div className={styles.cellContentExpanded}>{getSideIcon(item.side)}</div>
          <div className={styles.cellContentExpanded}>
            <span className={styles.date}>{item.tenor}</span>
          </div>
          <EmptyDiv />
          <div className={styles.cellContentExpanded} style={{ justifyContent: "flex-end" }}>
            <SingleCurrencyAmount amount={item.strike} currency='USDC' />
          </div>
          <EmptyDiv />
        </Fragment>
      ))}
      <div style={{ gridColumn: "a/j", marginTop: 15 }}></div>
    </>
  );
};

export default ExpandedPositionTable;
