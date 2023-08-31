import {
    API,
    Authority,
    AuthorityType,
    KeyWeight,
    Name,
    NameType,
    PermissionLevelType,
    PermissionLevelWeight,
    PublicKeyType,
    UInt32Type,
    WaitWeight,
} from '@wharfkit/antelope'

import type {Session} from '@wharfkit/session'
import type {Account} from './account'

export interface PermissionData {
    account: NameType
    parent: NameType
    permission: NameType
    auth: AuthorityType | Authority
    authorized_by: NameType
}

export interface AddKeyActionParam {
    permission: Permission
    key: string
}

export interface ActionData {
    account: NameType
    parent: NameType
    permission: NameType
    auth: Authority
    authorized_by: NameType
}

export class Permission {
    permission_name: Name
    permission_data: PermissionData

    constructor(permissionName: NameType, permissionData: PermissionData) {
        this.permission_name = Name.from(permissionName)
        this.permission_data = permissionData
    }

    get permissionName(): Name {
        return this.permission_name
    }

    get actionData(): ActionData {
        return {
            ...this.permission_data,
            auth: Authority.from({
                keys: this.permission_data.auth?.keys?.map(({key, weight}) => {
                    return {
                        key: String(key),
                        weight: Number(weight),
                    }
                }),
                accounts: this.permission_data.auth?.accounts?.map(({permission, weight}) => ({
                    permission: {
                        actor: String(permission.actor),
                        permission: String(permission.permission),
                    },
                    weight: Number(weight),
                })),
                waits: this.permission_data.auth?.waits?.map(({wait_sec, weight}) => ({
                    wait_sec: Number(wait_sec),
                    weight: Number(weight),
                })),
                threshold: Number(this.permission_data.auth?.threshold),
            }),
        }
    }

    addKey(key: PublicKeyType, weight = 1): void {
        this.permission_data = {
            ...this.permission_data,
            auth: Authority.from({
                ...(this.permission_data.auth || {}),
                keys: [
                    ...(this.permission_data.auth?.keys || []),
                    KeyWeight.from({
                        key: key,
                        weight: weight,
                    }),
                ],
            }),
        }
    }

    removeKey(key: PublicKeyType): void {
        this.permission_data = {
            ...this.permission_data,
            auth: Authority.from({
                ...this.permission_data.auth,
                keys: this.permission_data.auth?.keys?.filter((keyWeight: {key: PublicKeyType}) => {
                    return String(keyWeight.key) !== key
                }),
            }),
        }
    }

    addAccount(accountPermission: {actor: NameType; permission: NameType}, weight = 1): void {
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
                ],
            }),
        }
    }

    removeAccount(account: NameType): void {
        this.permission_data = {
            ...this.permission_data,
            auth: Authority.from({
                ...this.permission_data.auth,
                accounts: this.permission_data.auth?.accounts?.filter(
                    (permissionWeight: {permission: PermissionLevelType}) => {
                        return String(permissionWeight.permission?.actor) !== account
                    }
                ),
            }),
        }
    }

    addWait(wait_sec: number, weight = 1): void {
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
                ],
            }),
        }
    }

    removeWait(wait_sec: UInt32Type): void {
        this.permission_data = {
            ...this.permission_data,
            auth: Authority.from({
                ...this.permission_data.auth,
                waits: this.permission_data.auth?.waits?.filter(
                    (waitWeight: {wait_sec: number; weight: number}) => {
                        return Number(waitWeight.wait_sec) !== wait_sec
                    }
                ),
            }),
        }
    }
}