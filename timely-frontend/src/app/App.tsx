import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import styles from "./App.module.css";
import LanguageSwitcher from "../components/LanguageSwitcher/LanguageSwitcher";

function App() {
  return (
    <div className={styles.app}>
      <LanguageSwitcher />
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
