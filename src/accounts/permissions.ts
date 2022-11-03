import { Name, NameType } from '@greymass/eosio';

import type { AccountData } from '../types'

export class Permission {
    account_data: AccountData
    permissionName: Name

    constructor(permissionName: Name, accountData: AccountData) {
        this.account_data = accountData
        this.permissionName = permissionName
    }

    static from(permissionName: NameType, accountData: AccountData): Permission {
        return new Permission(Name.from(permissionName), accountData)
    }
}
