// Constants
import { TABLE_STRATEGY_HEADERS, TABLE_STRATEGY_HEADERS_STORIES } from "@/UI/constants/tableStrategy";

// Utils
import { displaySideIcon } from "@/UI/utils/Icons";

// Components
import Button from "@/UI/components/Button/Button";
import Remove from "@/UI/components/Icons/Remove";

// Styles
import styles from "./TableStrategy.module.scss";
import { PositionBuilderStrategy } from "@/pages/trading/position-builder";
import Dot from "../Dot/Dot";
import { formatNumberByCurrency } from "@/UI/utils/Numbers";

type StrategyTableProps = {
  strategies: PositionBuilderStrategy[];
  removeRow?: (index: number) => void;
  clearAll?: () => void;
  hideClear?: boolean;
};

const TableStrategy = ({ strategies, removeRow, clearAll, hideClear = false }: StrategyTableProps) => {
  return (
    <div className={styles.tableContainer}>
      <div className={styles.table}>
        <div
          style={{
            gridTemplateColumns: !strategies[0]?.referencePrice
              ? "repeat(6, minmax(0, 1fr))"
              : !hideClear
                ? "repeat(8, minmax(0, 1fr))"
                : "repeat(7, minmax(0, 1fr))",
          }}
          className={styles.header}
        >
          {strategies[0]?.referencePrice
            ? TABLE_STRATEGY_HEADERS.map((header, idx) => (
                <div className={styles.cell} key={idx}>
                  {header}
                </div>
              ))
            : TABLE_STRATEGY_HEADERS_STORIES.map((header, idx) => (
                <div className={styles.cell} key={idx}>
                  {header}
                </div>
              ))}
        </div>
        {strategies.length ? (
          strategies.map((strategy, idx) => (
            <div
              style={{
                gridTemplateColumns: !strategies[0]?.referencePrice
                  ? "repeat(6, minmax(0, 1fr))"
                  : !hideClear
                    ? "repeat(8, minmax(0, 1fr))"
                    : "repeat(7, minmax(0, 1fr))",
              }}
              className={styles.row}
              key={idx}
            >
              <div className={styles.cell}>
                <div className={styles.dot}>
                  <Dot type={`leg${idx + 1}`} />
                  <div className={styles.strategy}>
                    {strategy.payoff === "NEXT_AUCTION"
                      ? "Forward(Next Auction)"
                      : strategy.payoff === "BinaryCall"
                        ? "Digital Call"
                        : strategy.payoff === "BinaryPut"
                          ? "Digital Put"
                          : strategy.payoff}
                  </div>
                </div>
              </div>
              <div className={styles.cell}>{displaySideIcon(strategy.leg.side)}</div>
              <div className={styles.cell}>{strategy.leg.quantity}</div>
              {/* Do not display strike for forward */}
              <div className={styles.cell}>{strategy.strike === "-" ? "" : Number(strategy.strike)}</div>
              {strategy.referencePrice && (
                <div className={styles.cell}>
                  {formatNumberByCurrency(Number(strategy.referencePrice), "string", "USDC")}
                </div>
              )}
              {!hideClear && (
                <div className={styles.cell}>
                  <Button title='Click to remove row' variant='icon' onClick={() => removeRow && removeRow(idx)}>
                    <Remove />
                  </Button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={styles.emptyContainer}>Please add a strategy.</div>
        )}
      </div>
      {strategies.length > 0 && !hideClear && (
        <Button className={styles.clearAll} title='Click to clear all' onClick={clearAll} variant='clear'>
          Clear All
        </Button>
      )}
    </div>
  );
};

export default TableStrategy;
