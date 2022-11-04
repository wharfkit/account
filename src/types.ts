import type { Session } from '@wharfkit/session'

export interface AccountData {
    account_name: string
    head_block_num: number
    head_block_time: string
}

export interface AccountOptions {
    cache_duration?: number
    session?: Session
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
