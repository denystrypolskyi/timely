import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import authService from "../services/auth.service";
import userService from "../services/user.service";
import { LoginResponse } from "../types/auth.types";

export const useMe = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem("jwtToken");

  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ["me"],
    queryFn: userService.getUser,
    enabled: !!token, 
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: false,
    refetchOnWindowFocus: false,
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async (data: LoginResponse) => {
      localStorage.setItem("jwtToken", data.token);

      const user = await userService.getUser();
      queryClient.setQueryData(["me"], user);
    },
    onError: (error: any) => {
      console.error("Login failed:", error);
    },
  });

  const logout = () => {
    localStorage.removeItem("jwtToken");
    queryClient.setQueryData(["me"], null);
  };

  return {
    data,
    isLoading,
    isLoggingIn: loginMutation.isPending,
    isError,
    login: loginMutation.mutateAsync,
    logout,
    isSuccess,
  };
};
