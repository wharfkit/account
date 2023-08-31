import {assert} from 'chai'
import {Authority, Name, NameType, AuthorityType} from '@wharfkit/antelope'

import {ActionData, Permission} from '../../src'
import { deserialize } from '../utils/helpers'

const authorityExample = {
    threshold: 1,
    keys: [
        {
            key: 'PUB_K1_6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5BoDq63',
            weight: 1,
        },
    ],
    accounts: [],
    waits: [],
}

suite('Permission', function () {
    test('construct', function () {
        const permission = new Permission(Name.from('active'), {
            account: 'teamgreymass',
            parent: 'owner',
            permission: 'active',
            auth: Authority.from(authorityExample),
            authorized_by: 'teamgreymass',
        })
        assert.instanceOf(permission, Permission)
    })

    test('permissionName', function () {
        assert.equal(String(testPermission().permissionName), 'active')
    })

    test('actionData', function () {
        assert.deepEqual(deserialize<ActionData>(testPermission().actionData), {
            account: 'teamgreymass',
            permission: 'active',
            authorized_by: 'teamgreymass',
            parent: 'owner',
            auth: {
                accounts: [],
                keys: [
                    {
                        key: 'PUB_K1_6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5BoDq63',
                        weight: 1,
                    },
                ],
                threshold: 1,
                waits: [],
            },
        })
    })

    test('addKey', function () {
        const permission = testPermission()
        permission.addKey('PUB_K1_6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5BoDq63')
        assert.equal(permission.actionData.auth.keys?.length, 2)
    })

    test('removeKey', function () {
        const permission = testPermission()
        assert.equal(permission.actionData.auth.keys?.length, 1)
        permission.removeKey('PUB_K1_6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5BoDq63')
        assert.equal(permission.actionData.auth.keys?.length, 0)
    })

    test('addAccount', function () {
        const permission = testPermission()
        permission.addAccount({actor: 'trust.gm', permission: 'active'})
        assert.deepEqual(deserialize(permission.actionData.auth), {
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
        permission.addAccount({actor: 'trust.gm', permission: 'active'})
        permission.removeAccount('trust.gm')
        assert.deepEqual(deserialize(permission.actionData.auth), {
            ...authorityExample,
            accounts: [],
        })
    })

    test('addWait', function () {
        const permission = testPermission()
        permission.addWait(100)
        assert.deepEqual(JSON.parse(JSON.stringify(permission.actionData.auth.waits)), [
            {wait_sec: 100, weight: 1},
        ])
    })

    test('removeWait', function () {
        const permission = testPermission()
        permission.addWait(100)
        assert.equal(permission.actionData.auth.waits?.length, 1)
        permission.removeWait(100)
        assert.equal(permission.actionData.auth.waits?.length, 0)
    })
})

function testPermission() {
    return new Permission('active', {
        account: 'teamgreymass',
        parent: 'owner',
        permission: 'active',
        authorized_by: 'teamgreymass',
        auth: Authority.from({
            threshold: 1,
            keys: [
                {
                    key: 'PUB_K1_6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5BoDq63',
                    weight: 1,
                },
            ],
            accounts: [],
            waits: [],
        }),
    })
}

