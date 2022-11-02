import type { AccountData } from '../types'

export class Permission {
    account_data: AccountData
    permissionName: string

    constructor(permissionName: string, accountData: AccountData) {
        this.account_data = accountData
        this.permissionName = permissionName
    }

    static from(permissionName: string, accountData: AccountData): Permission {
        return new Permission(permissionName, accountData)
    }


}
