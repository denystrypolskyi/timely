import { useMutation, useQueryClient } from "@tanstack/react-query";
import authService from "../services/auth.service";
import userService from "../services/user.service";
import { AuthTokenResponse } from "../types/auth.types";
import { meQueryKey, useMe } from "./useMe";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem("jwtToken");
  const meQuery = useMe();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async (data: AuthTokenResponse) => {
      localStorage.setItem("jwtToken", data.token);

      const user = await userService.getUser();
      queryClient.setQueryData(meQueryKey, user);
    },
  });

  const logout = () => {
    localStorage.removeItem("jwtToken");
    queryClient.setQueryData(meQueryKey, null);
  };

  const user = meQuery.data ?? null;
  const isAuthenticated = !!user?.username;
  const isCheckingAuth = !!token && meQuery.isLoading;

  return {
    user,
    isAuthenticated,
    isCheckingAuth,
    isAuthError: meQuery.isError,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout,
  };
};
