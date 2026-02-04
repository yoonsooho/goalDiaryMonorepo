import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/client";

interface CurrentUser {
  id: string;
  userId: string;
  username: string;
  social?: string | null;
}

async function fetchCurrentUser() {
  const response = await apiClient.get<CurrentUser>("/users/me");
  return response.data;
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
  });
}

