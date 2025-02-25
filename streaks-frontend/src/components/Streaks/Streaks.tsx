import styles from "./Streaks.module.css";

function Streaks() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.username}>username</div>
          <div className={styles.avatar} />
        </div>
        <div className={styles.middle}>
          <div className={styles.icons}>
            <div className={styles.icon} />
            <div className={styles.icon} />
            <div className={styles.icon} />
            <div className={styles.icon} />
            <div className={styles.icon} />
          </div>
        </div>
        <div className={styles.content}></div>
      </div>
    </div>
  );
}

export default Streaks;
