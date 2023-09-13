import {API, APIClient, Checksum256, FetchProvider, Name, NameType} from '@wharfkit/antelope'
import {Contract} from '@wharfkit/contract'
import {ChainDefinition, ChainDefinitionType, Chains, Fetch} from '@wharfkit/common'

import {Account} from './account'
import {TelosAccountObject, WAXAccountObject} from './types'

export interface AccountKitArgs<ChainId> {
    chain: ChainDefinitionType | {id: ChainId }
    contract?: Contract
    fetch?: Fetch
}

type AccountResponseTypeMapping = {
    'default': API.v1.AccountObject,
    '1eaa0824707c8c16bd25145493bf062aecddfeb56c736f6ba6397f3195f33c9f': TelosAccountObject,
    '4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11': TelosAccountObject,
    'f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12': WAXAccountObject
    '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4': WAXAccountObject,
    // Add other chain types here
};

type AccountResponseType<T extends keyof AccountResponseTypeMapping> = AccountResponseTypeMapping[T];

export class AccountKit<ChainId extends keyof AccountResponseTypeMapping = 'default'> {
    readonly chain: ChainDefinition
    readonly contract?: Contract
    readonly fetch?: Fetch

    constructor(args: AccountKitArgs<ChainId>) {
        this.fetch = args.fetch
        if (!args.chain) {
            throw new Error(
                'A `chain` (ChainDefinition) must be passed when initializing the AccountKit.'
            )
        }
        this.chain = ChainDefinition.from(args.chain)
        if (args.contract) {
            this.contract = args.contract
        }
    }

    get client() {
        const provider = new FetchProvider(this.chain.url, {fetch: this.fetch})
        return new APIClient({provider})
    }

    async get_account(
        accountName: NameType,
        chainId: ChainId
    ): Promise<AccountResponseType<ChainId>> {
        let responseType = API.v1.AccountObject
        switch (chainId) {
            case String(Chains.Telos.id): {
                responseType = TelosAccountObject
                break
            }
            case String(Chains.WAX.id): {
                responseType = WAXAccountObject
                break
            }
        }
        return this.client.call({
            path: '/v1/chain/get_account',
            params: {account_name: Name.from(accountName)},
            responseType,
        }) as Promise<AccountResponseType<ChainId>>
    }

    async load(accountName: NameType) {
        const data = await this.get_account(
            accountName,
            String(this.chain.id) as ChainId
        )
        return new Account<AccountResponseType<ChainId>>({
            chain: this.chain,
            contract: this.contract,
            data,
            fetch: this.fetch,
        })
    }
}
