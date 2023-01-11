import {
    ABISerializableObject,
    Action,
    Asset,
    AssetType,
    Name,
    NameType,
    Struct,
} from '@greymass/eosio'

// Temporarily use a custom version of Contract class.
import {Contract} from '../../tmp/contract'

class ResourceActions extends Contract {
    static account = Name.from('eosio')

    async buyRam(payer: NameType, receiver: NameType, quant: AssetType, sessionData?: any) {
        return this.call('buyram', ResourceActions.Types.BuyRam.from({payer, receiver, quant}))
    }

    async buyRamBytes(payer: NameType, receiver: NameType, bytes: number, sessionData?: any) {
        return this.call(
            'buyrambytes',
            ResourceActions.Types.BuyRamBytes.from({payer, receiver, bytes})
        )
    }

    async sellRam(account: NameType, bytes: number, sessionData?: any) {
        return this.call('sellram', ResourceActions.Types.SellRam.from({account, bytes}))
    }

    async delegateResources(
        from: NameType,
        receiver: NameType,
        stake_net_quantity: AssetType,
        stake_cpu_quantity: AssetType,
        transfer = false,
        sessionData?: any
    ) {
        return this.call(
            'delegatebw',
            ResourceActions.Types.DelegateCpu.from({
                from,
                receiver,
                stake_net_quantity,
                stake_cpu_quantity,
                transfer,
            })
        )
    }

    async undelegateResources(
        from: NameType,
        receiver: NameType,
        unstake_net_quantity: AssetType,
        unstake_cpu_quantity: AssetType,
        sessionData?: any
    ) {
        return this.call(
            'undelegatebw',
            ResourceActions.Types.UndelegateCpu.from({
                from,
                receiver,
                unstake_net_quantity,
                unstake_cpu_quantity,
            })
        )
    }

    async refundCpu(owner: NameType, sessionData?: any) {
        return this.call('refund', ResourceActions.Types.Refund.from({owner}))
    }

    async buyRamAction(
        payer: NameType,
        receiver: NameType,
        quant: AssetType,
        sessionData?: any
    ): Promise<Action> {
        return this.getAction('buyram', ResourceActions.Types.BuyRam.from({payer, receiver, quant}))
    }

    async buyRamBytesAction(
        payer: NameType,
        receiver: NameType,
        bytes: number,
        sessionData?: any
    ): Promise<Action> {
        return this.getAction(
            'buyrambytes',
            ResourceActions.Types.BuyRamBytes.from({payer, receiver, bytes})
        )
    }

    async sellRamAction(account: NameType, bytes: number, sessionData?: any): Promise<Action> {
        return this.getAction('sellram', ResourceActions.Types.SellRam.from({account, bytes}))
    }

    async delegateResourcesAction(
        from: NameType,
        receiver: NameType,
        stake_net_quantity: AssetType,
        stake_cpu_quantity: AssetType,
        transfer: boolean,
        sessionData?: any
    ): Promise<Action> {
        return this.getAction(
            'delegatebw',
            ResourceActions.Types.DelegateCpu.from({
                from,
                receiver,
                stake_net_quantity,
                stake_cpu_quantity,
                transfer,
            })
        )
    }

    async undelegateResourcesAction(
        from: NameType,
        receiver: NameType,
        unstake_net_quantity: AssetType,
        unstake_cpu_quantity: AssetType,
        sessionData?: any
    ): Promise<Action> {
        return this.getAction(
            'undelegatebw',
            ResourceActions.Types.UndelegateCpu.from({
                from,
                receiver,
                unstake_net_quantity,
                unstake_cpu_quantity,
            })
        )
    }
}

namespace ResourceActions {
    export namespace Types {
        @Struct.type('buyram')
        export class BuyRam extends Struct {
            @Struct.field('name') declare payer: Name
            @Struct.field('name') declare receiver: Name
            @Struct.field('asset') declare quant: Asset
        }

        @Struct.type('buyrambytes')
        export class BuyRamBytes extends Struct {
            @Struct.field('name') declare payer: Name
            @Struct.field('name') declare receiver: Name
            @Struct.field('uint32') declare bytes: number
        }

        @Struct.type('sellram')
        export class SellRam extends Struct {
            @Struct.field('name') declare account: Name
            @Struct.field('uint64') declare bytes: number
        }

        @Struct.type('delegatecpu')
        export class DelegateCpu extends Struct {
            @Struct.field('name') declare from: Name
            @Struct.field('name') declare receiver: Name
            @Struct.field('asset') declare stake_cpu_quantity: Asset
            @Struct.field('bool') declare transfer: boolean
        }

        @Struct.type('undelegatecpu')
        export class UndelegateCpu extends Struct {
            @Struct.field('name') declare from: Name
            @Struct.field('name') declare receiver: Name
            @Struct.field('asset') declare unstake_cpu_quantity: Asset
        }

        @Struct.type('delegatebw')
        export class DelegateBandwidth extends Struct {
            @Struct.field('name') declare from: Name
            @Struct.field('name') declare receiver: Name
            @Struct.field('asset') declare stake_net_quantity: Asset
            @Struct.field('asset') declare stake_cpu_quantity: Asset
            @Struct.field('bool') declare transfer: boolean
        }

        @Struct.type('undelegatebw')
        export class UndelegateBandwidth extends Struct {
            @Struct.field('name') declare from: Name
            @Struct.field('name') declare receiver: Name
            @Struct.field('asset') declare unstake_net_quantity: Asset
            @Struct.field('asset') declare unstake_cpu_quantity: Asset
        }

        @Struct.type('refund')
        export class Refund extends Struct {
            @Struct.field('name') declare owner: Name
        }
    }
}

export {ResourceActions}
