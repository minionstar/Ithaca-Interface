// Packages
import { publicProvider } from "wagmi/providers/public";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { Chain, configureChains, createConfig } from "wagmi";
import { coinbaseWallet, metaMaskWallet, walletConnectWallet } from "@rainbow-me/rainbowkit/wallets";
import { arbitrum, base, mainnet, optimism, polygon } from "viem/chains";
import { getActiveChain } from "./RainbowKitHelpers";

// Project ID
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("Environment variable PROJECT_ID is not set.");
}

const isProd = getActiveChain().id === arbitrum.id;

// Chains
const { chains, publicClient, webSocketPublicClient } = configureChains(
  (isProd ? [arbitrum, optimism, polygon, mainnet, base] : [arbitrum, getActiveChain()]) as Chain[],
  [publicProvider()]
);

// Info
const appInfo = {
  appName: "Ithaca",
};

// Connectors
const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      metaMaskWallet({
        projectId,
        chains,
      }),
      walletConnectWallet({ projectId, chains }),
      coinbaseWallet({ ...appInfo, chains }),
    ],
  },
]);

// Wagmi Config
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export { chains, appInfo, wagmiConfig, isProd };
