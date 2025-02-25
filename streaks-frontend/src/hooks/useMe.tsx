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
    onSuccess: (data: LoginResponse) => {
      localStorage.setItem("jwtToken", data.token);
      queryClient.invalidateQueries({ queryKey: ["me"] });
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
    isError,
    login: loginMutation.mutateAsync,
    logout,
    isSuccess,
  };
}