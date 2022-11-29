import {KeyWeight, Authority, Name, NameType} from '@greymass/eosio'
import {API} from '@greymass/eosio'

import type {Account} from './accounts'
import {Struct} from "@greymass/eosio/src/chain";

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

    addKey( key: string, weight?: number): void {
       this.permission_data = {
        ...this.permission_data,
        auth: {
            ...this.permission_data.auth,
            keys: [
                ...(this.permission_data.auth.keys.map((keyWeight: KeyWeight) => KeyWeight.from({
                    key: keyWeight.key,
                    weight: keyWeight.weight,
                })) || []),
                KeyWeight.from({
                    key: key,
                    weight: weight || 1,
                }),
            ]
        }
    };
    }

    //
    // async removePermissionKeyAction(permission: Permission, key: string): Promise<void> {
    //     // Remove permission key here..
    // }
    //
    // async addPermissionAccountAction(permission: Permission, account: Account): Promise<void> {
    //     // Add permission account here..
    // }
    //
    // async removePermissionAccountAction(permission: Permission, account: Account): Promise<void> {
    //     // Remove permission account here..
    // }
    //
    // async addPermissionWaitAction(permission: Permission, wait: number): Promise<void> {
    //     // Add permission wait here..
    // }
    //
    // async removePermissionWaitAction(permission: Permission, wait: number): Promise<void> {
    //     // Remove permission wait here..
    // }
}
