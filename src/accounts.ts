import { Name, ChainId } from '@greymass/eosio'

import { Permission } from './accounts/permissions'

import type { AccountData } from './types'

export class Account {
    chain_id: ChainId
    account_name: Name
    permissions: Permission[] = []

     constructor(accountName: Name, chainId: ChainId) {
        this.account_name = accountName
        this.chain_id = chainId
     }

     static from(accountName: Name, chainId: ChainId): Account {
        return new Account(accountName, chainId)
     }

     get accountName(): Name {
        return this.accountName
     }

     get chainId(): ChainId {
        return this.chainId
     }

     async getPermissions(scope): Promise<Permission | undefined> {
        const accountData = await this.getAccountData()

         return this.permissions.find((permission) => {
            return permission.scope === scope
         });
     }

     async getAccountData(): Promise<AccountData> {
        // Fetch data here..

        return {
            account_name: this.accountName.toString(),
            head_block_num: 0,
            head_block_time: '2020-01-01T00:00:00.000',
        }
     }

    async addPermission(permission: Permission): Promise<void> {
        // Add permission here..
    }

    async removePermission(permission: Permission): Promise<void> {
        // Remove permission here..
    }

    async updatePermission(permission: Permission): Promise<void> {
        // Update permission here..
    }

    async addPermissionKey(permission: Permission, key: string): Promise<void> {
        // Add permission key here..
    }

    async removePermissionKey(permission: Permission, key: string): Promise<void> {
        // Remove permission key here..
    }

    async addPermissionAccount(permission: Permission, account: Account): Promise<void> {
        // Add permission account here..
    }

    async removePermissionAccount(permission: Permission, account: Account): Promise<void> {
        // Remove permission account here..
    }

    async addPermissionWait(permission: Permission, wait: number): Promise<void> {
        // Add permission wait here..
    }

    async removePermissionWait(permission: Permission, wait: number): void {
        // Remove permission wait here..
    }

}
