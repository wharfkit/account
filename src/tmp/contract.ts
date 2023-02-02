import {
    ABISerializableObject,
    Action,
    AnyAction,
    Checksum256,
    Name,
    NameType,
    PermissionLevel,
    PrivateKey,
} from '@greymass/eosio'

import {Session, TransactArgs, TransactResult, WalletPluginPrivateKey} from '@wharfkit/session'

// TODO: move this to core
export function isABISerializableObject(value: any): value is ABISerializableObject {
    return value.constructor && typeof value.constructor.abiName === 'string'
}

function mockFetch(data) {
    return Promise.resolve({
        json: () => Promise.resolve(data),
        text: () => Promise.resolve(JSON.stringify(data)),
    })
}

// TODO: Remove this mock session once a real one exists
const mockSession = new Session({
    broadcast: false, // Disable broadcasting by default for tests, enable when required.
    chain: {
        id: '73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d',
        url: 'https://jungle4.greymass.com',
    },
    permissionLevel: PermissionLevel.from('foo@active'),
    walletPlugin: new WalletPluginPrivateKey({
        privateKey: PrivateKey.from('5Jtoxgny5tT7NiNFp1MLogviuPJ9NniWjnU4wKzaX4t7pL4kJ8s'),
    }),
    fetch: mockFetch,
})

export class Contract {
    /** Account where contract is deployed. */
    static account: Name

    private static _shared: Contract | null = null
    private static _session: Session | null = null

    /** Shared instance of the contract. */
    static shared<T extends {new ()}>(this: T): InstanceType<T> {
        const self = this as unknown as typeof Contract
        if (!self._shared) {
            self._shared = new self()
        }
        return self._shared as InstanceType<T>
    }

    /** Account where contract is deployed. */
    get account() {
        return (this.constructor as typeof Contract).account
    }

    /** Call a contract action. */
    async call(name: NameType, data: ABISerializableObject | {[key: string]: any}) {
        let action: Action
        if (isABISerializableObject(data)) {
            action = Action.from({
                account: this.account,
                name,
                authorization: [],
                data,
            })

            return mockSession.transact(
                {
                    action,
                },
                {broadcast: false}
            )
        } else {
            // TODO: here we need to fetch the ABI and construct the action
            throw new Error('Not implemented')
        }
        // TODO: resolve session and transact
        throw new Error('Not implemented')
    }

    /** Generate a contract action. */

    async getAction(
        name: NameType,
        data: ABISerializableObject | {[key: string]: any}
    ): Promise<Action> {
        let action: Action
        if (isABISerializableObject(data)) {
            action = Action.from({
                account: this.account,
                name,
                authorization: [],
                data,
            })
        } else {
            // TODO: here we need to fetch the ABI and construct the action
            throw new Error('Not implemented')
        }
        // TODO: resolve session and transact
        throw new Error('Not implemented')
    }
}
