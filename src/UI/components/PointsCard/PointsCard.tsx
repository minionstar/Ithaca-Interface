// Components
import Button from "@/UI/components/Button/Button";
import Href from "@/UI/components/Icons/Href";
import Flex from "@/UI/layouts/Flex/Flex";

// Utils
import { formatPoints } from "@/UI/utils/Points";
import { isProd } from "@/UI/utils/RainbowKit";

// Styles
import styles from "./PointsCard.module.scss";

type PointsCardProps = {
  mainnetTradingPoints: number;
  totalPoints: number;
  isRedemption: boolean;
  isPending: boolean;
  redeemPointsHandler: () => void;
};

const PointsCard = ({
  mainnetTradingPoints,
  totalPoints,
  isPending,
  isRedemption,
  redeemPointsHandler,
}: PointsCardProps) => {
  return (
    <div className={`${styles.container} ${styles.card3}`}>
      <div className={styles.data3}>
        {mainnetTradingPoints < 10 ? (
          <div className={`${styles.descriptions} ${styles.justifyBetween}`}>
            <p className={styles.title}>Total Activated Points</p>
            <div className={styles.descriptionContentBlock}>
              <Flex direction='column'>
                <p className={styles.pointsLabel}>{formatPoints(mainnetTradingPoints < 10 ? 0 : totalPoints, "All")}</p>
                <p className={styles.totalPointsLabel}>{`Total Inactive Points ${formatPoints(
                  mainnetTradingPoints < 10 ? totalPoints : 0,
                  "All"
                )}`}</p>
                <p className={styles.subtitle}>
                  <a
                    href={isProd ? "/trading/dynamic-option-strategies" : "https://app.ithacaprotocol.io"}
                    target={isProd ? "_self" : "_blank"}
                    className={styles.link}
                  >
                    Trade now on mainnet
                  </a>
                  <a
                    href={isProd ? "/trading/dynamic-option-strategies" : "https://app.ithacaprotocol.io"}
                    target={isProd ? "_self" : "_blank"}
                  >
                    <Href />
                  </a>
                  to earn 10 TRADING points to activate all points.
                </p>
              </Flex>
            </div>
          </div>
        ) : (
          <div className={`${styles.descriptions} ${styles.justifyCenter}`}>
            <p className={styles.title}>Total Activated Points</p>
            <div className={styles.descriptionContentBlock}>
              <Flex direction='column'>
                <p className={styles.pointsLabel}>{formatPoints(mainnetTradingPoints < 10 ? 0 : totalPoints, "All")}</p>
              </Flex>
            </div>
          </div>
        )}
        {isRedemption && (
          <div className={styles.redeemButtonContainer}>
            <p className={styles.title}>You have points waiting for you!</p>
            <Button
              className={styles.redeemButton}
              title={"Redeem Points"}
              size={"sm"}
              onClick={redeemPointsHandler}
              disabled={isPending}
            >
              Redeem Points
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PointsCard;
