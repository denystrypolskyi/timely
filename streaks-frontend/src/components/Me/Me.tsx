import { useMe } from "../../hooks/useMe";
import styles from "./Me.module.css";

function Me() {
  const { data: user, logout } = useMe();

  return (
    <div
      className={`container ${styles.meContainer}`}
      style={{ flexDirection: "column", gap: "16px" }}
    >
      <div>Currently logged in as: {user?.username}</div>
      <button className="button" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

export default Me;
