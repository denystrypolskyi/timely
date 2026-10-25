import { useMutation, useQueryClient } from "@tanstack/react-query";
import authService from "../services/auth.service";
import userService from "../services/user.service";
import { meQueryKey, useMe } from "./useMe";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const meQuery = useMe();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async () => {
      const user = await userService.getUser();
      queryClient.setQueryData(meQueryKey, user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => queryClient.setQueryData(meQueryKey, null),
  });

  const updateTimeZoneMutation = useMutation({
    mutationFn: userService.updateTimeZone,
    onSuccess: async (updatedUser) => {
      queryClient.setQueryData(meQueryKey, updatedUser);
      await queryClient.invalidateQueries({ queryKey: ["shifts"] });
    },
  });

  const user = meQuery.data ?? null;
  const isAuthenticated = !!user?.username;
  const isCheckingAuth = meQuery.isLoading;

  return {
    user,
    isAuthenticated,
    isCheckingAuth,
    isAuthError: meQuery.isError,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
    updateTimeZone: updateTimeZoneMutation.mutateAsync,
  };
};
