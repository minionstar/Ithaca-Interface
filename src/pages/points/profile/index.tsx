import { useEffect, useState } from "react";

// Components
import Meta from "@/UI/components/Meta/Meta";
import Main from "@/UI/layouts/Main/Main";
import Container from "@/UI/layouts/Container/Container";
import Quests from "@/UI/components/Quests/Quests";
import PointsProfile from "@/UI/components/PointsProfile/PointsProfile";
import ExperienceTable from "@/UI/components/ExperienceTable/ExperienceTable";
import Toast from "@/UI/components/Toast/Toast";
import PointsLayout from "@/UI/layouts/PointsLayout/PointsLayout";
import Plug from "@/UI/components/Plug/Plug";
import Loader from "@/UI/components/Loader/Loader";

// Utils
import useToast from "@/UI/hooks/useToast";

// Constants
import { ExperienceSortConfig } from "@/UI/constants/badges";

// Services
import { fetchSingleConfigKey } from "@/services/environment.service";

// Styles
import styles from "./profile.module.scss";

const Profile = () => {
  const { toastList, showToast } = useToast();
  const [page, setPage] = useState<number>(1);
  const [sortConfig, setSortConfig] = useState<ExperienceSortConfig>({
    key: "ranking",
    direction: "asc",
  });
  const [isPointsDisabled, setIsPointsDisabled] = useState(true);
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  const pageLimit = 10;

  useEffect(() => {
    fetchSingleConfigKey("DISABLE_POINTS")
      .then(isPointsDisabled => {
        setIsPointsDisabled(!!isPointsDisabled);
        setIsConfigLoading(false);
      })
      .catch(() => {
        setIsPointsDisabled(true);
        setIsConfigLoading(false);
      });
  }, []);

  if (isConfigLoading) {
    return (
      <Main>
        <Loader type='lg' />
      </Main>
    );
  }

  if (isPointsDisabled) {
    return (
      <Plug>
        <PointsLayout />
      </Plug>
    );
  }

  return (
    <>
      <Meta />
      <Main>
        <Container>
          <PointsLayout />
          <div className={styles.contentWrapper}>
            <div className={styles.leftContainer}>
              <PointsProfile showToast={showToast} />
              <ExperienceTable
                page={page}
                setPage={(page: number) => setPage(page)}
                sortConfig={sortConfig}
                setSortConfig={(newSortConfig: ExperienceSortConfig) => setSortConfig(newSortConfig)}
                pageLimit={pageLimit}
                showToast={showToast}
              />
            </div>
            <div className={styles.rightContainer}>
              <Quests showToast={showToast} />
            </div>
          </div>
        </Container>
      </Main>
      <Toast toastList={toastList} position='bottom-right' autoDelete={true} />
    </>
  );
};

export default Profile;
