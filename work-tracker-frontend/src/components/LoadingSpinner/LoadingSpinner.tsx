import styles from "./LoadingSpinner.module.css";
import ClipLoader from "react-spinners/ClipLoader";

const LoadingSpinner = () => {
  return (
    <div className={`${styles.loadingContainer}`}>
      <ClipLoader size={20} color="#fff" />
    </div>
  );
};

export default LoadingSpinner;
