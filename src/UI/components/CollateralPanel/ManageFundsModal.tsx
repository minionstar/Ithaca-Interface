// Packages
import dynamic from "next/dynamic";
import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { SwitchChainErrorType, formatEther, formatUnits, parseUnits } from "viem";
import { useAccount, useBalance, useNetwork, usePublicClient, useWalletClient } from "wagmi";
import { GetRouteResponse } from "@ithaca-finance/sdk";

// Constants
import { TableCollateralSummary } from "@/UI/constants/tableCollateral";
import { MODAL_TABS } from "@/UI/constants/tabs";
import { HOW_MANY_MINUTES_AFTER_DEPOSIT_CAN_RELEASE } from "../TableFundLock/SIngleRow";

// Store
import { useAppStore, usePersistedAppStore } from "@/UI/lib/zustand/store";

// Utils
import { getNumberValue } from "@/UI/utils/Numbers";
import { Currency } from "@/utils/types";
import mixPanel from "@/services/mixpanel";

// Icons
import LogoArbitrum from "../Icons/LogoArbitrum";

// Components
import Balance from "@/UI/components/Balance/Balance";
import Button from "@/UI/components/Button/Button";
import DropdownMenu from "@/UI/components/DropdownMenu/DropdownMenu";
import Tabs from "@/UI/components/Tabs/Tabs";
import Input from "@/UI/components/Input/Input";
import Loader from "../Loader/Loader";
import { getActiveChain } from "@/UI/utils/RainbowKitHelpers";
import Toast from "../Toast/Toast";
import useToast from "@/UI/hooks/useToast";
import { TUTORIAL_STEPS, TutorialSteps } from "@/UI/constants/tutorialsteps";
// Styles
import styles from "./ManageFundsModal.module.scss";

import TutorialPopover from "../TutorialPopover/TutorialPopover";
import { OnboardingContext } from "@/UI/providers/onboarding-provider";

import { isProd } from "@/UI/utils/RainbowKit";

const Modal = dynamic(() => import("@/UI/components/Modal/Modal"), {
  ssr: false,
});

interface ManageFundsModalProps {
  modalTab: "deposit" | "withdraw" | undefined;
  selectedCurrency: { name: string; value: `0x${string}` } | undefined;
  setSelectedCurrency: (currency: { name: string; value: `0x${string}` } | undefined) => void;
  collateralSummary: TableCollateralSummary;
  displayModalTypeTabs?: boolean;
  setIsFetchingBalanceEnabled?: (item: boolean) => void;
  setModalTab?: Dispatch<SetStateAction<"deposit" | "withdraw" | undefined>>;
  setDashboardTab?: Dispatch<SetStateAction<string>>;
}

const ManageFundsModal = (props: ManageFundsModalProps) => {
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const { chain, chains } = useNetwork();
  const { data: walletClient } = useWalletClient();
  const { systemInfo, ithacaSDK, axelarSupportedTokens, fetchAxelarSupportedTokens, addCrossChainTransaction } =
    useAppStore();

  const { currentStep, updateStep, isTutorialDisabled, disableTutorial } = useContext(OnboardingContext);
  const { toastList, showToast } = useToast();
  const {
    displayModalTypeTabs = true,
    setIsFetchingBalanceEnabled,
    modalTab,
    setModalTab,
    selectedCurrency,
    setSelectedCurrency,
    collateralSummary,
    setDashboardTab,
  } = props;
  const [modalAmount, setModalAmount] = useState("");
  const [isTransactionInProgress, setIsTransactionInProgress] = useState(false);
  const [selectedChain, setSelectedChain] = useState({
    name: getActiveChain().name,
    value: `${getActiveChain().id}`,
    nativeCurrency: getActiveChain().nativeCurrency,
  });
  const [sourceChainCurrency, setSourceChainCurrency] = useState<{
    name: string;
    value: `0x${string}`;
    decimals: number;
  }>();
  const [sourceChainAmount, setSourceChainAmount] = useState("");
  const [estimationInProgress, setEstimationInProgress] = useState(false);
  const [crossChainTxnRoute, setCrossChainTxnRoute] = useState<GetRouteResponse["route"]>();
  const [isAxelarTokensLoading, setIsAxelarTokensLoading] = useState(false);
  const estimationTimeoutRef = useRef<NodeJS.Timeout>();

  const { data: sourceChainCurrencyBalance } = useBalance({
    address,
    chainId: Number(selectedChain.value),
    cacheTime: 10_000,
    token:
      sourceChainCurrency?.value === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
        ? undefined
        : sourceChainCurrency?.value,
    watch: true,
  });

  const handleFetchingBalance = (status: boolean) => {
    if (setIsFetchingBalanceEnabled) {
      setIsFetchingBalanceEnabled(status);
    }
  };

  const handleChangeModalTab = (tab: "deposit" | "withdraw") => {
    if (setModalTab) {
      setModalTab(tab);
      setSelectedChain({
        name: getActiveChain().name,
        value: `${getActiveChain().id}`,
        nativeCurrency: getActiveChain().nativeCurrency,
      });
    } else {
      console.warn("Set modal tab not defined");
    }
  };

  const switchNetwork = async () => {
    try {
      setIsTransactionInProgress(true);
      await walletClient?.switchChain({ id: Number(selectedChain.value) });
    } catch (error) {
      showToast(
        {
          id: Math.floor(Math.random() * 1000),
          title: "Failed to switch network",
          message: (error as SwitchChainErrorType).message,
          type: "error",
        },
        "top-right"
      );
      console.error(error);
    } finally {
      setIsTransactionInProgress(false);
    }
  };

  const deposit = async () => {
    if (!selectedCurrency) return;
    try {
      setIsTransactionInProgress(true);
      if (Number(selectedChain.value) === getActiveChain().id) {
        const amount = parseUnits(modalAmount, systemInfo.tokenDecimals[selectedCurrency.name]);
        const hash = await ithacaSDK.fundlock.deposit(selectedCurrency.value, amount);
        await publicClient.waitForTransactionReceipt({ hash });
        showToast(
          {
            id: Math.floor(Math.random() * 1000),
            title: "Deposit successful",
            message: `${modalAmount} ${selectedCurrency.name} deposited to fundlock`,
            type: "success",
          },
          "top-right"
        );
        // POINTS_EVENTS: Deposit - service connected
        mixPanel.track("Deposit", {
          amount: modalAmount,
          currency: selectedCurrency.name,
        });
      } else {
        if (!walletClient || !crossChainTxnRoute) return;
        const hash = await ithacaSDK.fundlock.crossChainDeposit(walletClient, crossChainTxnRoute);
        await publicClient.waitForTransactionReceipt({ hash });
        try {
          const txnStatus = await ithacaSDK.fundlock.getCrossChainTxStatus(hash);
          addCrossChainTransaction({ route: crossChainTxnRoute, status: txnStatus, timestamp: Date.now() });
          showToast(
            {
              id: Math.floor(Math.random() * 1000),
              title: "Cross-chain deposit successful",
              message: `${modalAmount} ${selectedCurrency.name} deposited to fundlock`,
              type: "success",
            },
            "top-right"
          );
          // POINTS_EVENTS: Cross-chain deposit - service connected
          mixPanel.track("Cross-chain deposit", {
            amount: modalAmount,
            currency: selectedCurrency.name,
          });
        } catch (error) {
          setTimeout(async () => {
            const txnStatus = await ithacaSDK.fundlock.getCrossChainTxStatus(hash);
            addCrossChainTransaction({ route: crossChainTxnRoute, status: txnStatus, timestamp: Date.now() });
            showToast(
              {
                id: Math.floor(Math.random() * 1000),
                title: "Cross-chain deposit successful",
                message: `${modalAmount} ${selectedCurrency.name} deposited to fundlock`,
                type: "success",
              },
              "top-right"
            );
            // POINTS_EVENTS: Cross-chain deposit - service connected
            mixPanel.track("Cross-chain deposit", {
              amount: modalAmount,
              currency: selectedCurrency.name,
            });
          }, 2_000);
        }
      }
      handleFetchingBalance(false);
      handleCloseModal();
    } catch (error) {
      handleFetchingBalance(true);
      showToast(
        {
          id: Math.floor(Math.random() * 1000),
          title: "Deposit unsuccessful",
          message: `Failed to deposit, please try again.`,
          type: "error",
        },
        "top-right"
      );
      console.error("Failed to deposit", error);
    } finally {
      setIsTransactionInProgress(false);
    }
  };

  const withdraw = async () => {
    if (!selectedCurrency) return;
    const amount = parseUnits(modalAmount, systemInfo.tokenDecimals[selectedCurrency.name]);
    try {
      setIsTransactionInProgress(true);
      await ithacaSDK.fundlock.withdraw(selectedCurrency.value, amount);
      handleFetchingBalance(false);
      showToast(
        {
          id: Math.floor(Math.random() * 1000),
          title: "Withdraw successful",
          message: `You can release funds in ${HOW_MANY_MINUTES_AFTER_DEPOSIT_CAN_RELEASE} Mins`,
          type: "success",
        },
        "top-right"
      );
      // POINTS_EVENTS: Withdraw - service connected
      mixPanel.track("Cross-chain deposit", {
        amount: modalAmount,
        currency: selectedCurrency.name,
      });
      setDashboardTab?.("fundLockHistory");
      // Don't close modal after finishing deposit
      // handleCloseModal();
    } catch (error) {
      handleFetchingBalance(true);
      showToast(
        {
          id: Math.floor(Math.random() * 1000),
          title: "Withdrawal unsuccessful",
          message: `Failed to withdraw, please try again.`,
          type: "error",
        },
        "top-right"
      );
      console.error("Failed to withdraw", error);
    } finally {
      setIsTransactionInProgress(false);
    }
  };

  const testWithdraw = () => {
    // if(currentStep !== undefined){
    //   if (TUTORIAL_STEPS[currentStep].nextStep) {
    //     updateStep && updateStep(TUTORIAL_STEPS[currentStep].nextStep);
    //   } else {
    //     disableTutorial && disableTutorial();
    //   }
    // if(updateStep)
    //   updateStep(TutorialSteps.WITHDRAW_TRANSACTION_HISTORY)
    setDashboardTab?.("fundLockHistory");
    // }
  };
  const handleSubmit = async () => {
    if (chain?.id !== Number(selectedChain.value)) {
      await switchNetwork();
      return;
    }
    if (modalTab === "deposit") {
      await deposit();
    } else {
      // await withdraw();
      testWithdraw();
    }
  };

  const modalFooterText = useMemo(() => {
    if (isTransactionInProgress) {
      return <Loader />;
    }
    if (Number(selectedChain.value) !== chain?.id) {
      return "Switch network";
    }
    if (Number(selectedChain.value) !== getActiveChain().id) {
      return "Deposit Cross-Chain";
    }
    return modalTab === "deposit" ? "Deposit" : "Withdraw";
  }, [chain, isTransactionInProgress, modalTab, selectedChain.value]);

  const handleCloseModal = () => {
    updateStep?.(undefined);
    setModalTab?.(undefined);
    setSourceChainAmount("");
    setModalAmount("");
    setCrossChainTxnRoute(undefined);
    setSelectedChain({
      name: getActiveChain().name,
      value: `${getActiveChain().id}`,
      nativeCurrency: getActiveChain().nativeCurrency,
    });
    setSourceChainCurrency(undefined);
    setSelectedCurrency(undefined);
  };

  const handleSourceChainAmountChange = async (value: string) => {
    const amount = getNumberValue(value);
    setSourceChainAmount(amount);
    if (!sourceChainCurrency || !selectedCurrency) return;
    clearTimeout(estimationTimeoutRef.current);
    const estimationTimeout = setTimeout(() => {
      estimateCrossChainTxn(sourceChainCurrency, selectedCurrency, amount);
    }, 500);
    estimationTimeoutRef.current = estimationTimeout;
  };

  const estimateCrossChainTxn = useCallback(
    async (
      fromToken: {
        name: string;
        value: `0x${string}`;
        decimals: number;
      },
      toToken: {
        name: string;
        value: `0x${string}`;
      },
      fromAmount: string
    ) => {
      try {
        setEstimationInProgress(true);
        const route = await ithacaSDK.fundlock.getCrossChainDepositRoute(
          Number(selectedChain.value),
          fromToken.value,
          toToken.value,
          parseUnits(fromAmount, fromToken.decimals)
        );
        setCrossChainTxnRoute(route);
        setModalAmount(formatUnits(BigInt(route.estimate.toAmount), systemInfo.tokenDecimals[toToken.name]));
      } catch (error) {
        console.error("Failed to estimate cross chain deposit", error);
      } finally {
        setEstimationInProgress(false);
      }
    },
    [ithacaSDK, selectedChain, systemInfo]
  );

  useEffect(() => {
    if (!crossChainTxnRoute || isTransactionInProgress) return;
    if (!sourceChainCurrency || !selectedCurrency || !sourceChainAmount) return;

    const interval = setInterval(() => {
      estimateCrossChainTxn(sourceChainCurrency, selectedCurrency, sourceChainAmount);
    }, 30_000);

    return () => clearInterval(interval);
  }, [
    crossChainTxnRoute,
    estimateCrossChainTxn,
    isTransactionInProgress,
    selectedCurrency,
    sourceChainAmount,
    sourceChainCurrency,
  ]);
  useEffect(() => {
    if (modalTab === "deposit") {
      // Logic to decide which initial tutorial step to show based on users balance
      if (!isTutorialDisabled && selectedCurrency && updateStep) {
        // Logic to hide if a user already has fundlockValue
        if (collateralSummary[selectedCurrency?.name].fundLockValue) {
          updateStep(undefined);
        } else if (Number(collateralSummary[selectedCurrency.name]?.walletBalance || 0)) {
          updateStep(TutorialSteps.DEPOSIT_WITH_BALANCE_CHAIN);
        } else if (selectedCurrency?.name === "WETH") {
          updateStep(TutorialSteps.DEPOSIT_WITHOUT_BALANCE_WETH);
        } else {
          updateStep(TutorialSteps.DEPOSIT_WITHOUT_BALANCE_USDC);
        }
      }
    } else if (modalTab === "withdraw") {
      if (!isTutorialDisabled && selectedCurrency && updateStep) {
        updateStep(TutorialSteps.WITHDRAW_FUNDS);
      }
    } else {
      if (currentStep === TutorialSteps.WITHDRAW_FUNDS && updateStep) {
        updateStep(TutorialSteps.WITHDRAW_TRANSACTION_HISTORY);
        return;
      } else {
        updateStep?.(undefined);
      }
    }
  }, [modalTab]);
  useEffect(() => {
    console.log("modaltab", modalTab);
    if (modalTab === "withdraw") return;
    if (modalTab === "deposit" && !isTutorialDisabled && updateStep && selectedCurrency) {
      // If a user changes token need to show correct step based on their wallet balance
      if (currentStep === TutorialSteps.DEPOSIT_WITHOUT_BALANCE_USDC) {
        if (collateralSummary[selectedCurrency?.name].fundLockValue) {
          updateStep(undefined);
        } else if (Number(collateralSummary[selectedCurrency?.name]?.walletBalance || 0)) {
          updateStep(TutorialSteps.DEPOSIT_WITH_BALANCE_CHAIN);
        } else if (selectedCurrency?.name === "WETH") {
          updateStep(TutorialSteps.DEPOSIT_WITHOUT_BALANCE_WETH);
        } else {
          updateStep(TutorialSteps.DEPOSIT_WITHOUT_BALANCE_USDC);
        }
      } else if (currentStep === TutorialSteps.DEPOSIT_WITH_BALANCE_TOKEN_USDC) {
        if (selectedCurrency?.name === "WETH" && Number(collateralSummary[selectedCurrency?.name].walletBalance || 0)) {
          updateStep(TutorialSteps.DEPOSIT_WITH_BALANCE_TOKEN_WETH);
        } else {
          updateStep(TutorialSteps.DEPOSIT_WITH_BALANCE_TOKEN_USDC);
        }
      }
    } else {
      updateStep?.(undefined);
    }
  }, [currentStep, collateralSummary["USDC"]?.walletBalance, collateralSummary["WETH"]?.walletBalance]);

  if (!modalTab) return null;
  return (
    <>
      <Modal
        className='p-16'
        title={Number(selectedChain.value) === getActiveChain().id ? "Manage Funds" : "Manage Funds Cross-Chain"}
        isOpen={!!modalTab}
        onCloseModal={handleCloseModal}
        isLoading={isTransactionInProgress}
        hideFooter={true}
      >
        {displayModalTypeTabs && (
          <Tabs
            tabs={MODAL_TABS}
            className='mb-20'
            activeTab={modalTab}
            onChange={tabId => handleChangeModalTab(tabId as "deposit" | "withdraw")}
          />
        )}
        {modalTab === "deposit" && Number(selectedChain.value) !== getActiveChain().id && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div className={styles.inputContainer}>
              <div style={{ flex: 1.7 }}>
                <DropdownMenu
                  hasDropdown={modalTab === "deposit"}
                  className='full-width'
                  options={chains.map(({ id, name, nativeCurrency }) => ({ name, value: `${id}`, nativeCurrency }))}
                  value={selectedChain}
                  onChange={async (_, option) => {
                    setSourceChainCurrency(undefined);
                    setSelectedChain(option);
                    setIsAxelarTokensLoading(true);
                    await fetchAxelarSupportedTokens(Number(option.value));
                    setIsAxelarTokensLoading(false);
                  }}
                />
              </div>
              <TutorialPopover
                isOpen={currentStep === TutorialSteps.DEPOSIT_WITHOUT_BALANCE_DEPOSIT_TOKEN}
                align='end'
                side='top'
              >
                <div style={{ flex: 1.2 }}>
                  <DropdownMenu
                    isLoading={isAxelarTokensLoading}
                    className='full-width'
                    options={axelarSupportedTokens.map(({ address, decimals, symbol }) => ({
                      name: symbol,
                      value: address,
                      decimals,
                    }))}
                    value={sourceChainCurrency}
                    onChange={(_, option) => {
                      if (!isTutorialDisabled && updateStep) {
                        updateStep(TutorialSteps.DEPOSIT_WITHOUT_BALANCE_CONVERTED_TOKEN);
                      }
                      console.log("test");
                      setSourceChainCurrency(option);
                    }}
                  />
                </div>
              </TutorialPopover>
              <div style={{ flex: 1 }}>
                <Input
                  className='full-width'
                  containerClassName='full-width'
                  value={sourceChainAmount}
                  onChange={({ target }) => handleSourceChainAmountChange(target.value)}
                />
              </div>
              <Button
                variant='secondary'
                size='sm'
                title='Select All Assets'
                onClick={() =>
                  sourceChainCurrencyBalance && handleSourceChainAmountChange(sourceChainCurrencyBalance.formatted)
                }
              >
                All
              </Button>
            </div>
            {sourceChainCurrency && (
              <div>
                <Balance
                  selectedCurrency={sourceChainCurrency.name as Currency}
                  estimatedFee={{
                    fee: formatEther(BigInt(crossChainTxnRoute?.transactionRequest.value || "0")),
                    nativeCurrency: selectedChain.nativeCurrency,
                    isLoading: estimationInProgress,
                  }}
                  balance={sourceChainCurrencyBalance?.formatted || "0"}
                  margin='mtb-20'
                />
              </div>
            )}
          </div>
        )}
        {modalTab === "withdraw" && Number(selectedChain.value) !== getActiveChain().id && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div className={styles.inputContainer}>
              <div style={{ flex: 1.7 }}>
                <DropdownMenu
                  hasDropdown={modalTab === "withdraw"}
                  className='full-width'
                  options={chains.map(({ id, name, nativeCurrency }) => ({ name, value: `${id}`, nativeCurrency }))}
                  value={selectedChain}
                  onChange={async (_, option) => {
                    setSourceChainCurrency(undefined);
                    setSelectedChain(option);
                    setIsAxelarTokensLoading(true);
                    await fetchAxelarSupportedTokens(Number(option.value));
                    setIsAxelarTokensLoading(false);
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Input
                  className='full-width'
                  containerClassName='full-width'
                  value={sourceChainAmount}
                  onChange={({ target }) => handleSourceChainAmountChange(target.value)}
                />
              </div>
              <Button
                variant='secondary'
                size='sm'
                title='Select All Assets'
                onClick={() =>
                  sourceChainCurrencyBalance && handleSourceChainAmountChange(sourceChainCurrencyBalance.formatted)
                }
              >
                All
              </Button>
            </div>
            {sourceChainCurrency && (
              <div>
                <Balance
                  selectedCurrency={sourceChainCurrency.name as Currency}
                  estimatedFee={{
                    fee: formatEther(BigInt(crossChainTxnRoute?.transactionRequest.value || "0")),
                    nativeCurrency: selectedChain.nativeCurrency,
                    isLoading: estimationInProgress,
                  }}
                  balance={sourceChainCurrencyBalance?.formatted || "0"}
                  margin='mtb-20'
                />
              </div>
            )}
          </div>
        )}
        {Number(selectedChain.value) !== getActiveChain().id && (
          <div style={{ marginTop: 20, marginBottom: 20 }}>
            <h4 className={styles.receiveTitle}>To Receive Approximately</h4>
          </div>
        )}
        <div className={styles.inputContainer}>
          <TutorialPopover
            isOpen={
              currentStep === TutorialSteps.DEPOSIT_WITH_BALANCE_CHAIN ||
              currentStep === TutorialSteps.DEPOSIT_WITHOUT_BALANCE_CHAIN
            }
            align='end'
            side='top'
          >
            <div style={{ flex: 1.7 }}>
              <DropdownMenu
                disabled={Number(selectedChain.value) !== getActiveChain().id}
                hasDropdown={Number(selectedChain.value) === getActiveChain().id}
                className='full-width'
                options={(isProd ? chains : [getActiveChain()]).map(({ id, name, nativeCurrency }) => ({
                  name,
                  value: `${id}`,
                  nativeCurrency,
                }))}
                value={{
                  name: getActiveChain().name,
                  value: `${getActiveChain().id}`,
                  nativeCurrency: getActiveChain().nativeCurrency,
                }}
                onChange={async (_, option) => {
                  if (
                    !isTutorialDisabled &&
                    updateStep &&
                    (currentStep === TutorialSteps.DEPOSIT_WITHOUT_BALANCE_CHAIN ||
                      currentStep === TutorialSteps.DEPOSIT_WITHOUT_BALANCE_USDC ||
                      currentStep === TutorialSteps.DEPOSIT_WITHOUT_BALANCE_WETH)
                  ) {
                    updateStep(TutorialSteps.DEPOSIT_WITHOUT_BALANCE_DEPOSIT_TOKEN);
                  }
                  setSelectedChain(option);
                  setIsAxelarTokensLoading(true);
                  await fetchAxelarSupportedTokens(Number(option.value));
                  setIsAxelarTokensLoading(false);
                }}
                iconStart={<LogoArbitrum />}
              />
            </div>
          </TutorialPopover>
          <TutorialPopover
            isOpen={
              currentStep === TutorialSteps.DEPOSIT_WITH_BALANCE_TOKEN_USDC ||
              currentStep === TutorialSteps.DEPOSIT_WITH_BALANCE_TOKEN_WETH ||
              currentStep === TutorialSteps.DEPOSIT_WITHOUT_BALANCE_CONVERTED_TOKEN
            }
            align='end'
            side={currentStep === TutorialSteps.DEPOSIT_WITHOUT_BALANCE_CONVERTED_TOKEN ? "bottom" : "top"}
          >
            <div style={{ flex: 1.2 }}>
              <DropdownMenu
                className='full-width'
                options={[
                  {
                    name: "WETH",
                    value: systemInfo.tokenAddress["WETH"],
                  },
                  {
                    name: "USDC",
                    value: systemInfo.tokenAddress["USDC"],
                  },
                ]}
                value={selectedCurrency}
                onChange={(_, option) => {
                  if (
                    !isTutorialDisabled &&
                    updateStep &&
                    (currentStep === TutorialSteps.DEPOSIT_WITHOUT_BALANCE_USDC ||
                      currentStep === TutorialSteps.DEPOSIT_WITHOUT_BALANCE_WETH)
                  ) {
                    updateStep(
                      currentStep === TutorialSteps.DEPOSIT_WITHOUT_BALANCE_USDC
                        ? TutorialSteps.DEPOSIT_WITHOUT_BALANCE_WETH
                        : TutorialSteps.DEPOSIT_WITHOUT_BALANCE_USDC
                    );
                  }
                  setSelectedCurrency(option);
                }}
                iconStart={selectedCurrency && collateralSummary[selectedCurrency.name].currencyLogo}
              />
            </div>
          </TutorialPopover>
          <TutorialPopover isOpen={currentStep === TutorialSteps.DEPOSIT_WITH_BALANCE_AMOUNT} align='end' side='top'>
            <div style={{ flex: 1 }}>
              <Input
                disabled={Number(selectedChain.value) !== getActiveChain().id}
                className='full-width'
                containerClassName='full-width'
                value={modalAmount}
                onChange={({ target }) => setModalAmount(getNumberValue(target.value))}
                isLoading={estimationInProgress}
              />
            </div>
          </TutorialPopover>
          {Number(selectedChain.value) === getActiveChain().id ? (
            <Button
              variant='secondary'
              size='sm'
              title='Select All Assets'
              onClick={() => {
                if (selectedCurrency) {
                  if (modalTab === "deposit") {
                    setModalAmount(collateralSummary[selectedCurrency.name].walletBalance);
                  } else {
                    setModalAmount(`${collateralSummary[selectedCurrency.name].fundLockValue}`);
                  }
                }
              }}
            >
              All
            </Button>
          ) : (
            <div style={{ flex: 0.35 }}></div>
          )}
        </div>
        {selectedCurrency && (
          <Balance
            selectedCurrency={selectedCurrency.name as Currency}
            fundLock={collateralSummary[selectedCurrency.name].fundLockValue}
            balance={collateralSummary[selectedCurrency.name].walletBalance}
            margin='mtb-20'
          />
        )}
        {currentStep === TutorialSteps.WITHDRAW_FUNDS && (
          <div className={styles.message}>{TUTORIAL_STEPS[currentStep].message}</div>
        )}
        {currentStep === TutorialSteps.WITHDRAW_FUNDS && (
          <div>
            <Button
              title='Click to deposit'
              variant='primary'
              size='sm'
              role='button'
              onClick={handleSubmit}
              className='full-width'
            >
              {modalFooterText}
            </Button>
          </div>
        )}
      </Modal>
      <Toast toastList={toastList} position='top-right' autoDelete={true} />
    </>
  );
};

export default ManageFundsModal;
