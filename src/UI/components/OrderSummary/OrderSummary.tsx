import { FetchBalanceResult } from "@wagmi/core";
// Components
import LogoEth from "@/UI/components/Icons/LogoEth";

import ConnectWalletButton from "@/UI/components/ConnectWalletButton";
import CurrencyDisplay from "@/UI/components/CurrencyDisplay/CurrencyDisplay";
import LogoUsdc from "@/UI/components/Icons/LogoUsdc";

// Layouts
import { TABLE_COLLATERAL_SUMMARY } from "@/UI/constants/tableCollateral";
import { useDevice } from "@/UI/hooks/useDevice";
import Flex from "@/UI/layouts/Flex/Flex";
import Panel from "@/UI/layouts/Panel/Panel";
import { useAppStore } from "@/UI/lib/zustand/store";
import { formatNumberByCurrency } from "@/UI/utils/Numbers";
import { getActiveChain } from "@/UI/utils/RainbowKitHelpers";
import { OrderSummaryType } from "@/types/orderSummary";
import { ReactNode, useCallback, useState } from "react";
import { useAccount, useBalance, useBlockNumber } from "wagmi";
import { HideData } from "../HideData";
import styles from "./OrderSummary.module.scss";
import SubmitButton from "./SubmitButton";
import { Currency } from "@/utils/types";
import { calculateTotalPremium } from "./helpers";

// Types
type OrderSummaryProps = {
  orderSummary: OrderSummaryType | undefined;
  submitAuction: () => void;
  asContainer?: boolean;
  onlyProtiftableOrders?: boolean;
  isSubmitButtonDisabled?: boolean;
};

const Container = ({ asContainer, children }: { asContainer: boolean; children: ReactNode }) => {
  const device = useDevice();
  return asContainer ? (
    <Panel margin={`'br-20 p-20 ${device === "desktop" ? "" : "mt-16"}`}>{children}</Panel>
  ) : (
    <>{children}</>
  );
};

const OrderSummary = ({
  orderSummary,
  onlyProtiftableOrders = false,
  isSubmitButtonDisabled = false,
  submitAuction,
  asContainer = true,
}: OrderSummaryProps) => {
  const { isAuthenticated, ithacaSDK, systemInfo, isLocationRestricted } = useAppStore();

  const limit = orderSummary?.order.totalNetPrice;
  const collatarelETH = orderSummary?.orderLock?.underlierAmount;
  const collatarelUSDC = orderSummary && orderSummary.orderLock?.numeraireAmount;
  const premium = orderSummary?.order.totalNetPrice;
  const fee = orderSummary?.orderFees?.numeraireAmount;
  const { address } = useAccount();
  // const [submitTriggered, setTriggerSubmit] = useState(false);
  const [collateralSummary, setCollateralSummary] = useState(TABLE_COLLATERAL_SUMMARY);

  const device = useDevice();

  const handleSuccess = (item: Currency) => (balance: FetchBalanceResult) => {
    setCollateralSummary(summary => ({
      ...summary,
      [item]: { ...summary[item], walletBalance: balance.formatted },
    }));
  };

  useBalance({
    address,
    token: systemInfo.tokenAddress["WETH"] as `0x${string}`,
    watch: true,
    onSuccess: handleSuccess("WETH"),
  });

  useBalance({
    address,
    token: systemInfo.tokenAddress["USDC"] as `0x${string}`,
    watch: true,
    onSuccess: handleSuccess("USDC"),
  });

  const fetchFundlockState = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const fundlockState = await ithacaSDK.client.fundLockState();
      const fundlockWETH = fundlockState[fundlockState.findIndex(fundlock => fundlock.currency === "WETH")];
      const fundlockUSDC = fundlockState[fundlockState.findIndex(fundlock => fundlock.currency === "USDC")];
      setCollateralSummary(summary => ({
        ["WETH"]: { ...summary["WETH"], ...fundlockWETH },
        ["USDC"]: { ...summary["USDC"], ...fundlockUSDC },
      }));
    } catch (e) {
      console.log(e);
    }
  }, [ithacaSDK, isAuthenticated]);

  useBlockNumber({
    chainId: getActiveChain().id,
    enabled: isAuthenticated,
    watch: true,
    onBlock: fetchFundlockState,
  });

  return (
    <div className='tw-flex tw-flex-1 tw-flex-col tw-justify-end'>
      <HideData title='Location Restricted' visible={isLocationRestricted}>
        <Container asContainer={asContainer}>
          {!asContainer && <h3 className={`mb-12 mt-10 ${device !== "desktop" && "full-width"}`}>Order Summary</h3>}
          <Flex
            direction={device === "desktop" ? "row-space-between" : "column-space-between"}
            gap={device !== "desktop" ? "gap-16" : "gap-6"}
          >
            {asContainer && <h3 className={`mb-0 ${device !== "desktop" && "full-width"}`}>Order Summary</h3>}
            <div className={styles.orderWrapper}>
              <Flex direction={device === "desktop" ? "column" : "row-space-between"} gap='gap-6'>
                <h5>Order Limit</h5>
                <CurrencyDisplay
                  amount={formatNumberByCurrency(Math.abs(Number(limit)), "string", "USDC")}
                  symbol={<LogoUsdc />}
                  currency='USDC'
                />
              </Flex>
            </div>
            <Flex direction={device === "desktop" ? "column" : "row-space-between-start"} gap='gap-6'>
              <h5>Collateral Requirement</h5>
              <div>
                <Flex direction={device === "desktop" ? "row" : "column"} gap='gap-10'>
                  <CurrencyDisplay
                    amount={formatNumberByCurrency(Math.max(Number(collatarelETH), 0), "string", "WETH")}
                    symbol={<LogoEth />}
                    currency='WETH'
                  />
                  <CurrencyDisplay
                    amount={formatNumberByCurrency(Math.max(Number(collatarelUSDC), 0), "string", "USDC")}
                    symbol={<LogoUsdc />}
                    currency='USDC'
                  />
                </Flex>
              </div>
            </Flex>
            <div className={styles.platformWrapper}>
              <Flex direction={device === "desktop" ? "column" : "row-space-between"} gap='gap-6'>
                <h5 className=''>Platform Fee</h5>
                <CurrencyDisplay
                  amount={formatNumberByCurrency(Number(fee), "string", "USDC")}
                  symbol={<LogoUsdc />}
                  currency='USDC'
                />
              </Flex>
            </div>
            <Flex direction={device === "desktop" ? "column" : "row-space-between"} gap='gap-6'>
              <h5 className='color-white'>Total Premium</h5>
              <CurrencyDisplay
                amount={premium ? calculateTotalPremium(premium, fee) : "-"}
                symbol={<LogoUsdc />}
                currency='USDC'
              />
            </Flex>
            <Flex direction='column'>
              <ConnectWalletButton>
                {({ connected, openConnectModal }) => {
                  return (
                    <SubmitButton
                      isSubmitButtonDisabled={isSubmitButtonDisabled}
                      onlyProtiftableOrders={onlyProtiftableOrders}
                      submitAuction={submitAuction}
                      openConnectModal={openConnectModal}
                      connected={connected}
                      orderSummary={orderSummary}
                      collateralSummary={collateralSummary}
                    />
                  );
                }}
              </ConnectWalletButton>
            </Flex>
          </Flex>
        </Container>
      </HideData>
    </div>
  );
};

export default OrderSummary;
