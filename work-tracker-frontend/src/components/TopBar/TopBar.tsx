import styles from "./TopBar.module.css";

interface TopBarProps {
  totalMinutes: number;
  hourlyRate: number;
  onLogout: () => void;
}

const TopBar = ({ onLogout }: TopBarProps) => {
  return (
    <div className={styles.topBar}>
      <button className={`button buttonDestructive`} onClick={onLogout}>
        Logout
      </button>
    </div>
  );
};

export default TopBar;
