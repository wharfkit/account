import {APIClient, Name, NameType} from '@wharfkit/antelope'
import {Contract} from '@wharfkit/contract'

import {Account} from './account'

export interface AccountKitArgs {
    client: APIClient
    contract?: Contract
}

export class AccountKit {
    readonly client: APIClient
    readonly contract?: Contract

    constructor(args: AccountKitArgs) {
        if (args.contract) {
            this.contract = args.contract
        }
        if (args.client) {
            this.client = args.client
        } else {
            throw new Error('A `client` must be passed when initializing the AccountKit.')
        }
    }

    async load(accountName: NameType): Promise<Account> {
        return new Account({
            client: this.client,
            contract: this.contract,
            data: await this.client.v1.chain.get_account(accountName),
        })
    }
}
