import {Authority, Name, NameType, Struct} from '@greymass/eosio'

// Temporarily use a custom version of Contract class.
import {Contract} from '../../tmp/contract'

class PermissionActions extends Contract {
    static account = Name.from('eosio')

    async updateAuth(account: NameType, permission: NameType, parent: string, auth: Authority) {
        return this.call('updateauth', PermissionActions.Types.UpdateAuth.from({account, permission, parent, auth}))
    }

    async deleteAuth(account: NameType, permission: NameType) {
        return this.call('deleteauth', PermissionActions.Types.DeleteAuth.from({account, permission}))
    }
}

namespace PermissionActions {
    export namespace Types {
        @Struct.type('updateauth')
        export class UpdateAuth extends Struct {
            @Struct.field('name') declare account: Name;
            @Struct.field('name') declare permission: Name;
            @Struct.field('string') declare parent: Name;
            @Struct.field('authorization_object') declare auth: Authority;
        }

        export class DeleteAuth extends Struct {
            @Struct.field('name') declare account: Name;
            @Struct.field('name') declare permission: Name;
        }
    }
}

export { PermissionActions }
