import { ReactElement } from "react";
import DepositUSDC from "@/assets/tutorial/deposit_usdc.png";
import DepositWETH from "@/assets/tutorial/deposit_weth.png";
import Image from "next/image";

export enum TutorialSteps {
  DEPOSIT_WITH_BALANCE_CHAIN = "DEPOSIT_WITH_BALANCE_CHAIN",
  DEPOSIT_WITH_BALANCE_TOKEN_WETH = "DEPOSIT_WITH_BALANCE_TOKEN_WETH",
  DEPOSIT_WITH_BALANCE_TOKEN_USDC = "DEPOSIT_WITH_BALANCE_TOKEN_USDC",
  DEPOSIT_WITH_BALANCE_AMOUNT = "DEPOSIT_WITH_BALANCE_AMOUNT",
  DEPOSIT_WITH_BALANCE_DEPOSIT_BUTTON = "DEPOSIT_WITH_BALANCE_DEPOSIT_BUTTON",
  DEPOSIT_WITHOUT_BALANCE_WETH = "DEPOSIT_WITHOUT_BALANCE_WETH",
  DEPOSIT_WITHOUT_BALANCE_USDC = "DEPOSIT_WITHOUT_BALANCE_USDC",
  DEPOSIT_WITHOUT_BALANCE_CHAIN = "DEPOSIT_WITHOUT_BALANCE_CHAIN",
  DEPOSIT_WITHOUT_BALANCE_DEPOSIT_TOKEN = "DEPOSIT_WITHOUT_BALANCE_DEPOSIT_TOKEN",
  DEPOSIT_WITHOUT_BALANCE_CONVERTED_TOKEN = "DEPOSIT_WITHOUT_BALANCE_CONVERTED_TOKEN",
  DEPOSIT_WITHOUT_BALANCE_DEPOSIT_BUTTON = "DEPOSIT_WITHOUT_BALANCE_DEPOSIT_BUTTON",
  WITHDRAW_FUNDS = "WITHDRAW_FUNDS",
  WITHDRAW_TRANSACTION_HISTORY = "WITHDRAW_TRANSACTION_HISTORY",
  WITHDRAW_RELEASE_FUNDS = "WITHDRAW_RELEASE_FUNDS",
}

type TutorialStep = {
  message: string | ReactElement;
  title: string;
  isLarge?: boolean;
  nextStep?: TutorialSteps;
  previousStep?: TutorialSteps;
};

// Each step has a default flow, the logic to change the flow lives inside the app itself.
// If you want to add a new step just add here and then wrap the component where you want to show the popover
// Examples can be found in ManageFundsModal.tsx for how to display and also how to handle changing step depending on user actions
export const TUTORIAL_STEPS: Record<TutorialSteps, TutorialStep> = {
  [TutorialSteps.DEPOSIT_WITH_BALANCE_CHAIN]: {
    // [TutorialSteps.DEPOSIT_WITHOUT_BALANCE_USDC]: {
    nextStep: TutorialSteps.DEPOSIT_WITH_BALANCE_TOKEN_USDC,
    message:
      "Ithaca runs on Arbitrum and requires WETH and USDC (not USDC.e) for collateral. You can deposit these directly or you can deposit different tokens from other support blockchains.",
    title: "Deposit Funds Directly or Cross Chain",
  },
  [TutorialSteps.DEPOSIT_WITH_BALANCE_TOKEN_USDC]: {
    nextStep: TutorialSteps.DEPOSIT_WITH_BALANCE_AMOUNT,
    previousStep: TutorialSteps.DEPOSIT_WITH_BALANCE_CHAIN,
    message: "You already have USDC on Arbitrum you can deposit that directly. ",
    title: "Select Token to Deposit",
  },
  [TutorialSteps.DEPOSIT_WITH_BALANCE_TOKEN_WETH]: {
    nextStep: TutorialSteps.DEPOSIT_WITH_BALANCE_AMOUNT,
    previousStep: TutorialSteps.DEPOSIT_WITH_BALANCE_CHAIN,
    message: "You already have WETH on Arbitrum you can deposit that directly. ",
    title: "Select Token to Deposit",
  },
  [TutorialSteps.DEPOSIT_WITH_BALANCE_AMOUNT]: {
    nextStep: TutorialSteps.DEPOSIT_WITH_BALANCE_DEPOSIT_BUTTON,
    previousStep: TutorialSteps.DEPOSIT_WITH_BALANCE_TOKEN_USDC,
    message: "You can deposit any chosen amount of selected token up to what is shown in your Wallet Balance.",
    title: "Enter Amount of Funds to Deposit.",
  },
  [TutorialSteps.DEPOSIT_WITH_BALANCE_DEPOSIT_BUTTON]: {
    // nextStep: TutorialSteps.DEPOSIT_WITH_BALANCE_THIRD,
    previousStep: TutorialSteps.DEPOSIT_WITH_BALANCE_AMOUNT,
    message:
      "Confirm the deposit amount and click the deposit button. You will need to sign 2 transactions in your connected wallet. ",
    title: "Confirm the Deposit Amount",
  },
  [TutorialSteps.DEPOSIT_WITHOUT_BALANCE_USDC]: {
    // [TutorialSteps.DEPOSIT_WITH_BALANCE_CHAIN]: {
    isLarge: true,
    nextStep: TutorialSteps.DEPOSIT_WITHOUT_BALANCE_CHAIN,
    message: (
      <div>
        <div className='mb-4'>
          <b>Option 1</b> - You can also choose a different chain where you have funds to deposit directly within
          Ithaca.
        </div>
        <div className='mb-4'>
          <b>Option 2</b> - You can also deposit USDC on Arbitrum to your wallet via most Centralized Exchanges.
        </div>
        <div className='mb-4'>
          <b>Option 3</b> - If you have $USDC.e (Bridged USDC) on Arbitrum in your wallet follow the steps below:
        </div>
        <ol type='1'>
          <li>Go to https://app.uniswap.org/swap?chain=arbitrum</li>
          <li>In the &quot;You pay&quot; input field select &quot;USDC.e&quot;</li>
          <li>In the &quot;You receive&quot; input field select &quot;USDC&quot;</li>
          <Image src={DepositUSDC} alt='Deposit USDC' width='140' height='140' className='ml-19' />
          <li>Click swap and confirm transaction in your wallet</li>
          <li>Return to this page to continue onboarding</li>
        </ol>
      </div>
    ),
    title: "No Native USDC on Arbitrum Available to Deposit",
  },
  [TutorialSteps.DEPOSIT_WITHOUT_BALANCE_WETH]: {
    nextStep: TutorialSteps.DEPOSIT_WITHOUT_BALANCE_CHAIN,
    isLarge: true,
    message: (
      <div>
        <div className='mb-4'>
          <b>Option 1</b> - You can also choose a different chain where you have funds to deposit directly within
          Ithaca.
        </div>
        <div className='mb-4'>
          <b>Option 2</b> - You can also deposit WETH on Arbitrum to your wallet via most Centralized Exchanges.
        </div>
        <div className='mb-4'>
          <b>Option 3</b> - If you have $ETH (not $WETH) on Arbitrum in your wallet follow the steps below:
        </div>
        <ol type='1'>
          <li>Go to https://app.uniswap.org/swap?chain=arbitrum</li>
          <li>In the &quot;You pay&quot; input field select &quot;ETH&quot;</li>
          <li>In the &quot;You receive&quot; input field select &quot;WETH&quot;</li>
          <Image src={DepositWETH} alt='Deposit WETH' width='140' height='140' className='ml-19' />
          <li>Click swap and confirm transaction in your wallet</li>
          <li>Return to this page to continue onboarding</li>
        </ol>
      </div>
    ),
    title: "No Native WETH on Arbitrum Available to Deposit",
  },
  [TutorialSteps.DEPOSIT_WITHOUT_BALANCE_CHAIN]: {
    nextStep: TutorialSteps.DEPOSIT_WITHOUT_BALANCE_DEPOSIT_TOKEN,
    previousStep: TutorialSteps.DEPOSIT_WITHOUT_BALANCE_USDC,
    message:
      "You can select a chain where you have funds to automatically convert and bridge them with Arbitrum powered by Axelar. ",
    title: "Select A Chain Where you have Funds",
  },
  [TutorialSteps.DEPOSIT_WITHOUT_BALANCE_DEPOSIT_TOKEN]: {
    nextStep: TutorialSteps.DEPOSIT_WITHOUT_BALANCE_CONVERTED_TOKEN,
    previousStep: TutorialSteps.DEPOSIT_WITHOUT_BALANCE_CHAIN,
    message: "Select from any of the supported tokens from your chosen chain to be used for depositing. ",
    title: "Select the Token you Want to Deposit",
  },
  [TutorialSteps.DEPOSIT_WITHOUT_BALANCE_CONVERTED_TOKEN]: {
    nextStep: TutorialSteps.DEPOSIT_WITHOUT_BALANCE_DEPOSIT_BUTTON,
    previousStep: TutorialSteps.DEPOSIT_WITHOUT_BALANCE_CHAIN,
    message: "Choose from any of the available tokens to be used as collateral.",
    title: "Select token you want funds to be converted into on Arbitrum.",
  },
  [TutorialSteps.DEPOSIT_WITHOUT_BALANCE_DEPOSIT_BUTTON]: {
    // nextStep: TutorialSteps.DEPOSIT_WITH_BALANCE_THIRD,
    previousStep: TutorialSteps.DEPOSIT_WITHOUT_BALANCE_CONVERTED_TOKEN,
    message:
      "Confirm the deposit amount and click the deposit button. You will need to sign 2 transactions in your connected wallet. ",
    title: "Confirm the Deposit Amount",
  },
  [TutorialSteps.WITHDRAW_FUNDS]: {
    // nextStep: TutorialSteps.DEPOSIT_WITH_BALANCE_THIRD,
    nextStep: TutorialSteps.WITHDRAW_TRANSACTION_HISTORY,
    message: (
      <div>
        <p>
          Step 1: After initiating a withdrawal you will need to wait ~40 minutes for the funds to be made available to
          be released.
        </p>
        <p>
          Step 2: Once funds are ready to be released you will be notified automatically within the Ithaca App. Once
          notified, go to ‘Transaction History’ tab & click the ‘Release’ button, the funds will then be transferred to
          the connected wallet.{" "}
        </p>
        <p>You can also periodically check the Transaction History tab to see the status of all withdrawals.</p>
      </div>
    ),
    title: "",
  },
  [TutorialSteps.WITHDRAW_TRANSACTION_HISTORY]: {
    // nextStep: TutorialSteps.DEPOSIT_WITH_BALANCE_THIRD,
    nextStep: TutorialSteps.WITHDRAW_TRANSACTION_HISTORY,
    message: (
      <div>
        <p>Go to ‘Transaction History’ to Check Status of Withdrawals & to Release Funds.</p>
        <p>
          Please go to the ‘Transaction History’ tab to withdraw funds to your wallet once they are ready to be
          released.
        </p>
      </div>
    ),
    title: "Confirm the Deposit Amount",
  },
  [TutorialSteps.WITHDRAW_RELEASE_FUNDS]: {
    // nextStep: TutorialSteps.DEPOSIT_WITH_BALANCE_THIRD,
    nextStep: TutorialSteps.WITHDRAW_TRANSACTION_HISTORY,
    message: (
      <div>
        <p>
          Once funds are ready to be released, the ‘Release’ button will become activated and show in green. Once ready,
          press the &quot;Release&quot; button to transfer funds to your wallet once the button activates.
        </p>
        <p>You will also receive a notification once funds are ready to be released.</p>
      </div>
    ),
    title: "Confirm the Deposit Amount",
  },
};
