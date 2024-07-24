// Packages
import { useCallback, useEffect, useState } from "react";
import { readContracts, useAccount } from "wagmi";
import { formatUnits, isAddressEqual } from "viem";

// Components
import Button from "@/UI/components/Button/Button";
import Sort from "@/UI/components/Icons/Sort";
import Flex from "@/UI/layouts/Flex/Flex";
import Pagination from "@/UI/components/Pagination/Pagination";
import Panel from "@/UI/layouts/Panel/Panel";
import Loader from "@/UI/components/Loader/Loader";
import StatsCard from "../StatsCard/StatsCard";
import Avatar from "../Icons/Avatar";

// Constants
import { getCupIcon } from "@/UI/constants/badges";
import {
  ARGONAUT_LEADERBOARD_TABLE_HEADERS,
  ArgonautData,
  ArgonautTableProps,
  argonautLeaderboardTableEnums,
  headerToKeyMap,
} from "@/UI/constants/argonaut";
import { fundlockAbi } from "@/assets/abi/fundlockAbi";

// Utils
import { getTruncateEthAddress } from "@/UI/utils/Points";
import { formatNumberByCurrency } from "@/UI/utils/Numbers";

// Services
import { useAppStore } from "@/UI/lib/zustand/store";

// Styles
import styles from "./ArgonautLeaderboard.module.scss";
import { arbitrum } from "viem/chains";
import { fundlockArbitrumAddress, usdcArbitrumAddress, wethArbitrumAddress } from "@/UI/constants/arbitrumAddresses";

const participatingWallets: `0x${string}`[] = [
  "0xCE1E154117AD40Fb33DFBc211E95782065De6D76",
  "0xEE0e3E85A281f21F358e9fEb296813b8f1c92E8c",
  "0x25fAa73e85E96400C5c542607977a672D6f05aE2",
  "0xd51C6f01719499484974F7F0710aFb25d39c79b1",
  "0x3Bd3F3Ee23303D85895FB39307BE9c531D7a2B5a",
  "0xf6d9A78976b541D74913CAeEB75989be4Efa2D20",
  "0xe74C8BC468F940674E24957F278A956EDc701E1e",
  "0x7C7CcfEB2a64b3D3386933A43f591F26A413a084",
  "0x7758CAD3a6cfe75C92CE21Df9Eae38Acec30717b",
  "0xEFbA3d4cF2f1335909d12aF76dD72Fe07989f8cA",
];

const ArgonautLeaderboard = ({ page, setPage, sortConfig, setSortConfig, pageLimit }: ArgonautTableProps) => {
  const { systemInfo, currentSpotPrice } = useAppStore();
  const { address } = useAccount();

  const [data, setData] = useState<ArgonautData[]>([]);
  const sortableColumns = [argonautLeaderboardTableEnums.RANKING, argonautLeaderboardTableEnums.TRADING_BALANCE];

  const fetchBalancesAndPrepareLeaderboard = useCallback(async () => {
    const fetchUsdcBalancesArg = participatingWallets.map(wallet => ({
      address: fundlockArbitrumAddress,
      abi: fundlockAbi,
      functionName: "balanceSheet",
      args: [wallet, usdcArbitrumAddress],
      chainId: arbitrum.id,
    }));

    const fetchWethBalancesArg = participatingWallets.map(wallet => ({
      address: fundlockArbitrumAddress,
      abi: fundlockAbi,
      functionName: "balanceSheet",
      args: [wallet, wethArbitrumAddress],
      chainId: arbitrum.id,
    }));

    const usdcBalancesPromise = readContracts({ contracts: fetchUsdcBalancesArg });
    const wethBalancesPromise = readContracts({ contracts: fetchWethBalancesArg });

    const [usdcBalances, wethBalances] = await Promise.all([usdcBalancesPromise, wethBalancesPromise]);

    const leaderboard = participatingWallets
      .map((wallet, index) => {
        const wethTradingBalance =
          Number(formatUnits(wethBalances[index].result as bigint, systemInfo.tokenDecimals["WETH"])) *
          currentSpotPrice;
        const usdcTradingBalance = Number(
          formatUnits(usdcBalances[index].result as bigint, systemInfo.tokenDecimals["USDC"])
        );
        return {
          user: wallet,
          tradingBalance: `${wethTradingBalance + usdcTradingBalance}`,
        };
      })
      .sort((a, b) => Number(b.tradingBalance) - Number(a.tradingBalance))
      .map((walletList, index) => ({ ...walletList, ranking: index + 1 }));
    setData(leaderboard);
  }, [currentSpotPrice, systemInfo]);

  useEffect(() => {
    fetchBalancesAndPrepareLeaderboard();
  }, [fetchBalancesAndPrepareLeaderboard]);

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handleSort = (key: keyof ArgonautData) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getUserRanking = () => {
    return address && participatingWallets.includes(address)
      ? data.find(leaderboard => isAddressEqual(leaderboard.user, address))?.ranking || 0
      : 0;
  };

  const getUserTradingBalance = () => {
    const tradingBalance =
      address && participatingWallets.includes(address)
        ? data.find(leaderboard => isAddressEqual(leaderboard.user, address))?.tradingBalance || "0"
        : "0";
    return formatNumberByCurrency(Number(tradingBalance), "string", "USDC");
  };

  return (
    <>
      <div className={styles.statsWrapper}>
        <StatsCard title='Your Current Ranking' stat={getUserRanking()} />
        <StatsCard title='Trading Balance USD Equivalent' stat={getUserTradingBalance()} />
      </div>
      <Panel className={styles.wrapper}>
        <div className={styles.table}>
          {!data.length ? (
            <div className={styles.loader}>
              <Loader type='lg' />
            </div>
          ) : (
            <>
              <div className={styles.header}>
                {ARGONAUT_LEADERBOARD_TABLE_HEADERS.map((header, idx) => {
                  const isSortable = sortableColumns.includes(header);
                  const sortKey = headerToKeyMap[header];

                  return (
                    <div className={styles.cell} key={idx}>
                      {header}
                      {isSortable && (
                        <Button
                          title='Click to sort column'
                          className={styles.sort}
                          onClick={() => handleSort(sortKey)}
                        >
                          <Sort />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
              {data
                .slice(page > 1 ? page + pageLimit - 2 : 0, Math.min(page * pageLimit, data.length))
                .map(({ ranking, user, tradingBalance }) => (
                  <div className={styles.row} key={ranking}>
                    <div className={styles.cell}>
                      {ranking <= 3 ? (
                        <p className={styles[`prizePlace-${ranking}`]}>
                          {ranking} {getCupIcon(ranking)}
                        </p>
                      ) : (
                        ranking
                      )}
                    </div>
                    <div className={styles.cell}>
                      <Avatar />
                      {`${getTruncateEthAddress(user)} ${address && isAddressEqual(address, user) ? "(You)" : ""}`}
                    </div>
                    <div className={styles.cell}>
                      {formatNumberByCurrency(Number(tradingBalance), "string", "USDC")}
                    </div>
                  </div>
                ))}
              {data.length > pageLimit ? (
                <div className={styles.paginationContainer}>
                  <Flex direction='row-space-between'>
                    <div />
                    <Pagination
                      className={styles.pagination}
                      totalItems={data.length}
                      itemsPerPage={pageLimit}
                      currentPage={page}
                      onPageChange={handlePageChange}
                    />
                  </Flex>
                </div>
              ) : null}
            </>
          )}
        </div>
      </Panel>
    </>
  );
};

export default ArgonautLeaderboard;
