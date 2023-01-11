import { API, UInt32, UInt64, Name, TimePoint, Asset, Int64 } from '@greymass/eosio'

const mockAccountObject = API.v1.AccountObject.from({
    cpu_weight: UInt64.from(333),
    net_weight: UInt64.from(222),
    ram_quota: UInt64.from(111),
    account_name: Name.from('test'),
    head_block_num: UInt32.from(0),
    head_block_time: TimePoint.from(new Date()),
    privileged: false,
    last_code_update: TimePoint.from(new Date()),
    created: TimePoint.from(new Date()),
    core_liquid_balance: Asset.from('0.0000 EOS'),
    net_limit: API.v1.AccountResourceLimit.from({
        used: UInt64.from(0),
        available: UInt64.from(0),
        max: UInt64.from(0),
    }),
    cpu_limit: API.v1.AccountResourceLimit.from({
        used: UInt64.from(0),
        available: UInt64.from(0),
        max: UInt64.from(0),
    }),
    ram_usage: UInt64.from(0),
    permissions: [],
    total_resources: API.v1.AccountTotalResources.from({
        owner: Name.from('test'),
        net_weight: Asset.from('0.0000 EOS'),
        cpu_weight: Asset.from('0.0000 EOS'),
        ram_bytes: UInt64.from(0),
    }),
    self_delegated_bandwidth: API.v1.AccountSelfDelegatedBandwidth.from({
        from: Name.from('test'),
        to: Name.from('test'),
        net_weight: Asset.from('0.0000 EOS'),
        cpu_weight: Asset.from('0.0000 EOS'),
    }),
    refund_request: API.v1.AccountRefundRequest.from({
        owner: Name.from('test'),
        request_time: TimePoint.from(new Date()),
        net_amount: Asset.from('0.0000 EOS'),
        cpu_amount: Asset.from('0.0000 EOS'),
    }),
})

export { mockAccountObject }