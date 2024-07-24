// Styles
import styles from "./StatsCard.module.scss";

type StatsCardProps = {
  title: string;
  stat: string | number;
};

const StatsCard = ({ title, stat }: StatsCardProps) => {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.stat}>{stat}</div>
    </div>
  );
};

export default StatsCard;
