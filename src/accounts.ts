import {API, APIClient, Checksum256, Name, NameType} from '@greymass/eosio'
import {ChainId, ChainName} from 'anchor-link'
import type {ChainIdType} from 'anchor-link'

import { PermissionActions } from './accounts/actions/permissions'
import { Permission } from './permissions'

// import type { Session } from '@wharfkit/session'

// Remove these when Contract and Session are used
interface Session {
    chainId?: ChainIdType
}

interface SessionTransactResult {
    id: Checksum256
}

export class Account {
    account_name: Name
    chain_id: ChainId
    api_client: APIClient
    account_data: API.v1.AccountObject | undefined
    account_data_timestamp: number | undefined
    // contract: Contract | undefined
    cache_duration: number = 1000 * 60 * 5 // 5 minutes

    constructor(accountName: Name, chainId: ChainId, apiClient: APIClient) {
        this.account_name = accountName
        this.chain_id = chainId
        this.api_client = apiClient
        // this.contract = new Contract(chainId, this, options?.session)
    }

    static from(accountName: NameType, chain: ChainIdType, apiClient: APIClient): Account {
        return new Account(Name.from(accountName), ChainId.from(chain), apiClient)
    }

    get accountName(): Name {
        return this.accountName
    }

    get chainId(): ChainId {
        return this.chainId
    }

    async getPermission(permissionName: NameType): Promise<Permission | undefined> {
        const accountData = await this.getAccountData()

        return Permission.from({ permissionName, accountData })
    }

    addPermission(permissionData, { session }): Promise<SessionTransactResult> {
        return PermissionActions.shared().updateAuth(permissionData, { account: this, session })
    }

    updatePermission(permission, { session }): Promise<SessionTransactResult> {
        return PermissionActions.shared().updateAuth(permission.permission_data, { account: this, session })
    }

    removePermission(permissionName: NameType, { session }): Promise<SessionTransactResult> {
        return PermissionActions.shared().deleteAuth(Name.from(permissionName), Name.from(this.account_name), { account: this, session })
    }

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
            if (
                this.account_data &&
                this.account_data_timestamp &&
                this.account_data_timestamp + this.cache_duration > Date.now()
            ) {
                return resolve(this.account_data)
            }

            this.api_client.v1.chain
                .get_account(String(this.accountName))
                .then((accountData) => {
                    this.account_data = accountData
                    this.account_data_timestamp = Date.now()
                    resolve(accountData)
                })
                .catch((error) => {
                    if (error.message.includes('Account not found')) {
                        return reject(
                            new Error(
                                `Account ${this.account_name} does not exist on chain ${
                                    ChainName[this.chain_id.chainName]
                                }.`
                            )
                        )
                    }
                    reject(error)
                })
        })
    }
}
