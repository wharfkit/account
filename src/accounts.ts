import {Name, APIClient, API, NameType} from '@greymass/eosio'
import { ChainId } from 'anchor-link'
import { Contract } from '@wharfkit/contract'

import { Permission } from './accounts/permissions'

import type { AccountOptions } from './types'
import {SigningRequest} from "eosio-signing-request";

export class Account {
    account_name: Name
    chain_id: ChainId
    api_client: APIClient
    account_data: API.v1.AccountObject | undefined
    account_data_timestamp: number | undefined
    contract: Contract | undefined
    cache_duration: number = 1000 * 60 * 5 // 5 minutes

     constructor(accountName: Name, chainId: ChainId, options?: AccountOptions) {
        this.account_name = accountName
        this.chain_id = chainId
        this.api_client = new APIClient({
            url: 'https://eos.greymass.com', // This should be looked up with the chainId
        });
        this.contract = new Contract(chainId, this, options?.session)
        this.cache_duration = options?.cache_duration || this.cache_duration
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

     addPermission(permissionData: PermissionType): Promise<void> {
        Permission.addPermission(permissionData, this)
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
}
