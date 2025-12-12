import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inviteTeamMember, getTeamMembers, getMyInvitations, updateInvitationStatus, getMyTeams, leaveTeam, deleteTeam, removeTeamMember } from "@/api/teamsApi";

export const useInviteTeamMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ teamId, userId }: { teamId: number; userId: string }) => {
            return inviteTeamMember(teamId, userId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myInvitations"] });
        },
    });
};

export const useGetTeamMembers = (teamId: number | null) => {
    return useQuery({
        queryKey: ["teamMembers", teamId],
        queryFn: () => getTeamMembers(teamId!),
        enabled: !!teamId,
    });
};

export const useGetMyInvitations = () => {
    return useQuery({
        queryKey: ["myInvitations"],
        queryFn: getMyInvitations,
        refetchInterval: 30000, // 30초마다 자동 갱신
    });
};

export const useUpdateInvitationStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ membershipId, status }: { membershipId: number; status: "ACTIVE" | "REJECTED" }) => {
            return updateInvitationStatus(membershipId, status);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myInvitations"] });
            queryClient.invalidateQueries({ queryKey: ["schedules"] }); // 수락 시 일정 목록도 갱신
        },
    });
};

export const useGetMyTeams = () => {
    return useQuery({
        queryKey: ["myTeams"],
        queryFn: getMyTeams,
    });
};

export const useLeaveTeam = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (teamId: number) => {
            return leaveTeam(teamId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myTeams"] });
            queryClient.invalidateQueries({ queryKey: ["schedules"] }); // 탈퇴 시 일정 목록도 갱신
        },
    });
};

export const useDeleteTeam = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (teamId: number) => {
            return deleteTeam(teamId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myTeams"] });
            queryClient.invalidateQueries({ queryKey: ["schedules"] }); // 삭제 시 일정 목록도 갱신
        },
    });
};

export const useRemoveTeamMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ teamId, userId }: { teamId: number; userId: string }) => {
            return removeTeamMember(teamId, userId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
            queryClient.invalidateQueries({ queryKey: ["myTeams"] });
        },
    });
};

