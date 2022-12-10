import { API, APIClient, Checksum256, Name, NameType, AssetType, Action, Asset } from '@greymass/eosio'
import { ChainId, ChainName } from 'anchor-link'
import type { ChainIdType } from 'anchor-link'

import { PermissionActions } from './accounts/actions/permissions'
import { Permission } from './permissions'
import { Resources } from './resources'
import { ResourceActions } from './accounts/actions/resources'

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
        return this.account_name
    }

    get chainId(): ChainId {
        return this.chain_id
    }

    async getPermission(permissionName: NameType): Promise<Permission | undefined> {
        const accountData = await this.getAccountData()

        return Permission.from({ permissionName, accountData })
    }

    updatePermission(permission: Permission, { session }: { session: Session }): Promise<SessionTransactResult> {
        return PermissionActions.shared().updateAuth(permission.actionData, { account: this, session })
    }

    removePermission(permissionName: NameType, { session }: { session: Session }): Promise<SessionTransactResult> {
        return PermissionActions.shared().deleteAuth(Name.from(permissionName), Name.from(this.account_name), { account: this, session })
    }

    buyRam(amount: AssetType, { session }: { session: Session }): Promise<SessionTransactResult> {
        return ResourceActions.shared().buyRam(this.accountName, this.accountName, amount, { account: this, session })
    }

    buyRamBytes(bytes: number, { session }: { session: Session }): Promise<SessionTransactResult> {
        return ResourceActions.shared().buyRamBytes(this.accountName, this.accountName, bytes, { account: this, session })
    }

    sellRam(bytes: number, { session }: { session: Session }): Promise<SessionTransactResult> {
        return ResourceActions.shared().sellRam(this.accountName, bytes, { account: this, session })
    }

    delegateResources(cpu: AssetType, net: AssetType, transfer: boolean, { session }: { session: Session }): Promise<SessionTransactResult> {
        return ResourceActions.shared().delegateResources(this.accountName, this.accountName, net, cpu, transfer, { account: this, session })
    }

    undelegateResources(cpu: AssetType, net: AssetType, { session }: { session: Session }): Promise<SessionTransactResult> {
        return ResourceActions.shared().undelegateResources(this.accountName, this.accountName, cpu, net, { account: this, session })
    }

    async updateResources(resources: Resources, { session }: { session: Session }): Promise<void> {
        const {
            ram_to_buy,
            ram_to_sell,
            cpu_to_stake,
            cpu_to_unstake,
            net_to_stake,
            net_to_unstake,
        } = resources.desiredResourceChanges

        const actionsToExecute: Action[] = []

        ram_to_buy && actionsToExecute.push(await ResourceActions.shared().buyRamBytesAction(this.accountName, this.accountName, Number(ram_to_buy), { account: this, session }))
        ram_to_sell && actionsToExecute.push(await ResourceActions.shared().sellRamAction(this.accountName, Number(ram_to_sell), { account: this, session }))
        cpu_to_stake || net_to_stake && actionsToExecute.push(await ResourceActions.shared().delegateResourcesAction(this.accountName, this.accountName, String(net_to_stake), String(cpu_to_stake), false, { account: this, session }))
        cpu_to_unstake || net_to_unstake && actionsToExecute.push(await ResourceActions.shared().undelegateResourcesAction(this.accountName, this.accountName, String(net_to_unstake), String(cpu_to_unstake), { account: this, session }))

        // Execute all actions here

        // const transactionId = session.transact(actionsToExecute, { broadcast: true, blocksBehind: 3, expireSeconds: 30 })

        // return transactionId
    }

    getAccountData(): Promise<API.v1.AccountObject> {
        return new Promise((resolve, reject) => {
            if (
                this.account_data &&
                this.account_data_timestamp &&
                this.account_data_timestamp + this.cache_duration > Date.now()
            ) {
                console.log('Using cached account data')
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
                                `Account ${this.account_name} does not exist on chain ${ChainName[this.chain_id.chainName]
                                }.`
                            )
                        )
                    }
                    reject(error)
                })
        })
    }
}
