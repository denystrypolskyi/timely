import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import authService from "../services/auth.service";
import userService from "../services/user.service";
import { LoginResponse } from "../types/auth.types";

export const useMe = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ["me"],
    queryFn: userService.getUser,
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async (data: LoginResponse) => {
      localStorage.setItem("jwtToken", data.token);
      await queryClient.refetchQueries({ queryKey: ["me"] });
    },
    onError: (error: any) => {
      console.error("Login failed:", error);
    },
  });

  const logout = () => {
    localStorage.removeItem("jwtToken");
    queryClient.invalidateQueries({ queryKey: ["me"] });
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
