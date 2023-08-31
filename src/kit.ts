import {APIClient, Name, NameType} from '@wharfkit/antelope'
import {Account} from './account'

export interface AccountKitArgs {
    client: APIClient
}

export class AccountKit {
    readonly client: APIClient

    constructor(args: AccountKitArgs) {
        if (args.client) {
            this.client = args.client
        } else {
            throw new Error('A `client` must be passed when initializing the AccountKit.')
        }
    }

    /**
     * Load an Account by name from an API endpoint
     *
     * @param account The name of the account to load
     * @returns
     */
    async load(accountName: NameType): Promise<Account> {
        const account = Name.from(accountName)

        let accountData

        try {
            accountData = await this.client.v1.chain.get_account(account)
        } catch (error) {
            throw new Error(`Account ${account} does not exist`)
        }

        return new Account({
            accountData: accountData,
            client: this.client,
        })
    }
}
