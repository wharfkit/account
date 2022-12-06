import { KeyWeight, PermissionLevelWeight, PermissionLevelType, WaitWeight, AuthorityType, Authority, Name, NameType, PublicKeyType, UInt32Type } from '@greymass/eosio'
import { API } from '@greymass/eosio'

import type { Account } from './accounts'

interface Session {
    [key: string]: any;
}

type PermissionParams = { permissionName: NameType, accountData: API.v1.AccountObject } | PermissionData

interface PermissionData {
    account: NameType
    parent: NameType
    permission: NameType
    auth: AuthorityType | Authority
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

interface ActionData {
    account: NameType;
    parent: NameType;
    permission: NameType;
    auth: AuthorityType;
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

    static from(permissionParams: PermissionParams): Permission {
        if (instanceOfPermissionData(permissionParams)) {
            return new Permission(Name.from(permissionParams.permission), {
                ...permissionParams,
                auth: Authority.from(permissionParams.auth),
            })
        }

        const { permissionName, accountData } = permissionParams;

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
            auth: Authority.from(permissionObject.required_auth),
        })
    }

    get permissionName(): Name {
        return this.permission_name
    }

    get actionData(): ActionData {
        return {
            ...this.permission_data,
            auth: {
                keys: this.permission_data.auth?.keys?.map(({ key, weight }) => {
                    return {
                        key: String(key),
                        weight: Number(weight),
                    }
                }),
                accounts: this.permission_data.auth?.accounts?.map(({ permission, weight }) => ({
                    permission: {
                        actor: String(permission.actor),
                        permission: String(permission.permission),
                    },
                    weight: Number(weight),
                })),
                waits: this.permission_data.auth?.waits?.map(({ wait_sec, weight }) => ({
                    wait_sec: Number(wait_sec),
                    weight: Number(weight),
                })),
                threshold: Number(this.permission_data.auth?.threshold),
            }
        }
    }

    addKey(key: PublicKeyType, weight: number = 1): void {
        this.permission_data = {
            ...this.permission_data,
            auth: Authority.from({
                ...this.permission_data.auth || {},
                keys: [
                    ...(this.permission_data.auth?.keys || []),
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
                keys: this.permission_data.auth?.keys?.filter((keyWeight: { key: PublicKeyType }) => {
                    return String(keyWeight.key) !== key;
                }),
            })
        };
    }

    addAccount(accountPermission: { actor: NameType, permission: NameType }, weight: number = 1): void {
        this.permission_data = {
            ...this.permission_data,
            auth: Authority.from({
                ...this.permission_data.auth,
                accounts: [
                    ...(this.permission_data.auth.accounts || []),
                    PermissionLevelWeight.from({
                        permission: {
                            actor: accountPermission.actor,
                            permission: accountPermission.permission,
                        },
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
                accounts: this.permission_data.auth?.accounts?.filter((permissionWeight: { permission: PermissionLevelType }) => {
                    return String(permissionWeight.permission?.actor) !== account;
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
                waits: this.permission_data.auth?.waits?.filter((waitWeight: { wait_sec: number, weight: number }) => {
                    return Number(waitWeight.wait_sec) !== wait_sec;
                }),
            })
        };
    }
}
