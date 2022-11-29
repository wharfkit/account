import { assert } from 'chai'

import { Authority, Name } from '@greymass/eosio'
import { ChainId, ChainName } from "anchor-link";

import { Permission } from '../src/permissions'

const authorityExample = {
    threshold: 1,
    keys: [
        {
            key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
            weight: 1,
        },
    ],
    accounts: [],
    waits: [],
}

suite('accounts', function () {
    suite('Permission', function () {
        test('construct', function () {
            const permission = new Permission(Name.from('active'), {
                account: 'teamgreymass',
                parent: 'owner',
                permission: 'active',
                auth: Authority.from(authorityExample)
            })
            assert.instanceOf(permission, Permission)
        })

        test('from', function () {
            const permission = Permission.from({
                account: 'teamgreymass',
                parent: 'owner',
                permission: 'active',
                auth: authorityExample,
            })
            assert.instanceOf(permission, Permission)
        })

        test('permissionName', function () {
            assert.equal(String(testPermission().permissionName), 'active');
        })

        test('actionParams', function () {
            assert.deepEqual(testPermission().actionParams, {
                account: 'teamgreymass',
                permission: 'active',
                parent: 'owner',
                auth: authorityExample,
            })
        })

        test('addKey', function () {
            const permission = testPermission()
            permission.addKey('EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDSDSDD')
            assert.deepEqual(permission.actionParams.auth, {
                ...authorityExample,
                keys: [
                    ...authorityExample.keys,
                    {
                        key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDSDSDD',
                        weight: 1,
                    },
                ],
            })
        })

        test('removeKey', function () {
            const permission = testPermission()
            permission.removeKey('EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV')
            assert.deepEqual(permission.actionParams.auth, {
                ...authorityExample,
                keys: [],
            })
        })

        test('addAccount', function () {
            const permission = testPermission()
            permission.addAccount('trust.gm')
            assert.deepEqual(permission.actionParams.auth, {
                ...authorityExample,
                accounts: [
                    {
                        permission: {
                            actor: 'trust.gm',
                            permission: 'active',
                        },
                        weight: 1,
                    },
                ],
            })
        })

        test('removeAccount', function () {
            const permission = testPermission()
            permission.addAccount('trust.gm')
            permission.removeAccount('trust.gm')
            assert.deepEqual(permission.actionParams.auth, {
                ...authorityExample,
                accounts: [],
            })
        })

        test('addWait', function () {
            const permission = testPermission()
            permission.addWait(100)
            assert.deepEqual(permission.actionParams.auth, {
                ...authorityExample,
                waits: [
                    {
                        wait_sec: 100,
                        weight: 1,
                    },
                ],
            })
        })


        test('removeWait', function () {
            const permission = testPermission()
            permission.addWait(100)
            permission.removeWait(100)
            assert.deepEqual(permission.actionParams.auth, {
                ...authorityExample,
                waits: [],
            })
        })
    })
})

function testPermission() {
    return new Permission(Name.from('active'), {
        account: 'teamgreymass',
        parent: 'owner',
        permission: 'active',
        auth: Authority.from({
            threshold: 1,
            keys: [
                {
                    key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
                    weight: 1
                }
            ],
            accounts: [],
            waits: []
        })
    })
}


