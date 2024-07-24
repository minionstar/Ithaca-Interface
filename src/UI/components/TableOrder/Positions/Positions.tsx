import { useEffect, useState } from "react";
import classNames from "classnames";
import { useAppStore } from "@/UI/lib/zustand/store";

import styles from "../TableOrder.module.scss";

import ExpandableTable from "../components/ExpandableTable/ExpandableTable";
import { TableFooter } from "../components/TableFooter/TableFooter";
import { sortNumberValues, transformPositionsOrders } from "../helpers";
import { PositionRow, TABLE_TYPE } from "../types";
import ExpandedPositionTable from "./ExpandedPositionTable";
import HeaderColumns from "./HeaderPositions";
import SinglePositionRow from "./SinglePositionRow";
import { filterExpiryInPositions, filterProductsInPositions, filterStrikeInPositions } from "./filters";
import usePagination from "../usePagination";

const Positions = () => {
  const { currentPage, handlePageChange, pageStart, pageEnd } = usePagination();
  const { ithacaSDK, isAuthenticated, unFilteredContractList } = useAppStore();
  // Data storage
  const [isLoading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<PositionRow[]>([]);
  const [slicedData, setSlicedData] = useState<PositionRow[]>([]);
  const [totalItemsAmount, setTotalItemsAmount] = useState<number>(0);
  // Expanded row state
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  // Sorting and filtering
  const [sortingHeader, setSortingHeader] = useState<string | null>(null);
  const [isSortingAsc, setIsSortingAsc] = useState<boolean>(true);
  const [productFilter, setProductFilter] = useState<string[]>([]);
  const [strikeFilter, setStrikeFilter] = useState<string[]>([]);
  const [expiryFilter, setExpiryFilter] = useState<string[]>([]);
  const [expiryFilterAvailableOptions, setExpiryFilterAvailableOptions] = useState<Set<string>>(new Set());
  const [strikeFilterAvailableOptions, setStrikeFilterAvailableOptions] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isAuthenticated) {
      ithacaSDK.client.currentPositions("SHOW_ORDERS").then(res => {
        setData(transformPositionsOrders(res, unFilteredContractList));
        setLoading(false);
      });
    }
  }, []);

  useEffect(() => {
    setExpiryFilterAvailableOptions(new Set(data.map(item => item.tenor)));
    setStrikeFilterAvailableOptions(new Set(data.map(item => item.strike)));
  }, [data]);

  // Handle row expand and collapse
  const handleRowExpand = (rowIndex: number) => {
    if (expandedRows.includes(rowIndex)) {
      setExpandedRows(prev => prev.filter(idx => idx !== rowIndex));
    } else {
      setExpandedRows(prev => [...prev, rowIndex]);
    }
  };

  const applyFiltersAndSorting = () => {
    let filteredData = filterProductsInPositions(data, productFilter);
    filteredData = filterExpiryInPositions(filteredData, expiryFilter);
    filteredData = filterStrikeInPositions(filteredData, strikeFilter);

    let sortedFilteredData = filteredData;
    if (sortingHeader === "Quantity" || sortingHeader === "Average Price") {
      const key = sortingHeader === "Quantity" ? "quantity" : "averagePrice";
      sortedFilteredData = sortNumberValues(filteredData, key, isSortingAsc);
    }

    setTotalItemsAmount(sortedFilteredData.length);
    setSlicedData(sortedFilteredData.slice(pageStart, pageEnd));
  };

  // Effect to apply filters and sorting when data or criteria change
  useEffect(() => {
    applyFiltersAndSorting();
  }, [data, productFilter, expiryFilter, strikeFilter, sortingHeader, isSortingAsc, pageStart, pageEnd]);

  const updateSort = (header: string, dir: boolean) => {
    setSortingHeader(header);
    setIsSortingAsc(sortingHeader != header ? true : !isSortingAsc);
  };

  const displayIsLoading = !slicedData.length && isLoading && isAuthenticated;
  const displayNoResults = !slicedData.length && !isLoading;
  const displayTable = slicedData.length > 0;

  return (
    <>
      <div
        className={classNames(styles.gridContainerTable, {
          [styles.isOpacity]: !isAuthenticated,
        })}
      >
        <HeaderColumns
          expiryAvailableOptions={Array.from(expiryFilterAvailableOptions)}
          strikeAvailableOptions={Array.from(strikeFilterAvailableOptions)}
          setProductFilter={setProductFilter}
          productFilter={productFilter}
          setExpiryFilter={setExpiryFilter}
          expiryFilter={expiryFilter}
          setStrikeFilter={setStrikeFilter}
          strikeFilter={strikeFilter}
          updateSort={updateSort}
        />

        {displayTable &&
          slicedData.map((row, rowIndex) => {
            const isRowExpanded = expandedRows.includes(rowIndex);
            return (
              <>
                <SinglePositionRow
                  handleRowExpand={handleRowExpand}
                  expandedRow={expandedRows}
                  row={row}
                  rowIndex={rowIndex}
                />
                <ExpandableTable isRowExpanded={isRowExpanded} type={TABLE_TYPE.ORDER}>
                  <ExpandedPositionTable data={row.expandedInfo || []} />
                </ExpandableTable>
              </>
            );
          })}
      </div>

      <TableFooter
        displayIsLoading={displayIsLoading}
        displayNoResults={displayNoResults}
        isAuthenticated={isAuthenticated}
        totalItems={totalItemsAmount}
        currentPage={currentPage}
        handlePageChange={handlePageChange}
      />
    </>
  );
};

export default Positions;
