import {Authority, Name, NameType, Struct} from '@greymass/eosio'

import {Contract} from '../../tmp/contract'

class PermissionActions extends Contract {
    static account = Name.from('eosio')

    async updateAuth(account: NameType, permission: NameType, parent: string, auth: Authority) {
        return this.call('claim', PermissionActions.Types.UpdateAuth.from({account, permission, parent, auth}))
    }
}

namespace PermissionActions {
    export namespace Types {
        @Struct.type('updateauth')
        export class UpdateAuth extends Struct {
            @Struct.field('name') declare account: Name,
            @Struct.field('name') declare permission: Name,
            @Struct.field('string') declare parent: Name,
            @Struct.field('authorization_object') declare auth: Authority,
        }
    }
}

export default contractImpl
