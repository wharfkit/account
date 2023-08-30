import {assert} from 'chai'
import {Authority, Name} from '@greymass/eosio'

import {Permission} from '../src/permission'

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

const expectedKeyData = {
    data: {
        array: '2,192,222,210,188,31,19,5,251,15,170,197,230,192,62,227,161,146,66,52,152,84,39,182,22,124,165,105,209,61,244,53,207',
    },
    type: 'K1',
}

const expectedWeightData = {
    value: {
        length: 1,
        negative: 0,
        red: [null],
        words: [1],
    },
}

const expectedThresholdData = {
    value: {
        length: 1,
        negative: 0,
        red: [null],
        words: [1],
    },
}

const expectedAuthorityData = {
    keys: [expectedKeyData],
    threshold: expectedThresholdData,
}

suite('accounts', function () {
    suite('Permission', function () {
        test('construct', function () {
            const permission = new Permission(Name.from('active'), {
                account: 'teamgreymass',
                parent: 'owner',
                permission: 'active',
                auth: Authority.from(authorityExample),
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
            assert.equal(String(testPermission().permissionName), 'active')
        })

        test('actionData', function () {
            assert.deepEqual(testPermission().actionData, {
                account: 'teamgreymass',
                permission: 'active',
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
            assert.deepEqual(permission.actionData.auth, {
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
            assert.deepEqual(permission.actionData.auth, {
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
                    key: 'PUB_K1_6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5BoDq63',
                    weight: 1,
                },
            ],
            accounts: [],
            waits: [],
        }),
    })
}
