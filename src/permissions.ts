import {APIClient, Name, NameType} from '@greymass/eosio';
import type { API } from '@greymass/eosio';

// import { Contract } from '@wharfkit/contract'

import { Account } from './accounts'

interface PermissionData {
    parent: string
    required_auth: {
        accounts: {
            permission: {
                actor: string
                permission: string
            }
        }
    }
}

interface PermissionOptions {
    api_client?: APIClient
}

interface PermissionType {
    parent: string
    permission: NameType
    account: NameType
    auth: {
        accounts: ({
            permission: {
                actor: NameType
                permission: string
            }
        })[]
        waits: ({
            wait_sec: number
            weight: number
        })[]
        keys: ({
            key: string
            weight: number
        })[]
    },
    authorized_by: NameType
}

export class Permission {
    permission_name: Name
    permission_data: API.v1.AccountPermission
    api_client: APIClient | undefined

    constructor(permissionName: Name, permissionData: API.v1.AccountPermission, options?: PermissionOptions) {
        this.permission_name = permissionName
        this.permission_data = permissionData
        this.api_client = options?.api_client
    }

    static from(permissionName: NameType, accountData: API.v1.AccountObject): Permission {
        const permissionObject = accountData.getPermission(permissionName)

        if (!permissionObject) {
            throw new Error(`Permission ${permissionName} does not exist on account ${accountData.account_name}`)
        }

        return new Permission(Name.from(permissionName), permissionObject)
    }

    static addPermission(permissionName: PermissionType, account: Account): Promise<void> {
        return new Promise((resolve) => {
            resolve()
        });
        // return Contract.eosio.updateauth({
        //     account: account.name.toString(),
        //     permission: permissionNam    e,
        //     parent: permission.parent,
        //     auth: permission.auth
        // })
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
