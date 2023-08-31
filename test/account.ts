import {assert} from 'chai'
import {API, APIClient} from '@wharfkit/antelope'

import {Account} from '../src/account'
import {AccountKit} from '../src/kit'
import {Permission} from '../src/permission'
import {MockProvider} from './utils/mock-provider'
import {deserializedMockAccountObject} from './mock-data'

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
