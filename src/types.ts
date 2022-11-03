export interface AccountData {
    account_name: string
    head_block_num: number
    head_block_time: string
}

export interface AccountOptions {
    cacheDuration?: number
}

export interface PermissionData {
    parent: string
    required_auth: {
        accounts: {
            permission: {
                actor: string
                permission: string
            }
        }
    }
}
