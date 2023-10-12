import {assert} from 'chai'
import {
    Authority,
    KeyWeight,
    Name,
    PermissionLevel,
    PermissionLevelWeight,
    PublicKey,
    UInt16,
    WaitWeight,
} from '@wharfkit/antelope'
import {mockAccountName} from '@wharfkit/mock-data'

import {Account, AccountKit, Chains, Permission} from '../../src'

const accountKit = new AccountKit(Chains.Jungle4)

suite('Permission', function () {
    let testAccount: Account
    let testPermission: Permission

    setup(async function () {
        testAccount = await accountKit.load(mockAccountName)
        testPermission = testAccount.permission('active')
    })

    suite('construct', function () {
        test('vanilla objects', function () {
            Permission.from({
                parent: 'owner',
                perm_name: 'active',
                required_auth: {
                    threshold: 1,
                    keys: [
                        {
                            key: 'PUB_K1_6XXTaRpWhPwnb7CTV9zVsCBrvCpYMMPSk8E8hsJxhf6V9t8aT5',
                            weight: 1,
                        },
                    ],
                    accounts: [
                        {
                            permission: {actor: 'foo', permission: 'bar'},
                            weight: 1,
                        },
                    ],
                    waits: [
                        {
                            wait_sec: 600,
                            weight: 1,
                        },
                    ],
                },
            })
        })
        test('empty', function () {
            Permission.from({
                parent: 'owner',
                perm_name: 'active',
                required_auth: {
                    threshold: 1,
                    keys: [],
                    accounts: [],
                    waits: [],
                },
            })
        })
        test('typed objects', function () {
            const permission = Permission.from({
                parent: Name.from('owner'),
                perm_name: Name.from('active'),
                required_auth: Authority.from({
                    threshold: UInt16.from(1),
                    keys: [
                        KeyWeight.from({
                            key: PublicKey.from(
                                'PUB_K1_6XXTaRpWhPwnb7CTV9zVsCBrvCpYMMPSk8E8hsJxhf6V9t8aT5'
                            ),
                            weight: UInt16.from(1),
                        }),
                    ],
                    accounts: [
                        PermissionLevelWeight.from({
                            permission: PermissionLevel.from({
                                actor: Name.from('foo'),
                                permission: Name.from('bar'),
                            }),
                            weight: UInt16.from(1),
                        }),
                    ],
                    waits: [
                        WaitWeight.from({
                            wait_sec: 600,
                            weight: UInt16.from(1),
                        }),
                    ],
                }),
            })
            // Coverage on recursion
            Permission.from(permission)
        })
    })

    test('name (getter)', function () {
        assert.equal(String(testPermission.name), 'active')
    })

    suite('key-based authority', function () {
        suite('addKey', function () {
            test('add (string)', function () {
                testPermission.addKey('PUB_K1_6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5BoDq63')
                assert.equal(testPermission.required_auth.keys.length, 2)
                // Will be position 0 due to authority sorting
                assert.isTrue(
                    testPermission.required_auth.keys[0].equals({
                        key: 'PUB_K1_6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5BoDq63',
                        weight: 1,
                    })
                )
            })
            test('add (string, legacy)', function () {
                const publicKey = PublicKey.from(
                    'PUB_K1_6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5BoDq63'
                )
                testPermission.addKey(publicKey.toLegacyString())
                assert.equal(testPermission.required_auth.keys.length, 2)
                // Will be position 0 due to authority sorting
                assert.isTrue(
                    testPermission.required_auth.keys[0].equals({
                        key: 'PUB_K1_6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5BoDq63',
                        weight: 1,
                    })
                )
            })
            test('add (PublicKey)', function () {
                const publicKey = PublicKey.from(
                    'PUB_K1_6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5BoDq63'
                )
                testPermission.addKey(publicKey)
                assert.equal(testPermission.required_auth.keys.length, 2)
                // Will be position 0 due to authority sorting
                assert.isTrue(
                    testPermission.required_auth.keys[0].equals({
                        key: 'PUB_K1_6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5BoDq63',
                        weight: 1,
                    })
                )
            })
            test('add with weight', function () {
                const publicKey = PublicKey.from(
                    'PUB_K1_6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5BoDq63'
                )
                testPermission.addKey(publicKey, 10)
                assert.equal(testPermission.required_auth.keys.length, 2)
                // Will be position 0 due to authority sorting
                assert.isTrue(
                    testPermission.required_auth.keys[0].equals({
                        key: 'PUB_K1_6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5BoDq63',
                        weight: 10,
                    })
                )
            })
            test('prevent duplicate', function () {
                assert.throws(() =>
                    testPermission.addKey(
                        'PUB_K1_6XXTaRpWhPwnb7CTV9zVsCBrvCpYMMPSk8E8hsJxhf6V9t8aT5'
                    )
                )
            })
        })

        suite('removeKey', function () {
            test('remove', function () {
                assert.equal(testPermission.required_auth.keys.length, 1)
                testPermission.removeKey(
                    'PUB_K1_6XXTaRpWhPwnb7CTV9zVsCBrvCpYMMPSk8E8hsJxhf6V9t8aT5'
                )
                assert.equal(testPermission.required_auth.keys.length, 0)
            })
            test('throw if key not found', function () {
                assert.throws(() =>
                    testPermission.removeKey(
                        'PUB_K1_6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5BoDq63'
                    )
                )
            })
        })
    })

    suite('account-based authority', function () {
        suite('addAccount', function () {
            test('add (object)', function () {
                testPermission.addAccount({actor: 'trust.gm', permission: 'active'})
                assert.lengthOf(testPermission.required_auth.keys, 1)
                assert.lengthOf(testPermission.required_auth.accounts, 1)
                assert.isTrue(
                    testPermission.required_auth.accounts[0].permission.equals(
                        PermissionLevel.from({actor: 'trust.gm', permission: 'active'})
                    )
                )
            })
            test('add (string)', function () {
                testPermission.addAccount('trust.gm@active')
                assert.lengthOf(testPermission.required_auth.keys, 1)
                assert.lengthOf(testPermission.required_auth.accounts, 1)
                assert.isTrue(
                    testPermission.required_auth.accounts[0].permission.equals(
                        PermissionLevel.from({actor: 'trust.gm', permission: 'active'})
                    )
                )
            })
            test('add (PermissionLevel)', function () {
                testPermission.addAccount(
                    PermissionLevel.from({actor: 'trust.gm', permission: 'active'})
                )
                assert.lengthOf(testPermission.required_auth.keys, 1)
                assert.lengthOf(testPermission.required_auth.accounts, 1)
                assert.isTrue(
                    testPermission.required_auth.accounts[0].permission.equals(
                        PermissionLevel.from({actor: 'trust.gm', permission: 'active'})
                    )
                )
            })
            test('add and prevent duplicates', function () {
                const test = Permission.from({
                    parent: 'owner',
                    perm_name: 'active',
                    required_auth: {
                        threshold: 1,
                        keys: [],
                        accounts: [
                            {
                                permission: {actor: 'foo', permission: 'bar'},
                                weight: 1,
                            },
                        ],
                        waits: [],
                    },
                })
                assert.throws(() => test.addAccount({actor: 'foo', permission: 'bar'}))
            })
        })

        suite('removeAccount', function () {
            test('remove', function () {
                testPermission.addAccount({actor: 'trust.gm', permission: 'active'})
                testPermission.removeAccount({actor: 'trust.gm', permission: 'active'})
                assert.lengthOf(testPermission.required_auth.keys, 1)
                assert.lengthOf(testPermission.required_auth.accounts, 0)
            })
            test('throw if account not found', function () {
                assert.throws(() =>
                    testPermission.removeAccount({actor: 'trust.gm', permission: 'active'})
                )
            })
        })
    })

    suite('wait-based authority', function () {
        test('addWait', function () {
            assert.lengthOf(testPermission.required_auth.waits, 0)
            testPermission.addWait({
                wait_sec: 100,
                weight: 1,
            })
            assert.lengthOf(testPermission.required_auth.waits, 1)
            assert.isTrue(testPermission.required_auth.waits[0].equals({wait_sec: 100, weight: 1}))
        })

        test('removeWait', function () {
            testPermission.addWait({
                wait_sec: 100,
                weight: 1,
            })
            assert.equal(testPermission.required_auth.waits?.length, 1)
            testPermission.removeWait({
                wait_sec: 100,
                weight: 1,
            })
            assert.equal(testPermission.required_auth.waits?.length, 0)
        })
    })
})
