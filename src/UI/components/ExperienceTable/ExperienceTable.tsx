import { useEffect, useState } from "react";

// Components
import Button from "@/UI/components/Button/Button";
import Sort from "@/UI/components/Icons/Sort";
import Flex from "@/UI/layouts/Flex/Flex";
import Pagination from "@/UI/components/Pagination/Pagination";
import Panel from "@/UI/layouts/Panel/Panel";
import Avatar from "@/UI/components/Icons/Avatar";
import Loader from "@/UI/components/Loader/Loader";

// Constants
import {
  EXPERIENCE_TABLE_LEADERBOARD_HEADERS,
  ExperienceData,
  experienceTableLeaderboardEnums,
  ExperienceTableProps,
  getCupIcon,
  headerToKeyMap,
} from "@/UI/constants/badges";

// Utils
import { formatNumber, getTruncateEthAddress, handlePointsError } from "@/UI/utils/Points";

// Services
import { GetBadgesLeaderboardData } from "@/UI/services/PointsAPI";

// Styles
import styles from "./ExperienceTable.module.scss";
import ProfileImage from "@/UI/components/ProfileImage/ProfileImage";

const ExperienceTable = ({ page, setPage, sortConfig, setSortConfig, pageLimit, showToast }: ExperienceTableProps) => {
  const [data, setData] = useState<ExperienceData[]>([]);
  const [totalDataCount, setTotalDataCount] = useState<number>(0);
  const sortableColumns = [experienceTableLeaderboardEnums.RANKING, experienceTableLeaderboardEnums.POINTS];

  useEffect(() => {
    GetBadgesLeaderboardData({
      page,
      pageLimit: pageLimit,
      sortField: sortConfig.key,
      sortType: sortConfig.direction,
    }).then(({ data, error }) => {
      if (error) {
        handlePointsError({
          showToast,
          title: error.name,
          message: error.message,
        });
      } else if (data) {
        setData(data.leaderboard.users);
        setTotalDataCount(data.leaderboard.total);
      }
    });
  }, [page, sortConfig.key, sortConfig.direction]);

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handleSort = (key: keyof ExperienceData) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <Panel className={styles.wrapper}>
      <h1>Leaderboard</h1>
      <div className={styles.table}>
        {!data.length ? (
          <div className={styles.loader}>
            <Loader type='lg' />
          </div>
        ) : (
          <>
            <div className={styles.header}>
              {EXPERIENCE_TABLE_LEADERBOARD_HEADERS.map((header, idx) => {
                const isSortable = sortableColumns.includes(header);
                const sortKey = headerToKeyMap[header];

                return (
                  <div className={styles.cell} key={idx}>
                    {header}
                    {isSortable && (
                      <Button title='Click to sort column' className={styles.sort} onClick={() => handleSort(sortKey)}>
                        <Sort />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
            {data.map(({ id, ranking, displayName, points, avatarUrl, isAvatar }) => (
              <div className={styles.row} key={id}>
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
                  {isAvatar && avatarUrl ? (
                    <ProfileImage
                      width={30}
                      height={30}
                      className={styles.avatar}
                      src={avatarUrl}
                      alt='Leaderboard avatarUrl'
                    />
                  ) : (
                    <Avatar />
                  )}
                  {getTruncateEthAddress(displayName)}
                </div>
                <div className={styles.cell}>{formatNumber(points, 3)}</div>
              </div>
            ))}
            {totalDataCount > pageLimit ? (
              <div className={styles.paginationContainer}>
                <Flex direction='row-space-between'>
                  <div />
                  <Pagination
                    className={styles.pagination}
                    totalItems={totalDataCount}
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
  );
};

export default ExperienceTable;
