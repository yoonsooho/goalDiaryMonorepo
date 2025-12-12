export type UserTeamType = {
    id: number;
    status: string;
    role: string;
    createdAt: Date;
    team: TeamType;
};
export type TeamType = {
    id: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    owner: TeamOwnerType;
};
export type TeamOwnerType = {
    id: string;
    userId: string; // 로그인 아이디
    username: string; // 사용자 이름
};
