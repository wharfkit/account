import { API, APIClient, Checksum256, Name, NameType, AssetType, Asset } from '@greymass/eosio'
import { ChainId, ChainName } from 'anchor-link'
import type { ChainIdType } from 'anchor-link'

import { PermissionActions } from './accounts/actions/permissions'
import { Permission } from './permissions'
import { ResourceActions } from './accounts/actions/resources'

// import type { Session } from '@wharfkit/session'

// Remove these when Contract and Session are used
interface Session {
    chainId?: ChainIdType
}

interface SessionTransactResult {
    id: Checksum256
}

interface Resources {
    cpu_available: number,
    cpu_used: number,
    net_available: number,
    net_used: number,
    ram_quota: number,
    ram_usage: number,
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

    async getResources(): Promise<Resources> {
        return new Promise((resolve, reject) => {
            this.getAccountData().then(accountData => {
                resolve({
                    net_available: Number(accountData.net_limit.available),
                    net_used: Number(accountData.net_limit.available),
                    cpu_available: Number(accountData.cpu_limit.available),
                    cpu_used: Number(accountData.cpu_limit.used),
                    ram_quota: Number(accountData.ram_quota),
                    ram_usage: Number(accountData.ram_usage),
                })
            })
                .catch(err => {
                    reject(err)
                })
        })
    }

    getBalance(contract: NameType = 'eosio.token', symbol?: Asset.SymbolType): Promise<Asset> {
        return new Promise((resolve, reject) => {
            this.api_client.v1.chain
                .get_currency_balance(contract, String(this.accountName), symbol && String(symbol))
                .then(balances => {
                    const balance = (balances as any)[0]

                    if (!balance) {
                        reject(new Error(`No balance found for ${symbol} token of ${contract} contract on chain ${ChainName[this.chain_id.chainName]}.`))
                    }

                    resolve(balance)
                })
                .catch(err => {
                    if (err.message.includes('No data') || err.message.includes('Account Query Exception')) {
                        reject(new Error(`Token contract ${contract} does not exist on chain ${ChainName[this.chain_id.chainName]}.`))
                    }
                    reject(err)
                })
        })
    }

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
