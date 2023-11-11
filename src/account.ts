import {
    Action,
    API,
    APIClient,
    Asset,
    AssetType,
    Name,
    NameType,
    UInt32Type,
} from '@wharfkit/antelope'
import {Contract} from '@wharfkit/contract'
import {Resources} from '@wharfkit/resources'
import {Token} from '@wharfkit/token'

import {Permission} from './permission'
import * as SystemContract from './contracts/eosio'
import {Resource, ResourceType} from './resource'

export interface AccountArgs<Data extends API.v1.AccountObject = API.v1.AccountObject> {
    client: APIClient
    contract?: Contract
    data: Data
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

export class Account<Data extends API.v1.AccountObject = API.v1.AccountObject> {
    readonly data: Data
    readonly systemContract: SystemContract.Contract
    readonly client: APIClient
    readonly token: Token

    constructor(args: AccountArgs<Data>) {
        this.data = args.data
        if (args.contract) {
            this.systemContract = args.contract
        } else {
            this.systemContract = new SystemContract.Contract({client: args.client})
        }
        this.client = args.client
        this.token = new Token({client: args.client})
    }

    get accountName() {
        return Name.from(this.data.account_name)
    }

    get systemToken() {
        return Asset.Symbol.from(this.data.total_resources.cpu_weight.symbol)
    }

    balance(symbol?: Asset.SymbolType) {
        return this.token.balance(this.accountName, symbol)
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
