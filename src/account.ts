import {
    Action,
    API,
    APIClient,
    Asset,
    AssetType,
    Authority,
    Name,
    NameType,
} from '@wharfkit/antelope'

import {Permission} from './permission'
import {Eosio} from './contracts/eosio'

export interface AccountArgs {
    accountData: API.v1.AccountObject
    client: APIClient
}

export interface Resources {
    cpu_available: number
    cpu_used: number
    net_available: number
    net_used: number
    ram_quota: number
    ram_usage: number
}

export class Account {
    readonly account_data: API.v1.AccountObject
    readonly eosioContract: Eosio.Contract
    readonly client: APIClient

    constructor({ accountData, client }: AccountArgs) {
        this.account_data = accountData
        this.eosioContract = new Eosio.Contract({ client })
        this.client = client
    }

    get accountName() {
        return Name.from(this.account_data.account_name)
    }

    getPermission(permissionName: NameType): Permission {
        const permissionObject = this.account_data.permissions.find(
            (permission) => permission.perm_name.equals(permissionName)
        )

        if (!permissionObject) {
            throw new Error(
                `Permission ${permissionName} does not exist on account ${this.accountName}.`
            )
        }

        return new Permission(permissionName, {
            account: this.accountName,
            parent: permissionObject.parent,
            permission: permissionObject.perm_name,
            auth: Authority.from(permissionObject.required_auth),
            authorized_by: "............1",
        })
    }

    updatePermission(permission: Permission): Action {
        return this.eosioContract.action('updateauth', permission.actionData)
    }

    removePermission(permissionName: NameType): Action {
        return this.eosioContract.action('deleteauth', {
            account: "............1",
            authorized_by: "............1",
            permission: permissionName,
        })
    }

    buyRam(amount: AssetType): Action {
        return this.eosioContract.action('buyram', {
            payer: "............1",
            receiver: "............1",
            quant: amount,
        })
    }

    buyRamBytes(bytes: number): Action {
        return this.eosioContract.action('buyrambytes', {
            payer: "............1",
            receiver: "............1",
            bytes,
        })
    }

    sellRam(bytes: number): Action {
        return this.eosioContract.action('sellram', {
            account: "............1",
            bytes,
        })
    }

    delegateResources(cpu: AssetType, net: AssetType): Action {
        return this.eosioContract.action(
            'delegatebw',
            {
                from: "............1",
                receiver: "............1",
                stake_cpu_quantity: cpu,
                stake_net_quantity: net,
                transfer: false,
            }
        )
    }

    undelegateResources(cpu: AssetType, net: AssetType): Action {
        return this.eosioContract.action(
            'undelegatebw',
            {
                from: "............1",
                receiver: "............1",
                unstake_cpu_quantity: cpu,
                unstake_net_quantity: net,
            }
        )
    }

    getResources(): Resources {
        return {
            net_available: Number(this.account_data.net_limit.available),
            net_used: Number(this.account_data.net_limit.available),
            cpu_available: Number(this.account_data.cpu_limit.available),
            cpu_used: Number(this.account_data.cpu_limit.used),
            ram_quota: Number(this.account_data.ram_quota),
            ram_usage: Number(this.account_data.ram_usage),
        }
    }

    getBalance(contract: NameType = 'eosio.token', symbol?: Asset.SymbolType): Promise<Asset> {
        return new Promise((resolve, reject) => {
            this.client.v1.chain
                .get_currency_balance(contract, String(this.accountName), symbol && String(symbol))
                .then((balances) => {
                    const balance = (balances as any)[0]

                    if (!balance) {
                        reject(
                            new Error(
                                `No balance found for ${symbol} token of ${contract} contract.`
                            )
                        )
                    }

                    resolve(balance)
                })
                .catch((err) => {
                    if (
                        err.message.includes('No data') ||
                        err.message.includes('Account Query Exception')
                    ) {
                        reject(new Error(`Token contract ${contract} does not exist.`))
                    }
                    reject(err)
                })
        })
    }
}
