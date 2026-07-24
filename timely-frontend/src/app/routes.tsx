import Login from "../components/Login/Login";
import Me from "../components/Me/Me";
import PrivateRoute from "../components/PrivateRoute";
import RedirectIfLoggedIn from "../components/RedirectIfLoggedIn";
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
    path: "/me",
    element: <PrivateRoute element={<Me />} />,
  },
  {
    path: "*",
    element: <DefaultRedirect />,
  },
];
