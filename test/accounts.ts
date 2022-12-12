import { assert } from 'chai'
import { ChainId, ChainName } from "anchor-link";
import { Name, APIClient, API } from "@greymass/eosio";

import { Account } from '../src/accounts'
import { Permission } from '../src/permissions'
import { Resources } from '../src/resources'
import { MockProvider } from './utils/mock-provider'

const eosApiClient = new APIClient({
    provider: new MockProvider('https://eos.greymass.com'),
})

suite('accounts', function () {
    suite('Account', function () {
        test('construct', function () {
            const account = new Account(Name.from('teamgreymass'), ChainId.from(ChainName.EOS), eosApiClient)

            assert.instanceOf(account, Account)
        })
        test('from', function () {
            assert.instanceOf(testAccount(), Account)
        })
        test('accountName', function () {
            assert(testAccount().accountName.equals("teamgreymass"));
        })
        test('chainId', function () {
            assert.equal(testAccount().chainId.chainName, ChainName.EOS);
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
                    assert((error as Error).message, "Account does not exist")
                    done()
                });
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

                account.getPermission('active').catch((error) => {
                    assert.equal((error as Error).message, "Account nonexistent does not exist on chain EOS.")
                    done()
                }).then(() => {
                    assert.fail()
                })
            })

            test('throws error when permission does not exist', function (done) {
                const account = testAccount()

                account.getPermission('nonexistent').catch((error) => {
                    assert.equal((error as Error).message, "Unknown permission nonexistent on account teamgreymass.")
                    done()
                }).then(() => {
                    assert.fail()
                })
            })
        })

        suite('getResources', function () {
            this.slow(200)
            this.timeout(5 * 1000)

            test('returns resources object', async function () {
                const account = testAccount()

                assert.instanceOf(await account.getResources(), Resources)
            })

            test('throws error when account does not exist', function (done) {
                const account = nonExistentTestAccount()

                account.getResources().catch((error) => {
                    assert.equal((error as Error).message, "Account nonexistent does not exist on chain EOS.")
                    done()
                }).then(() => {
                    assert.fail()
                })
            })
        })
    })
})

function testAccount() {
    return Account.from('teamgreymass', ChainId.from(ChainName.EOS), eosApiClient)
}

function nonExistentTestAccount() {
    return Account.from('nonexistent', ChainId.from(ChainName.EOS), eosApiClient)
}
