import { Name, NameType } from '@greymass/eosio';
import type { API } from '@greymass/eosio';

export class Permission {
    permission_name: Name
    permission_data: API.v1.AccountPermission

    constructor(permissionName: Name, permissionData: API.v1.AccountPermission) {
        this.permission_name = permissionName
        this.permission_data = permissionData
    }

    static from(permissionName: NameType, accountData: API.v1.AccountObject): Permission {
        const permissionObject = accountData.getPermission(permissionName)

        if (!permissionObject) {
            throw new Error(`Permission ${permissionName} does not exist on account ${accountData.account_name}`)
        }

        return new Permission(Name.from(permissionName), permissionObject)
    }

    static addPermissionAction(permission: Permission): void {
        createPermissionAction('updateauth', permission)
    }

    get permissionName(): Name {
        return this.permission_name
    }

    async addPermissionAction(permission: Permission): Promise<void> {
        // Add permission here..
    }

    async removePermissionAction(permission: Permission): Promise<void> {
        // Remove permission here..
    }

    async updatePermissionAction(permission: Permission): Promise<void> {
        // Update permission here..
    }

    async addPermissionKeyAction(permission: Permission, key: string): Promise<void> {
        // Add permission key here..
    }

    async removePermissionKeyAction(permission: Permission, key: string): Promise<void> {
        // Remove permission key here..
    }

    async addPermissionAccountAction(permission: Permission, account: Account): Promise<void> {
        // Add permission account here..
    }

    async removePermissionAccountAction(permission: Permission, account: Account): Promise<void> {
        // Remove permission account here..
    }

    async addPermissionWaitAction(permission: Permission, wait: number): Promise<void> {
        // Add permission wait here..
    }

    async removePermissionWaitAction(permission: Permission, wait: number): Promise<void> {
        // Remove permission wait here..
    }
}

function createPermissionAction(actionData) {
    return {
        account: 'eosio',
        name: 'updateauth',
        authorization: [{
            actor: actionData.accountName,
            permission: actionData.permissionName,
        }],
        data: actionData,
    }
}
