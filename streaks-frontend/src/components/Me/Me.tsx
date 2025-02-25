import { useMe } from "../../hooks/useMe";
import styles from "./Me.module.css";

function Me() {
  const {data: user, logout } = useMe();

  return (
    <div className={styles.title}>
      {user?.username}
      <button onClick={logout}>logout</button>
    </div>
  );
}

export default Me;
