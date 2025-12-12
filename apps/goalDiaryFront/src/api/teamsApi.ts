import { commonApiJson } from "@/api/commonApi";

export const inviteTeamMember = async (teamId: number, userId: string) => {
    return await commonApiJson(`/api/teams/${teamId}/invite`, {
        method: "POST",
        body: { userId },
        requireAuth: true,
    });
};

export const getTeamMembers = async (teamId: number) => {
    return await commonApiJson(`/api/teams/${teamId}/members`, {
        method: "GET",
        requireAuth: true,
    });
};

export const getMyInvitations = async () => {
    return await commonApiJson(`/api/teams/invitations/me`, {
        method: "GET",
        requireAuth: true,
    });
};

export const updateInvitationStatus = async (membershipId: number, status: "ACTIVE" | "REJECTED") => {
    return await commonApiJson(`/api/teams/invitations/${membershipId}`, {
        method: "PATCH",
        body: { status },
        requireAuth: true,
    });
};

export const getMyTeams = async () => {
    return await commonApiJson(`/api/teams/me`, {
        method: "GET",
        requireAuth: true,
    });
};

export const leaveTeam = async (teamId: number) => {
    return await commonApiJson(`/api/teams/${teamId}/leave`, {
        method: "DELETE",
        requireAuth: true,
    });
};

export const deleteTeam = async (teamId: number) => {
    return await commonApiJson(`/api/teams/${teamId}`, {
        method: "DELETE",
        requireAuth: true,
    });
};

export const removeTeamMember = async (teamId: number, userId: string) => {
    return await commonApiJson(`/api/teams/${teamId}/members/${userId}`, {
        method: "DELETE",
        requireAuth: true,
    });
};
