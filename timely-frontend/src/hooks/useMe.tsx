import { useQuery } from "@tanstack/react-query";
import userService from "../services/user.service";

export const meQueryKey = ["me"] as const;

export const useMe = () => {
  const token = localStorage.getItem("jwtToken");

  return useQuery({
    queryKey: meQueryKey,
    queryFn: userService.getUser,
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
    retry: false,
    refetchOnWindowFocus: false,
  });
};
