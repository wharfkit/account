import {
    Action,
    API,
    APIClient,
    Asset,
    AssetType,
    FetchProvider,
    Name,
    NameType,
    UInt32Type,
} from '@wharfkit/antelope'
import {Contract} from '@wharfkit/contract'
import {ChainDefinition, ChainDefinitionType, Fetch} from '@wharfkit/common'
import {Resources} from '@wharfkit/resources'

import {Permission} from './permission'
import * as SystemContract from './contracts/eosio'
import {Resource, ResourceType} from './resource'
import {AccountData, TelosAccountObject, WAXAccountObject} from './types'

export interface AccountArgs {
    chain: ChainDefinitionType
    contract?: Contract
    data: API.v1.AccountObject
    fetch?: Fetch
}

export interface BuyramOptions {
    receiver?: NameType
}

export interface DelegateOptions {
    from?: NameType
    receiver?: NameType
    cpu?: AssetType
    net?: AssetType
    transfer?: boolean
}

export interface UndelegateOptions {
    from?: NameType
    receiver?: NameType
    cpu?: AssetType
    net?: AssetType
}

export class Account {
    readonly data: API.v1.AccountObject | TelosAccountObject | WAXAccountObject
    readonly systemContract: SystemContract.Contract
    readonly chain: ChainDefinition
    readonly fetch: Fetch | undefined

    constructor(args: AccountArgs) {
        this.chain = ChainDefinition.from(args.chain)
        this.data = args.data
        this.fetch = args.fetch
        if (args.contract) {
            this.systemContract = args.contract
        } else {
            this.systemContract = new SystemContract.Contract({client: this.client})
        }
    }

    get accountName() {
        return Name.from(this.data.account_name)
    }

    get client() {
        const provider = new FetchProvider(this.chain.url, {fetch: this.fetch})
        return new APIClient({provider})
    }

    get systemToken() {
        return Asset.Symbol.from(this.data.total_resources.cpu_weight.symbol)
    }

    balance(contract: NameType = 'eosio.token', symbol?: Asset.SymbolType): Promise<Asset> {
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

    permission(permissionName: NameType): Permission {
        const permission = this.data.permissions.find((permission) =>
            permission.perm_name.equals(permissionName)
        )

        if (!permission) {
            throw new Error(
                `Permission ${permissionName} does not exist on account ${this.accountName}.`
            )
        }

        return Permission.from(permission)
    }

    resource(resourceType: ResourceType): Resource {
        return new Resource(resourceType, this.data)
    }

    // TODO: Refactor once resources library is updated
    resources(sampleAccount?: NameType) {
        // Returns an instance of the @wharfkit/resources library
        //   configured for this blockchain/account
        return new Resources({
            api: this.client,
            sampleAccount: sampleAccount ? String(sampleAccount) : undefined,
            symbol: this.data.core_liquid_balance
                ? String(this.data.core_liquid_balance.symbol)
                : undefined,
        })
    }

    setPermission(permission: Permission): Action {
        return this.systemContract.action('updateauth', {
            account: this.accountName,
            auth: permission.required_auth,
            authorized_by: '',
            parent: permission.parent,
            permission: permission.perm_name,
        })
    }

    removePermission(permissionName: NameType): Action {
        return this.systemContract.action('deleteauth', {
            account: this.accountName,
            authorized_by: '',
            permission: permissionName,
        })
    }

    linkauth(contract: NameType, action: NameType, requiredPermission: NameType): Action {
        return this.systemContract.action('linkauth', {
            account: this.accountName,
            code: contract,
            type: action,
            requirement: requiredPermission,
            authorized_by: '',
        })
    }

    unlinkauth(contract: NameType, action: NameType): Action {
        return this.systemContract.action('unlinkauth', {
            account: this.accountName,
            code: contract,
            type: action,
            authorized_by: '',
        })
    }

    buyRam(amount: AssetType, options?: BuyramOptions): Action {
        let receiver = this.accountName
        if (options && options.receiver) {
            receiver = Name.from(options.receiver)
        }
        return this.systemContract.action('buyram', {
            payer: this.accountName,
            quant: amount,
            receiver,
        })
    }

    buyRamBytes(bytes: UInt32Type, options?: BuyramOptions): Action {
        let receiver = this.accountName
        if (options && options.receiver) {
            receiver = Name.from(options.receiver)
        }
        return this.systemContract.action('buyrambytes', {
            bytes,
            payer: this.accountName,
            receiver,
        })
    }

    sellRam(bytes: UInt32Type): Action {
        return this.systemContract.action('sellram', {
            account: this.accountName,
            bytes,
        })
    }

    delegate(value: DelegateOptions): Action {
        return this.systemContract.action('delegatebw', {
            from: value.from || this.accountName,
            receiver: value.receiver || this.accountName,
            stake_cpu_quantity: value.cpu || Asset.fromUnits(0, this.systemToken),
            stake_net_quantity: value.net || Asset.fromUnits(0, this.systemToken),
            transfer: value.transfer !== undefined ? value.transfer : false,
        })
    }

    undelegate(value: UndelegateOptions): Action {
        return this.systemContract.action('undelegatebw', {
            from: value.from || this.accountName,
            receiver: value.receiver || this.accountName,
            unstake_cpu_quantity: value.cpu || Asset.fromUnits(0, this.systemToken),
            unstake_net_quantity: value.net || Asset.fromUnits(0, this.systemToken),
        })
    }
}
