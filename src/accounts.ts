import {Name, APIClient, API, NameType} from '@greymass/eosio'
import {ChainId, ChainName} from 'anchor-link'
import type {ChainIdType} from 'anchor-link'

// import { Contract } from '@wharfkit/contract'

// import type { Session } from '@wharfkit/session'

// Remove these when Contract and Session are used
interface Session {

}

interface Contract {

}

import { Permission } from './permissions'

export interface AccountOptions {
    cache_duration?: number
    session?: Session
    api_client?: APIClient
}

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
        // this.contract = new Contract(chainId, this, options?.session)
        this.cache_duration = options?.cache_duration || this.cache_duration
     }

     static from(accountName: NameType, chain: ChainIdType, options?: AccountOptions): Account {
        return new Account(Name.from(accountName), ChainId.from(chain), options)
     }

     get accountName(): Name {
        return this.account_name
     }

     get chainId(): ChainId {
        return this.chain_id
     }

     async getPermission(permissionName: NameType): Promise<Permission | undefined> {
        const accountData = await this.getAccountData()

         return Permission.from(permissionName, accountData)
     }

    // addPermission(permissionData: PermissionType): Promise<void> {
    //     Permission.addPermission(permissionData, this)
    // }
    //
    // async removePermission(permission: Permission): Promise<void> {
    //     // Remove permission here..
    // }
    //
    // async updatePermission(permission: Permission): Promise<void> {
    //     // Update permission here..
    // }
    //
    // async addPermissionKey(permission: Permission, key: string): Promise<void> {
    //     // Add permission key here..
    // }
    //
    // async removePermissionKey(permission: Permission, key: string): Promise<void> {
    //     // Remove permission key here..
    // }
    //
    // async addPermissionAccount(permission: Permission, account: Account): Promise<void> {
    //     // Add permission account here..
    // }
    //
    // async removePermissionAccount(permission: Permission, account: Account): Promise<void> {
    //     // Remove permission account here..
    // }
    //
    // async addPermissionWait(permission: Permission, wait: number): Promise<void> {
    //     // Add permission wait here..
    // }
    //
    // async removePermissionWait(permission: Permission, wait: number): Promise<void> {
    //     // Remove permission wait here..
    // }

    getAccountData(): Promise<API.v1.AccountObject> {
        return new Promise((resolve, reject) => {
            if (this.account_data && this.account_data_timestamp && this.account_data_timestamp + this.cache_duration > Date.now()) {
                return resolve(this.account_data)
            }

            this.api_client.v1.chain.get_account(this.accountName.toString())
                .then(accountData => {
                    this.account_data = accountData;
                    this.account_data_timestamp = Date.now();
                    resolve(accountData)
                })
                .catch(error => {
                    if (error.message.includes('Account not found')) {
                        return reject(new Error(`Account ${this.account_name} does not exist on chain ${ChainName[this.chain_id.chainName]}.`))
                    }
                    reject(error)
                });
        });
    }
}
