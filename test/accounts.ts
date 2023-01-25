import {assert} from 'chai'
import {API, APIClient, Asset, Checksum256, Name} from '@greymass/eosio'

import {Account} from '../src/accounts'
import {Permission} from '../src/permissions'
import {MockProvider} from './utils/mock-provider'

const eosApiClient = new APIClient({
    provider: new MockProvider('https://eos.greymass.com'),
})

const chainId = Checksum256.from('aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906')

suite('accounts', function () {
    suite('Account', function () {
        test('construct', function () {
            const account = new Account(Name.from('teamgreymass'), chainId, eosApiClient)

            assert.instanceOf(account, Account)
        })
        test('from', function () {
            assert.instanceOf(testAccount(), Account)
        })
        test('accountName', function () {
            assert(testAccount().accountName.equals('teamgreymass'))
        })
        test('chainId', function () {
            assert.equal(testAccount().chainId, chainId)
        })

        suite('getAccountData', function () {
            this.slow(200)
            this.timeout(5 * 1000)

            test('returns account data', async function () {
                const account = testAccount()

                assert.instanceOf(await account.getAccountData(), API.v1.AccountObject)
            })

            test('throws error when account does not exist', function (done) {
                const account = nonExistentTestAccount()

                account.getAccountData().catch((error) => {
                    assert((error as Error).message, 'Account does not exist')
                    done()
                })
            })
        })

        suite('getPermission', function () {
            this.slow(200)
            this.timeout(5 * 1000)

            test('returns permission object', async function () {
                const account = testAccount()

                assert.instanceOf(await account.getPermission('active'), Permission)
            })

            test('throws error when account does not exist', function (done) {
                const account = nonExistentTestAccount()

                account
                    .getPermission('active')
                    .catch((error) => {
                        assert.equal(
                            (error as Error).message,
                            'Account nonexistent does not exist.'
                        )
                        done()
                    })
                    .then(() => {
                        assert.fail()
                    })
            })

            test('throws error when permission does not exist', function (done) {
                const account = testAccount()

                account
                    .getPermission('nonexistent')
                    .catch((error) => {
                        assert.equal(
                            (error as Error).message,
                            'Unknown permission nonexistent on account teamgreymass.'
                        )
                        done()
                    })
                    .then(() => {
                        assert.fail()
                    })
            })
        })

        suite('getResources', function () {
            this.slow(200)
            this.timeout(5 * 1000)

            test('returns resources data', async function () {
                const account = testAccount()

                assert.deepEqual(await account.getResources(), {
                    cpu_available: 236250,
                    cpu_used: 826079,
                    net_available: 8253324,
                    net_used: 8253324,
                    ram_quota: 67988,
                    ram_usage: 17086,
                })
            })

            test('throws error when account does not exist', function (done) {
                const account = nonExistentTestAccount()

                account
                    .getResources()
                    .catch((error) => {
                        assert.equal(
                            (error as Error).message,
                            'Account nonexistent does not exist.'
                        )
                        done()
                    })
                    .then(() => {
                        assert.fail()
                    })
            })
        })

        suite('getBalance', function () {
            this.slow(200)
            this.timeout(5 * 1000)

            test('returns resources object for system token', async function () {
                const account = testAccount()

                assert.equal(String(await account.getBalance()), '20853.0388 EOS')
            })

            test('returns resources object for secondary token', async function () {
                const account = testAccount()

                assert.equal(
                    String(await account.getBalance('bingobetoken', 'BINGO')),
                    '1000.0000 BINGO'
                )
            })

            test('throws error when token does not exist for given contract', function (done) {
                const account = testAccount()

                account
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
                const account = testAccount()

                account
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
})

function testAccount() {
    return Account.from('teamgreymass', chainId, eosApiClient)
}

function nonExistentTestAccount() {
    return Account.from('nonexistent', chainId, eosApiClient)
}
