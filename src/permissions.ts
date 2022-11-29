import {KeyWeight, PermissionLevelWeight, WaitWeight, Authority, Name, NameType, PublicKeyType, UInt32Type} from '@greymass/eosio'
import {API} from '@greymass/eosio'

import type {Account} from './accounts'

interface Session {
    [key: string]: any;
}

type PermissionParams = { permissionName: NameType, accountData: API.v1.AccountObject } | PermissionData

interface PermissionData {
    account: NameType
    parent: NameType
    permission: NameType
    auth: Authority
    authorized_by?: NameType
}

function instanceOfPermissionData(object: any): object is PermissionData {
    return 'account' in object;
}

interface ActionParam {
    session: Session;
    account: Account;
}

interface AddKeyActionParam {
    permission: Permission;
    key: string;
}

export class Permission {
    permission_name: Name
    permission_data: PermissionData

    constructor(
        permissionName: Name,
        permissionData: PermissionData,
    ) {
        this.permission_name = permissionName
        this.permission_data = permissionData
    }

    static from(permissionParams: PermissionParams) : Permission {
        if (instanceOfPermissionData(permissionParams)) {
            return new Permission(Name.from(permissionParams.permission), permissionParams)
        }

        const {permissionName, accountData} = permissionParams;

        const permissionObject = accountData.getPermission(permissionName)

        if (!permissionObject) {
            throw new Error(
                `Permission ${permissionName} does not exist on account ${accountData.account_name}`
            )
        }

        return new Permission(Name.from(permissionName), {
            account: accountData.account_name,
            parent: permissionObject.parent,
            permission: permissionObject.perm_name,
            auth: permissionObject.required_auth,
        })
    }

    get permissionName(): Name {
        return this.permission_name
    }

    get actionParams() : PermissionData {
        return this.permission_data;
    }

    addKey(key: PublicKeyType, weight: number = 1): void {
       this.permission_data = {
            ...this.permission_data,
            auth: Authority.from({
                ...this.permission_data.auth,
                keys: [
                    ...(this.permission_data.auth.keys || []),
                    KeyWeight.from({
                        key: key,
                        weight: weight,
                    }),
                ]
            })
        };
    }
    
    removeKey(key: PublicKeyType): void {
        this.permission_data = {
            ...this.permission_data,
            auth: Authority.from({
                ...this.permission_data.auth,
                keys: this.permission_data.auth.keys.filter((keyWeight: KeyWeight) => {
                    return String(keyWeight.key) !== key;
                }),
            })
        };
    }
    
    addAccount(account: NameType, weight: number = 1): void {
        this.permission_data = {
            ...this.permission_data,
            auth: Authority.from({
                ...this.permission_data.auth,
                accounts: [
                    ...(this.permission_data.auth.accounts || []),
                    PermissionLevelWeight.from({
                        permission: account,
                        weight: weight,
                    }),
                ]
            })
        };
    }

    removeAccount(account: NameType): void {
        this.permission_data = {
            ...this.permission_data,
            auth: Authority.from({
                ...this.permission_data.auth,
                accounts: this.permission_data.auth.accounts.filter((permissionWeight: PermissionLevelWeight) => {
                    return String(permissionWeight.permission) !== account;
                }),
            })
        };
    }

    addWait(wait_sec: number, weight: number = 1): void {
        this.permission_data = {
            ...this.permission_data,
            auth: Authority.from({
                ...this.permission_data.auth,
                waits: [
                    ...(this.permission_data.auth.waits || []),
                    WaitWeight.from({
                        wait_sec: wait_sec,
                        weight: weight,
                    }),
                ]
            })
        };
    }

    removeWait(wait_sec: UInt32Type): void {
        this.permission_data = {
            ...this.permission_data,
            auth: Authority.from({
                ...this.permission_data.auth,
                waits: this.permission_data.auth.waits.filter((waitWeight: WaitWeight) => {
                    return waitWeight.wait_sec !== wait_sec;
                }),
            })
        };
    }
}
