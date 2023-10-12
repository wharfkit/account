import {API, APIClient, NameType} from '@wharfkit/antelope'
import {Contract} from '@wharfkit/contract'

import {Account} from './account'
import {TelosAccountObject, WAXAccountObject} from './types'
​
export interface ChainDefinition<ResponseType extends API.v1.AccountObject = any> {
   id: string
   url: string
   dataType?: typeof API.v1.AccountObject
}
​
export namespace Chains {
    export const EOS: ChainDefinition<API.v1.AccountObject> = {
        id: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
        url: 'https://eos.greymass.com',
        dataType: API.v1.AccountObject,
    }
    export const Jungle4: ChainDefinition<API.v1.AccountObject> = {
        id: '73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d',
        url: 'https://jungle4.greymass.com',
        dataType: API.v1.AccountObject,
    }
    export const Telos: ChainDefinition<TelosAccountObject> = {
        id: '1eaa0824707c8c16bd25145493bf062aecddfeb56c736f6ba6397f3195f33c9f',
        url: 'https://telos.greymass.com',
        dataType: TelosAccountObject,
    }
    export const TelosTestnet: ChainDefinition<TelosAccountObject> = {
        id: '1eaa0824707c8c16bd25145493bf062aecddfeb56c736f6ba6397f3195f33c9f',
        url: 'http://test.telos.eosusa.io',
        dataType: TelosAccountObject,
    }
    export const WAX: ChainDefinition<WAXAccountObject> = {
        id: '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4',
        url: 'https://wax.greymass.com',
        dataType: WAXAccountObject,
    }
    export const WAXTestnet: ChainDefinition<WAXAccountObject> = {
        id: 'f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12',
        url: 'https://testnet.waxsweden.org',
        dataType: WAXAccountObject,
    }
}

interface AccountKitOptions {
    contract?: Contract
    client?: APIClient
}

export class AccountKit<DataType extends API.v1.AccountObject = API.v1.AccountObject> {
    readonly chain: ChainDefinition
    readonly client: APIClient
    readonly contract?: Contract

    constructor(chain: ChainDefinition<DataType>, options?: AccountKitOptions) {
        this.chain = chain
        this.contract = options?.contract
        this.client = options?.client || new APIClient({ url: this.chain.url })
    }

    async load(accountName: NameType): Promise<Account<DataType>> {
        const data = await this.client.v1.chain.get_account(accountName, this.chain.dataType)

        return new Account<DataType>({
            client: this.client,
            contract: this.contract,
            data: data as DataType,
        })
    }
}
