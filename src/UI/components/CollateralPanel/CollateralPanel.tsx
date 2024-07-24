// Packages
import { useAccount, useBalance, useBlockNumber, usePublicClient, useWalletClient } from "wagmi";
import { FetchBalanceResult } from "@wagmi/core";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { parseAbi, parseUnits } from "viem";
import { FundLockState, LockedCollateralResponse } from "@ithaca-finance/sdk";
// Constants
import { TABLE_COLLATERAL_SUMMARY } from "@/UI/constants/tableCollateral";
import { DESKTOP_BREAKPOINT } from "@/UI/constants/breakpoints";

// Store
import { useAppStore } from "@/UI/lib/zustand/store";

// Hooks
import useMediaQuery from "@/UI/hooks/useMediaQuery";
import useToast from "@/UI/hooks/useToast";

// Components
import Button from "@/UI/components/Button/Button";
import TableCollateral from "@/UI/components/TableCollateral/TableCollateral";
import DisconnectedWallet from "@/UI/components/DisconnectedWallet/DisconnectedWallet";
import Toast from "@/UI/components/Toast/Toast";
import ManageFundsModal from "./ManageFundsModal";
import ButtonDropdown from "../DropdownMenu/ButtonDropdown";
// Layouts
import Flex from "@/UI/layouts/Flex/Flex";
import Panel from "@/UI/layouts/Panel/Panel";
import { DropDownOption } from "../DropdownMenu/DropdownMenu";
import { isProd } from "@/UI/utils/RainbowKit";
import { getActiveChain } from "@/UI/utils/RainbowKitHelpers";
import { Currency } from "@/utils/types";

type CollateralPanelProps = {
  setDashboardTab: Dispatch<SetStateAction<string>>;
};

const CollateralPanel = ({ setDashboardTab }: CollateralPanelProps) => {
  const { systemInfo, ithacaSDK, isAuthenticated } = useAppStore();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const desktopBreakpoint = useMediaQuery(DESKTOP_BREAKPOINT);
  const [collateralSummary, setCollateralSummary] = useState(TABLE_COLLATERAL_SUMMARY);
  const [selectedCurrency, setSelectedCurrency] = useState<{ name: string; value: `0x${string}` }>();
  const [modalTab, setModalTab] = useState<"deposit" | "withdraw">();
  const { toastList, position, showToast } = useToast();

  const handleSuccess = (item: Currency) => (balance: FetchBalanceResult) => {
    setCollateralSummary(summary => ({
      ...summary,
      [item]: { ...summary[item], walletBalance: balance.formatted },
    }));
  };

  useBalance({
    address,
    chainId: getActiveChain().id,
    cacheTime: 10_000,
    token: systemInfo.tokenAddress["WETH"] as `0x${string}`,
    watch: true,
    onSuccess: handleSuccess("WETH"),
  });

  useBalance({
    address,
    chainId: getActiveChain().id,
    cacheTime: 10_000,
    token: systemInfo.tokenAddress["USDC"] as `0x${string}`,
    watch: true,
    onSuccess: handleSuccess("USDC"),
  });

  const setFetchingBalance = (fundlockUSDC: FundLockState, fundlockWETH: FundLockState) => {
    const updateCollateralSummary = (currency: Currency, fundlock: FundLockState) => {
      const fundlockValue = fundlock?.fundLockValue ?? 0;
      const hasChanged = fundlockValue !== collateralSummary[currency]?.fundLockValue;

      if (hasChanged) {
        setCollateralSummary(summary => ({
          ...summary,
          [currency]: { ...summary[currency], isTransactionInProgress: false },
        }));
      }
    };

    updateCollateralSummary("WETH", fundlockWETH);
    updateCollateralSummary("USDC", fundlockUSDC);
  };

  const sumLockedCollateral = (lockups: LockedCollateralResponse) => {
    return Object.values(lockups)
      .flat()
      .reduce(
        (acc, lockup) => {
          acc.totalUnderlierAmount += lockup.locked.underlierAmount;
          acc.totalNumeraireAmount += lockup.locked.numeraireAmount;
          return acc;
        },
        { totalUnderlierAmount: 0, totalNumeraireAmount: 0 }
      );
  };

  const fetchFundlockState = useCallback(async () => {
    const [lockedCollateral, fundlockState] = await Promise.all([
      ithacaSDK.client.getLockedCollateral(),
      ithacaSDK.client.fundLockState(),
    ]);

    const fundlockWETH = fundlockState[fundlockState.findIndex(fundlock => fundlock.currency === "WETH")];
    const fundlockUSDC = fundlockState[fundlockState.findIndex(fundlock => fundlock.currency === "USDC")];
    const lockedCollateralData = sumLockedCollateral(lockedCollateral);
    setFetchingBalance(fundlockUSDC, fundlockWETH);
    setCollateralSummary(summary => ({
      ["WETH"]: {
        ...summary["WETH"],
        ...fundlockWETH,
        positionCollateralRequirement: lockedCollateralData.totalUnderlierAmount,
      },
      ["USDC"]: {
        ...summary["USDC"],
        ...fundlockUSDC,
        positionCollateralRequirement: lockedCollateralData.totalNumeraireAmount,
      },
    }));
  }, [ithacaSDK, collateralSummary]);

  useBlockNumber({
    chainId: getActiveChain().id,
    enabled: isAuthenticated,
    watch: true,
    onBlock: fetchFundlockState,
  });

  const getFaucet = async (currency: string) => {
    if (!walletClient) return;
    try {
      const hash = await walletClient.writeContract({
        address: systemInfo.tokenAddress[currency] as `0x${string}`,
        abi: parseAbi(["function mint(address to, uint256 amount) external"]),
        functionName: "mint",
        args: [walletClient.account.address, parseUnits("5000", systemInfo.tokenDecimals[currency])],
      });
      await publicClient.waitForTransactionReceipt({ hash });
    } catch (error) {
      showToast(
        {
          id: Math.floor(Math.random() * 1000),
          title: "Faucet Failed",
          message: "Faucet Failed, please try again.",
          type: "error",
        },
        "top-right"
      );
      console.error("Failed to claim faucet", error);
    }
  };

  const showModal = (type: "deposit" | "withdraw") => {
    setModalTab(type);
    setSelectedCurrency({
      name: Object.keys(collateralSummary)[0],
      value: systemInfo.tokenAddress[Object.keys(collateralSummary)[0]],
    });
  };

  const facuetChange = (value: string, selectedOption: DropDownOption) => {
    getFaucet(selectedOption.value);
  };

  const handleFetchingBalance = (status: boolean) => {
    if (selectedCurrency?.name) {
      const item = selectedCurrency.name;
      setCollateralSummary(summary => ({
        ...summary,
        [item]: { ...summary[item], isTransactionInProgress: !status },
      }));
    }
  };

  return (
    <>
      <Panel margin='p-desktop-30 p-mobile-16 p-16'>
        <h3 className='tw-text-base'>Collateral</h3>
        <Toast toastList={toastList} position={position} />
        <TableCollateral
          collateralSummary={collateralSummary}
          deposit={(currency: string) => {
            setModalTab("deposit");
            setSelectedCurrency({ name: currency, value: systemInfo.tokenAddress[currency] });
          }}
          withdraw={(currency: string) => {
            setModalTab("withdraw");
            setSelectedCurrency({ name: currency, value: systemInfo.tokenAddress[currency] });
          }}
          faucet={currency => getFaucet(currency)}
        />
        {desktopBreakpoint && isAuthenticated && (
          <Flex direction='row-center-nowrap' gap='gap-8' margin='mt-16'>
            <Button
              title='Click to withdraw'
              size='sm'
              variant='secondary'
              onClick={() => showModal("withdraw")}
              className='full-width'
            >
              Withdraw
            </Button>
            <Button
              title='Click to deposit'
              variant='primary'
              size='sm'
              role='button'
              onClick={() => showModal("deposit")}
              className='full-width'
            >
              Deposit
            </Button>

            {!isProd && (
              <ButtonDropdown
                label='Faucet'
                onChange={facuetChange}
                className='full-width'
                options={[
                  {
                    name: "WETH",
                    value: "WETH",
                  },
                  {
                    name: "USDC",
                    value: "USDC",
                  },
                ]}
              />
            )}
          </Flex>
        )}
        {!address && <DisconnectedWallet />}
      </Panel>
      <ManageFundsModal
        setIsFetchingBalanceEnabled={handleFetchingBalance}
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
        collateralSummary={collateralSummary}
        modalTab={modalTab}
        setModalTab={setModalTab}
        setDashboardTab={setDashboardTab}
      />
    </>
  );
};

export default CollateralPanel;
