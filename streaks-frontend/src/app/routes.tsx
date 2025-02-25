import Login from "../components/Login/Login";
import Me from "../components/Me/Me";
import PrivateRoute from "../components/PrivateRoute";
import RedirectIfLoggedIn from "../components/RedirectIfLoggedIn";
import Register from "../components/Register/Register";
import Streaks from "../components/Streaks/Streaks";

export const ROUTES = [
  {
    path: "/login",
    element: <RedirectIfLoggedIn element={<Login />} />,
  },
  {
    path: "/register",
    element: <RedirectIfLoggedIn element={<Register />} />,
  },
  {
    path: "/streaks",
    element: <PrivateRoute element={<Streaks />} />,
  },
  {
    path: "/me",
    element: <PrivateRoute element={<Me />} />,
  },
];
