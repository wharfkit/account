import {API, APIClient, NameType} from '@wharfkit/antelope'
import {Contract} from '@wharfkit/contract'
import {ChainDefinition} from '@wharfkit/common'

import {Account} from './account'

interface AccountKitOptions {
    contract?: Contract
    client?: APIClient
}

export class AccountKit<DataType extends API.v1.AccountObject = API.v1.AccountObject> {
    readonly chain: ChainDefinition<DataType>
    readonly client: APIClient
    readonly contract?: Contract

    constructor(chain: ChainDefinition<DataType>, options?: AccountKitOptions) {
        this.chain = chain
        this.contract = options?.contract
        this.client = options?.client || new APIClient({url: this.chain.url})
    }

    async load(accountName: NameType): Promise<Account<DataType>> {
        const data = await this.client.v1.chain.get_account(accountName, this.chain.accountDataType)

        return new Account<DataType>({
            client: this.client,
            contract: this.contract,
            data: data as DataType,
        })
    }
}
