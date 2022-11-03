import {Name, APIClient, API, NameType} from '@greymass/eosio'
import { ChainId } from 'anchor-link'

import { Permission } from './accounts/permissions'

import type { AccountOptions } from './types'

export class Account {
    chain_id: ChainId
    account_name: Name
    api_client: APIClient
    account_data: API.v1.AccountObject | undefined
    account_data_timestamp: number | undefined
    cache_duration: number = 1000 * 60 * 5 // 5 minutes

     constructor(accountName: Name, chainId: ChainId, options?: AccountOptions) {
        this.account_name = accountName
        this.chain_id = chainId
        this.api_client = new APIClient({
            url: 'https://eos.greymass.com', // This should be looked up with the chainId
        });
        this.cache_duration = options?.cacheDuration || this.cache_duration
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

     async getPermission(permissionName: NameType): Promise<Permission | undefined> {
        const accountData = await this.getAccountData()

         return Permission.from(permissionName, accountData)
     }

     addPermission(permission: Permission): Promise<void> {
        const permissionAction = Permission.addPermissionAction(permission)

        return this.signAndBroadcastAction(permissionAction)
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

    async removePermissionWait(permission: Permission, wait: number): Promise<void> {
        // Remove permission wait here..
    }

    getAccountData(): Promise<API.v1.AccountObject> {
        return new Promise((resolve, reject) => {
            if (this.account_data && this.account_data_timestamp && this.account_data_timestamp + this.cache_duration > Date.now()) {
                resolve(this.account_data)
            }

            this.api_client.v1.chain.get_account(this.accountName.toString())
                .then(accountData => {
                    this.account_data = accountData;
                    this.account_data_timestamp = Date.now();
                    resolve(accountData)
                })
                .catch(error => {
                    reject(error)
                });
        });
    }

    signAndBroadcastAction(action: API.v1.Action): Promise<API.v1.Transaction> {
        return new Promise((resolve, reject) => {
            // Use session kit to sign and broadcast the action
        });
    }
}
