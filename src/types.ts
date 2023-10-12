import {API, Float64, Int64, Struct, TimePoint} from '@wharfkit/antelope'

export type AccountData = API.v1.AccountObject | TelosAccountObject | WAXAccountObject

@Struct.type('telos_account_voter_info')
export class TelosAccountVoterInfo extends API.v1.AccountVoterInfo {
    @Struct.field(Int64) last_stake!: Int64
}

@Struct.type('telos_account_object')
export class TelosAccountObject extends API.v1.AccountObject {
    @Struct.field(TelosAccountVoterInfo, {optional: true})
    declare voter_info?: TelosAccountVoterInfo
}

@Struct.type('wax_account_voter_info')
export class WAXAccountVoterInfo extends API.v1.AccountVoterInfo {
    @Struct.field(Float64) declare unpaid_voteshare: Float64
    @Struct.field(TimePoint) declare unpaid_voteshare_last_updated: TimePoint
    @Struct.field(Float64) declare unpaid_voteshare_change_rate: Float64
    @Struct.field(TimePoint) declare last_claim_time: TimePoint
}

@Struct.type('wax_account_object')
export class WAXAccountObject extends API.v1.AccountObject {
    @Struct.field(WAXAccountVoterInfo, {optional: true}) declare voter_info?: WAXAccountVoterInfo
}