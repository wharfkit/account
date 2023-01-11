import {Authority, AuthorityType, Name, NameType, Struct} from '@greymass/eosio'

// Temporarily use a custom version of Contract class.
import {Contract} from '../../tmp/contract'

class PermissionActions extends Contract {
    static account = Name.from('eosio')

    async updateAuth(
        permissionData: {
            account: NameType
            permission: NameType
            parent: NameType
            auth: AuthorityType
        },
        sessionData?: any
    ) {
        return this.call('updateauth', PermissionActions.Types.UpdateAuth.from(permissionData))
    }

    async deleteAuth(account: NameType, permission: NameType, sessionData?: any) {
        return this.call(
            'deleteauth',
            PermissionActions.Types.DeleteAuth.from({account, permission})
        )
    }
}

namespace PermissionActions {
    export namespace Types {
        @Struct.type('updateauth')
        export class UpdateAuth extends Struct {
            @Struct.field('name') declare account: Name
            @Struct.field('name') declare permission: Name
            @Struct.field('string') declare parent: Name
            @Struct.field('authorization_object') declare auth: Authority
        }

        export class DeleteAuth extends Struct {
            @Struct.field('name') declare account: Name
            @Struct.field('name') declare permission: Name
        }
    }
}

export {PermissionActions}
