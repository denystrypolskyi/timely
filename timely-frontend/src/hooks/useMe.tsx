import { useQuery } from "@tanstack/react-query";
import userService from "../services/user.service";

export const meQueryKey = ["me"] as const;

export const useMe = () => {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: userService.getUser,
    staleTime: 1000 * 60 * 5,
    retry: false,
    refetchOnWindowFocus: false,
  });
};
