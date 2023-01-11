import {
    ABISerializableObject,
    Action,
    AnyAction,
    Checksum256,
    Name,
    NameType,
} from '@greymass/eosio'

// stubs for session kit
interface Session {
    transact(SessionTransactArgs: any): Promise<SessionTransactResult>
}
interface SessionTransactArgs {
    actions: AnyAction[]
}
export interface SessionTransactResult {
    id: Checksum256
}

// TODO: move this to core
export function isABISerializableObject(value: any): value is ABISerializableObject {
    return value.constructor && typeof value.constructor.abiName === 'string'
}

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
    async call(
        name: NameType,
        data: ABISerializableObject | {[key: string]: any}
    ): Promise<SessionTransactResult> {
        let action: Action
        if (isABISerializableObject(data)) {
            action = Action.from({
                account: this.account,
                name,
                authorization: [],
                data,
            })

            return {id: Checksum256.from('random_id')}
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
