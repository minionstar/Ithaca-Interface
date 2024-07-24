import { ReactNode } from "react";

import classNames from "classnames";

import { formatNumber } from "@/UI/utils/Points";

interface SingleValueCellProps {
  depthValue: number | null;
  currencyIcon: ReactNode;
  value?: number | null;
  textClassName?: string;
  className?: string;
}

const SingleValueCell = ({ value, depthValue, currencyIcon, textClassName, className }: SingleValueCellProps) => {
  return (
    <div
      className={classNames(
        "tw-font-roboto tw-flex tw-w-1/3 tw-flex-col tw-gap-1 tw-overflow-hidden tw-overflow-ellipsis tw-whitespace-nowrap tw-text-center tw-text-sm tw-font-normal",
        className
      )}
    >
      <span className={classNames("tw-flex tw-items-center tw-justify-center", textClassName)}>
        {value ? formatNumber(value, 3) : "-"}
      </span>
      <span className='tw-flex tw-flex-row tw-items-center tw-justify-center tw-gap-[2px] tw-text-[10px] tw-text-ithaca-white-60'>
        {depthValue ? formatNumber(depthValue, 3) : "-"}
        {currencyIcon}
      </span>
    </div>
  );
};

export default SingleValueCell;
