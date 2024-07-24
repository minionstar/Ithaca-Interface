import classNames from "classnames";

import { Currency } from "@/utils/types";
import { isProd } from "@/UI/utils/RainbowKit";
import Asset from "@/UI/components/Asset/Asset";
import Button from "@/UI/components/Button/Button";
import { useAppStore } from "@/UI/lib/zustand/store";
import useMediaQuery from "@/UI/hooks/useMediaQuery";
import { formatNumberByCurrency } from "@/UI/utils/Numbers";
import { DESKTOP_BREAKPOINT } from "@/UI/constants/breakpoints";
import { CollateralSummary, TABLE_COLLATERAL_HEADERS } from "@/UI/constants/tableCollateral";

import Loader from "../Loader/Loader";
import PositiveNegativeLabel from "./PositiveNegativeLabel";

// Types
type CollateralTableProps = {
  collateralSummary: { [currency: string]: CollateralSummary };
  deposit: (asset: string) => void;
  withdraw: (asset: string) => void;
  faucet: (asset: string) => void;
};

const TableCollateral = ({ collateralSummary, deposit, withdraw, faucet }: CollateralTableProps) => {
  const { isAuthenticated } = useAppStore();
  const desktopBreakpoint = useMediaQuery(DESKTOP_BREAKPOINT);

  return (
    <table
      className={classNames("tw-min-w-full tw-divide-y tw-divide-rgba-white-10 tw-border-b tw-border-rgba-white-10", {
        "tw-opacity-10": !isAuthenticated,
      })}
    >
      <thead>
        <tr>
          {TABLE_COLLATERAL_HEADERS.map((header, idx) => {
            return (
              <th
                key={idx}
                scope='col'
                className={classNames(
                  "tw-px-1 tw-py-2 tw-text-left tw-text-xs tw-font-normal tw-text-ithaca-white-60",
                  { "tw-px-0": idx === 0 }
                )}
              >
                {header}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody className='tw-divide-y tw-divide-rgba-white-10'>
        {Object.keys(collateralSummary).map((currency, idx) => {
          const {
            isTransactionInProgress,
            positionCollateralRequirement,
            currencyLogo,
            walletBalance,
            fundLockValue,
            orderValue,
          } = collateralSummary[currency];
          return (
            <tr key={idx}>
              <td className={classNames("tw-whitespace-nowrap tw-py-3 tw-text-white")}>
                <div className='tw-hidden sm:tw-flex '>
                  <Asset icon={currencyLogo} label={currency} size='sm' />
                </div>
                <div className='tw-flex sm:tw-hidden'>{currencyLogo}</div>
              </td>
              <td className='tw-whitespace-nowrap tw-px-1 tw-text-sm tw-text-ithaca-white-60 md:tw-text-base'>
                {isTransactionInProgress ? (
                  <Loader />
                ) : (
                  formatNumberByCurrency(Number(walletBalance), "string", currency as Currency)
                )}
              </td>
              <td className='tw-whitespace-nowrap tw-px-1 tw-text-sm tw-text-white md:tw-text-base '>
                {isTransactionInProgress ? (
                  <Loader />
                ) : (
                  formatNumberByCurrency(Number(fundLockValue), "string", currency as Currency)
                )}
              </td>
              <td className='tw-whitespace-nowrap tw-px-1 tw-text-sm tw-text-white md:tw-text-base'>
                <PositiveNegativeLabel value={orderValue} currency={currency} />
              </td>
              <td className='tw-whitespace-nowrap tw-px-1 tw-text-sm tw-text-white md:tw-text-base'>
                <PositiveNegativeLabel value={positionCollateralRequirement} currency={currency} />
              </td>
              <td
                className={classNames("tw-whitespace-nowrap tw-px-0 tw-py-2 tw-text-white", {
                  "tw-flex": !desktopBreakpoint,
                  "tw-hidden": desktopBreakpoint,
                })}
              >
                <div className='tw-flex tw-flex-1 tw-justify-end tw-gap-2'>
                  <Button
                    title={`Click to withdraw ${currency}`}
                    size='sm'
                    variant='secondary'
                    onClick={() => withdraw(currency)}
                  >
                    Withdraw
                  </Button>
                  <Button
                    title={`Click to deposit ${currency}`}
                    variant='primary'
                    size='sm'
                    role='button'
                    onClick={() => deposit(currency)}
                  >
                    Deposit
                  </Button>
                  {!isProd && (
                    <Button
                      title={`Click to faucet ${currency}`}
                      size='sm'
                      variant='primary'
                      onClick={() => faucet(currency)}
                    >
                      Faucet
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default TableCollateral;
