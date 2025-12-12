import { useQuery } from "@tanstack/react-query";
import { searchUsers } from "@/api/usersApi";

export const useSearchUsers = (query: string) => {
    return useQuery({
        queryKey: ["users", "search", query],
        queryFn: () => searchUsers(query),
        enabled: query.length > 0,
    });
};

