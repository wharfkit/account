import {assert} from 'chai'
import {API, APIClient} from '@wharfkit/antelope'

import {Account, AccountKit, Permission} from '../../src'
import {MockProvider} from '../utils/mock-provider'
import {deserializedMockAccountObject} from '../utils/mock-data'
import { Name } from '@greymass/eosio'
import { deserialize } from 'test/utils/helpers'

const eosApiClient = new APIClient({
    provider: new MockProvider('https://eos.greymass.com'),
})

suite('Account', function () {
    let testAccount: Account

    this.beforeAll(async function () {
        testAccount = await (new AccountKit({client: eosApiClient})).load('teamgreymass')
    })

    test('construct', function () {
        const account = new Account({ client: eosApiClient, accountData: deserializedMockAccountObject})

        assert.instanceOf(account, Account)
    })
    test('accountName', function () {
        assert.isTrue(testAccount.accountName.equals('teamgreymass'))
    })

    suite('account_data', function () {
        test('returns account data', async function () {
            assert.instanceOf(testAccount.account_data, API.v1.AccountObject)
        })
    })

    suite('getPermission', function () {
        test('returns permission object', async function () {
            assert.instanceOf(testAccount.getPermission('active'), Permission)
        })

        test('throws error when permission does not exist', function () {
            try {
                testAccount.getPermission('nonexistent')
                assert.fail()
            } catch (error) {
                assert.equal(
                    (error as Error).message,
                    'Permission nonexistent does not exist on account teamgreymass.'
                )
            }
        })
    })

    suite('getResources', function () {
        this.slow(200)
        this.timeout(5 * 1000)

        test('returns resources data', async function () {
            assert.deepEqual(testAccount.getResources(), {
                cpu_available: 400021,
                cpu_used: 1018013,
                net_available: 8225481,
                net_used: 8225481,
                ram_quota: 67988,
                ram_usage: 18101,
            })
        })
    })

    suite('updatePermission', () => {
        test('returns current Action', () => {
            const permission = new Permission("permission", {
                account: "............1",
                parent: "............1",
                permission: "............1",
                authorized_by: "............1",
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
            });
            const action = testAccount.updatePermission(permission);
            assert.deepEqual(deserialize(action), {
                account: "eosio",
                authorization: [
                    {
                        actor: "............1",
                        permission: "............2"
                    }
                ],
                data: "01000000000000000100000000000000010000000000000001000000010002c0ded2bc1f1305fb0faac5e6c03ee3a1924234985427b6167ca569d13df435cf010000000100000000000000",
                name: "updateauth"
            });
        });
    });

    suite('removePermission', () => {
        test('returns current Action', () => {
            const action = testAccount.removePermission("someName");
            assert.deepEqual(deserialize(action), {
                account: "eosio",
                authorization: [
                    {
                      actor: "............1",
                      permission: "............2"
                    }
                ],
                data: "01000000000000000000004a1aa024c50100000000000000",
                name: "deleteauth"
            });
        });
    });

    suite('buyRam', () => {
        test('returns current Action', () => {
            const action = testAccount.buyRam("1.0000 EOS");
            assert.deepEqual(deserialize(action), {
                account: "eosio",
                authorization: [
                    {
                        "actor": "............1",
                        "permission": "............2"
                    }
                ],
                data: "01000000000000000100000000000000102700000000000004454f5300000000",
                name: "buyram"
            });
        });
    });

    suite('buyRamBytes', () => {
        test('returns current Action', () => {
            const action = testAccount.buyRamBytes(1024);
            assert.deepEqual(deserialize(action), {
                account: "eosio",
                authorization: [
                    {
                        actor: "............1",
                        permission: "............2"
                    }
                ],
                data: "0100000000000000010000000000000000040000",
                name: "buyrambytes"
            });
        });
    });

    suite('sellRam', () => {
        test('returns current Action', () => {
            const action = testAccount.sellRam(1024);
            assert.deepEqual(deserialize(action), {
                account: "eosio",
                authorization: [
                    {
                        actor: "............1",
                        permission: "............2"
                    }
                ],
                data: "01000000000000000004000000000000",
                name: "sellram"
            });
        });
    });

    suite('delegateResources', () => {
        test('returns current Action', () => {
            const action = testAccount.delegateResources("1.0000 EOS", "0.5000 EOS");
            assert.deepEqual(deserialize(action), {
                account: "eosio",
                authorization: [
                    {
                        actor: "............1",
                        permission: "............2"
                    }
                ],
                data: "01000000000000000100000000000000881300000000000004454f5300000000102700000000000004454f530000000000",
                name: "delegatebw"
            });
        });
    });

    suite('undelegateResources', () => {
        test('returns current Action', () => {
            const action = testAccount.undelegateResources("0.5000 EOS", "1.0000 EOS");
            assert.deepEqual(deserialize(action), {
                account: "eosio",
                authorization: [
                    {
                        actor: "............1",
                        permission: "............2"
                    }
                ],
                data: "01000000000000000100000000000000102700000000000004454f5300000000881300000000000004454f5300000000",
                name: "undelegatebw"
            });
        });
    });

    suite('getBalance', function () {
        this.slow(200)
        this.timeout(5 * 1000)

        test('returns resources object for system token', async function () {
            assert.equal(String(await testAccount.getBalance()), '4968.2348 EOS')
        })

        test('returns resources object for secondary token', async function () {
            assert.equal(
                String(await testAccount.getBalance('bingobetoken', 'BINGO')),
                '1000.0000 BINGO'
            )
        })

        test('throws error when token does not exist for given contract', function (done) {
            testAccount
                .getBalance('eosio.token', 'nonexist')
                .catch((error) => {
                    assert.equal(
                        (error as Error).message,
                        'No balance found for nonexist token of eosio.token contract.'
                    )
                    done()
                })
                .then((data) => {
                    assert.fail()
                })
        })

        test('throws error when token contract does not exist', function (done) {
            testAccount
                .getBalance('nonexist')
                .catch((error) => {
                    assert.equal(
                        (error as Error).message,
                        'Token contract nonexist does not exist.'
                    )
                    done()
                })
                .then(() => {
                    assert.fail()
                })
        })
    })
})
