namespace SatoriRestClientModels {
    export enum UserRoleName {
        User,
        Reader,
        Admin
    }

    export interface UserDTO {
        iD: string;
        name: string;
        fullName: string;
    }

    export interface UserRoleDTO {
        name: string; // User, Reader, Admin
        users: UserDTO[];
    }

    export interface TenantDTO {
        iD: string;
        isAdmin: boolean;
        isUser: boolean;
        roles: UserRoleDTO[];
    }
}