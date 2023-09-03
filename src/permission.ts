import {
    API,
    Authority,
    AuthorityType,
    isInstanceOf,
    KeyWeight,
    Name,
    NameType,
    PermissionLevel,
    PermissionLevelType,
    PermissionLevelWeight,
    PublicKey,
    PublicKeyType,
    Struct,
    UInt16Type,
    UInt32Type,
    WaitWeight,
} from '@wharfkit/antelope'

export interface PermissionData {
    account: NameType
    parent: NameType
    permission: NameType
    auth: AuthorityType | Authority
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

export type PermissionType =
    | Permission
    | API.v1.AccountPermission
    | {
          perm_name: NameType
          parent: NameType
          required_auth: AuthorityType
          linked_actions?: LinkedActionType[]
      }

export type LinkedActionType = LinkedAction | {account: NameType; action: NameType}

@Struct.type('linked_actions')
export class LinkedAction extends Struct {
    @Struct.field('name') declare account: Name
    @Struct.field('name') declare action: Name
}

export type WaitWeightType = WaitWeight | {wait_sec: UInt32Type; weight: UInt16Type}

@Struct.type('permission')
export class Permission extends Struct {
    @Struct.field('name') declare perm_name: Name
    @Struct.field('name') declare parent: Name
    @Struct.field(Authority) declare required_auth: Authority
    @Struct.field(LinkedAction, {array: true, optional: true}) declare linked_actions?: LinkedAction

    static from(value: PermissionType): Permission {
        if (isInstanceOf(value, Permission)) {
            return value
        }
        return super.from(value) as Permission
    }

    get name(): Name {
        return this.perm_name
    }

    addKey(key: PublicKeyType, weight = 1): void {
        const exists = this.required_auth.keys.find((k: KeyWeight) =>
            PublicKey.from(key).equals(k.key)
        )
        if (exists) {
            throw new Error(
                `The provided key (${String(key)}) already exists on the "${
                    this.perm_name
                }" permission.`
            )
        }
        this.required_auth.keys.push(
            KeyWeight.from({
                key: key,
                weight: weight,
            })
        )
        // Always sort authorities, required by antelopeio/leap
        this.required_auth.sort()
    }

    removeKey(key: PublicKeyType): void {
        const index = this.required_auth.keys.findIndex((k: KeyWeight) =>
            PublicKey.from(key).equals(k.key)
        )
        if (index === -1) {
            throw new Error(
                `The provided key (${String(key)}) does not exist on the "${
                    this.perm_name
                }" permission.`
            )
        }
        this.required_auth.keys.splice(index, 1)
    }

    addAccount(permissionLevel: PermissionLevelType | string, weight = 1): void {
        const exists = this.required_auth.accounts.find((k: PermissionLevelWeight) =>
            PermissionLevel.from(permissionLevel).equals(k.permission)
        )
        if (exists) {
            throw new Error(
                `The provided account (${String(
                    PermissionLevel.from(permissionLevel)
                )}) already exists on the "${this.perm_name}" permission.`
            )
        }
        this.required_auth.accounts.push(
            PermissionLevelWeight.from({
                permission: PermissionLevel.from(permissionLevel),
                weight: weight,
            })
        )
        // Always sort authorities, required by antelopeio/leap
        this.required_auth.sort()
    }

    removeAccount(permissionLevel: PermissionLevelType): void {
        const index = this.required_auth.accounts.findIndex((a: PermissionLevelWeight) =>
            PermissionLevel.from(permissionLevel).equals(a.permission)
        )
        if (index === -1) {
            throw new Error(
                `The provided permission (${String(permissionLevel)}) does not exist on the "${
                    this.perm_name
                }" permission.`
            )
        }
        this.required_auth.accounts.splice(index, 1)
    }

    addWait(wait: WaitWeightType): void {
        this.required_auth.waits.push(WaitWeight.from(wait))
        // Always sort authorities, required by antelopeio/leap
        this.required_auth.sort()
    }

    removeWait(wait: WaitWeightType): void {
        this.required_auth.waits = this.required_auth.waits.filter(
            (w: WaitWeight) => !WaitWeight.from(wait).equals(w)
        )
    }
}
