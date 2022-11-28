import {APIClient, Authority, Name, NameType} from '@greymass/eosio'
import {API} from '@greymass/eosio'

import { PermissionActions } from './accounts/actions/permissions'

import type {Account} from './accounts'

interface Session {
    [key: string]: any;
}

type PermissionParams = { permissionName: NameType, accountData: API.v1.AccountObject } | API.v1.AccountPermission

interface PermissionActionData {
    parent: string
    permission: NameType
    account: NameType
    auth: Authority
    authorized_by: NameType
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
    permission_data: API.v1.AccountPermission

    constructor(
        permissionName: Name,
        permissionData: API.v1.AccountPermission,
    ) {
        this.permission_name = permissionName
        this.permission_data = permissionData
    }

    static from(permissionParams: PermissionParams) : Permission {
        if (permissionParams instanceof API.v1.AccountPermission) {
            return new Permission(permissionParams.perm_name, permissionParams)
        }

        const {permissionName, accountData} = permissionParams;

        const permissionObject = accountData.getPermission(permissionName)

        if (!permissionObject) {
            throw new Error(
                `Permission ${permissionName} does not exist on account ${accountData.account_name}`
            )
        }

        return new Permission(Name.from(permissionName), permissionObject)
    }

    get permissionName(): Name {
        return this.permission_name
    }

    // These methods will generate the transaction and pass it to the session SDK for signing.

    static updatePermission(permissionData: PermissionActionData, { session, account }: ActionParam): Promise<void> {
        return PermissionActions.updateauth(permissionData, { session, account });
        // or
        // return session.transact(PermissionActions.updateauth(addPermissionAction), account)
    }

    static removePermission(permissionName: Name, { session, account }: ActionParam): Promise<void> {
        return PermissionActions.deleteAuth({
            account: account.accountName,
            permission: permissionName,
        }, { session, account });
    }

    static addPermissionKey({ permission, key } : AddKeyActionParam, { session, account }: ActionParam): Promise<void> {
        return PermissionActions.updateauth({
            permission: permission.permissionName,
            auth: {
                keys: [
                    ...permission.permission_data.required_auth.keys,
                ]

            }
        }, { session, account });
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
