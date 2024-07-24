import { useEffect, useRef, useState } from "react";
import Sort from "@/UI/components/Icons/Sort";
import Button from "@/UI/components/Button/Button";
import { useEscKey } from "@/UI/hooks/useEscKey";
// Styles
import styles from "../TableOrder.module.scss";
import { getTableHeaders } from "../helpers";
import { TABLE_TYPE } from "../types";
import { Separator } from "../components/Separator";
import { ClearFilters, ShowFilterButton } from "../components/helperComponents";
import { PRODUCT_LABEL } from "@/UI/utils/TableOrder";
import { CheckBoxControlled } from "@/UI/components/CheckBox/CheckBox";

interface HeaderPositionsProps {
  updateSort: (header: string, dir: boolean) => void;
  productFilter: string[];
  setProductFilter: (arr: string[]) => void;
  setExpiryFilter: (arr: string[]) => void;
  setStrikeFilter: (arr: string[]) => void;
  expiryAvailableOptions: string[];
  strikeAvailableOptions: number[];
  expiryFilter: string[];
  strikeFilter: string[];
}

const HeaderPositions = (props: HeaderPositionsProps) => {
  const {
    updateSort,
    productFilter,
    setProductFilter,
    expiryAvailableOptions,
    strikeAvailableOptions,
    expiryFilter,
    setExpiryFilter,
    setStrikeFilter,
    strikeFilter,
  } = props;

  const [filterHeader, setFilterHeader] = useState<string | null>(null);
  const productRef = useRef<HTMLDivElement | null>(null);
  const strikeRef = useRef<HTMLDivElement | null>(null);
  const expiryRef = useRef<HTMLDivElement | null>(null);

  // Set visible filter bar for show/hide filter box
  const showFilterBar = (header: string) => () => {
    if (header === filterHeader) {
      setFilterHeader(null);
    } else {
      setFilterHeader(header);
    }
  };

  // Close Esc key for dropdown menu filter
  useEscKey(() => {
    if (filterHeader) {
      setFilterHeader(null);
    }
  });

  // Outside handle click for hide dialog
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        strikeRef.current &&
        !strikeRef.current.contains(event.target as Node) &&
        expiryRef.current &&
        !expiryRef.current.contains(event.target as Node) &&
        productRef.current &&
        !productRef.current.contains(event.target as Node)
      ) {
        setFilterHeader(null);
      }
    };

    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const updateFilter = (label: string, isChecked: boolean) => {
    const labelUppercased = label.toUpperCase();

    if (filterHeader === "Product") {
      if (isChecked) {
        setProductFilter([...productFilter, labelUppercased]);
      } else {
        setProductFilter(productFilter.filter((item: string) => item !== labelUppercased));
      }
    }

    if (filterHeader === "Expiry") {
      if (isChecked) {
        setExpiryFilter([...expiryFilter, labelUppercased]);
      } else {
        setExpiryFilter(expiryFilter.filter((item: string) => item !== labelUppercased));
      }
    }

    if (filterHeader === "Strike") {
      if (isChecked) {
        setStrikeFilter([...strikeFilter, labelUppercased]);
      } else {
        setStrikeFilter(strikeFilter.filter((item: string) => item !== labelUppercased));
      }
    }
  };

  const getHeaderColumn = (header: string) => {
    const filterClass = header === filterHeader ? "" : styles.hide;
    switch (header) {
      case "Details":
        return null;
      case "Product":
        return (
          <>
            <ShowFilterButton onClick={showFilterBar(header)} fill={productFilter.length > 0} />
            <div className={`${styles.filterDropdown} ${filterClass}`} ref={productRef}>
              {PRODUCT_LABEL.map(item => {
                return (
                  <CheckBoxControlled
                    className='mb-5'
                    labelClassName='fs-xs-semibold nowrap'
                    checked={productFilter.includes(item.value.toUpperCase())}
                    key={item.value}
                    value={item.value}
                    label={item.label}
                    onChange={updateFilter}
                  />
                );
              })}
              <ClearFilters
                onClick={() => setProductFilter([])}
                className={productFilter.length > 0 ? styles.selected : ""}
              />
            </div>
          </>
        );
      case "Expiry":
        return (
          <>
            <ShowFilterButton onClick={showFilterBar(header)} fill={expiryFilter.length > 0} />
            <div className={`${styles.filterDropdown} ${filterClass}`} ref={expiryRef}>
              {expiryAvailableOptions.map(item => {
                return (
                  <CheckBoxControlled
                    className='mb-5'
                    labelClassName='fs-xs-semibold'
                    value={item}
                    checked={expiryFilter.includes(item.toUpperCase())}
                    key={item}
                    label={item}
                    onChange={updateFilter}
                  />
                );
              })}
              <ClearFilters
                onClick={() => setExpiryFilter([])}
                className={expiryFilter.length > 0 ? styles.selected : ""}
              />
            </div>
          </>
        );
      case "Strike":
        return (
          <>
            <ShowFilterButton onClick={showFilterBar(header)} fill={strikeFilter.length > 0} />
            <div className={`${styles.filterDropdown} ${filterClass}`} ref={strikeRef}>
              {strikeAvailableOptions.sort().map(item => {
                if (!item) {
                  return <></>;
                }
                return (
                  <CheckBoxControlled
                    className='mb-5'
                    labelClassName='fs-xs-semibold'
                    value={`${item}`}
                    checked={strikeFilter.includes(`${item}`.toUpperCase())}
                    key={`${item}`}
                    label={`${item}`}
                    onChange={updateFilter}
                  />
                );
              })}
              <ClearFilters
                onClick={() => setStrikeFilter([])}
                className={strikeFilter.length > 0 ? styles.selected : ""}
              />
            </div>
          </>
        );
      default:
        return (
          <Button
            title='Click to sort column'
            className={styles.sort}
            onClick={() => {
              updateSort(header, true);
            }}
          >
            <Sort />
          </Button>
        );
    }
  };

  return (
    <>
      {getTableHeaders(TABLE_TYPE.ORDER).map(header => {
        return (
          <div className={styles.cell} key={header.name} style={{ ...header.style }}>
            {header.name}
            {getHeaderColumn(header.name)}
          </div>
        );
      })}
      {/* Bottom border of headers */}
      <Separator />
    </>
  );
};

export default HeaderPositions;
