// Utils
import { renderDate } from "@/UI/utils/TableOrder";

// Components
import Button from "@/UI/components/Button/Button";
import DropdownOutlined from "../../Icons/DropdownOutlined";
import { Separator } from "../components/Separator";

// Styles
import styles from "../TableOrder.module.scss";
import { PositionRow } from "../types";

type SingleOrderRowProps = {
  row: PositionRow;
  cancelOrder?: boolean;
  rowIndex: number;
  handleRowExpand: (index: number) => void;
  expandedRow: number[];
};

const SinglePositionRow = (props: SingleOrderRowProps) => {
  const { row, rowIndex, handleRowExpand, expandedRow } = props;
  return (
    <>
      {rowIndex > 0 && <Separator />}
      <div
        onKeyDown={() => handleRowExpand(rowIndex)}
        onClick={() => handleRowExpand(rowIndex)}
        className={styles.cell}
      >
        <Button
          title='Click to expand dropdown'
          className={`${styles.dropdown} ${expandedRow.includes(rowIndex) ? styles.isActive : ""}`}
        >
          <DropdownOutlined />
        </Button>
      </div>
      <div
        className={styles.cellContent}
        style={{ padding: "8px 0px", justifyContent: "flex-start", gridColumn: "span 2" }}
      >
        {row.tenor && renderDate(row.tenor)}
      </div>
      <div className={styles.cellContent} style={{ justifyContent: "flex-start" }}>
        {row.product}
      </div>
      <div className={styles.cellContent} style={{ gridColumn: "span 2" }}>
        {row.strike}
      </div>
      <div className={styles.cellContent} style={{ justifyContent: "center" }}>
        {row.quantity}
      </div>
      <div className={styles.cellContent} style={{ justifyContent: "flex-end" }}>
        {row.averagePrice}
      </div>
    </>
  );
};

export default SinglePositionRow;
