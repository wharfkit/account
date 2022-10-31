import type { AccountData } from '../types'

export class Permission {
    account_data: AccountData

    constructor(accountData: AccountData) {
        this.account_data = accountData
    }

    static from(accountData: AccountData): Permission {
        return new Permission(accountData)
    }
}
