import {APIClient, Name, NameType} from '@greymass/eosio';
import type { API } from '@greymass/eosio';
import * as zlib from "zlib";
import { SigningRequest, AbiProvider } from 'eosio-signing-request'
import type { PermissionOptions } from './types'
import {createESR} from "../helpers/esr";

declare const TextEncoder
declare const TextDecoder

export class Permission {
    permission_name: Name
    permission_data: API.v1.AccountPermission
    client: APIClient

    constructor(permissionName: Name, permissionData: API.v1.AccountPermission, options?: PermissionOptions) {
        this.permission_name = permissionName
        this.permission_data = permissionData
        this.client = options?.client
    }


    static from(permissionName: NameType, accountData: API.v1.AccountObject): Permission {
        const permissionObject = accountData.getPermission(permissionName)

        if (!permissionObject) {
            throw new Error(`Permission ${permissionName} does not exist on account ${accountData.account_name}`)
        }

        return new Permission(Name.from(permissionName), permissionObject)
    }

    static addPermissionESR(permission: Permission, options: PermissionOptions, session?: Session): void {
        return createESR(
            'eosio',
            'updateauth',
            [{
                name: permission.name,
                parent: permission.parent,
                auth: {
                    threshold: permission.threshold,
                    keys: permission.keys,
                    accounts: permission.accounts,
                    waits: permission.waits
                }
            }]
        )
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
