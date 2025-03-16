import Login from "../components/Login/Login";
import Me from "../components/Me/Me";
import PrivateRoute from "../components/PrivateRoute";
import RedirectIfLoggedIn from "../components/RedirectIfLoggedIn";
import Register from "../components/Register/Register";
import DefaultRedirect from "../components/DefaultRedirect";

export const ROUTES = [
  {
    path: "/",
    element: <DefaultRedirect />,
  },
  {
    path: "/login",
    element: <RedirectIfLoggedIn element={<Login />} />,
  },
  {
    path: "/register",
    element: <RedirectIfLoggedIn element={<Register />} />,
  },
  {
    path: "/me",
    element: <PrivateRoute element={<Me />} />,
  },
];
