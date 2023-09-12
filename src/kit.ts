import {APIClient, FetchProvider, Name, NameType} from '@wharfkit/antelope'
import {Contract} from '@wharfkit/contract'
import {ChainDefinition, ChainDefinitionType, Fetch} from '@wharfkit/common'

import {Account} from './account'

export interface AccountKitArgs {
    chain: ChainDefinitionType
    contract?: Contract
    fetch?: Fetch
}

export class AccountKit {
    readonly chain: ChainDefinition
    readonly contract?: Contract
    readonly fetch?: Fetch

    constructor(args: AccountKitArgs) {
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

    async load(accountName: NameType): Promise<Account> {
        return new Account({
            chain: this.chain,
            contract: this.contract,
            data: await this.client.v1.chain.get_account(accountName),
            fetch: this.fetch,
        })
    }
}
