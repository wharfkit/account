import {assert, expect} from 'chai'

import {Account, AccountKit, SystemContract} from '../../src'
import {Chains} from '@wharfkit/common'
import {makeClient, mockFetch} from '@wharfkit/mock-data'
import {API} from '@wharfkit/antelope'
import {TelosAccountObject, WAXAccountObject} from 'src/types'

suite('AccountKit', function () {
    let accountKit: AccountKit

    this.beforeAll(function () {
        accountKit = new AccountKit({chain: Chains.Jungle4, fetch: mockFetch})
    })

    suite('constructor', function () {
        test('throws error if client is not provided', function () {
            try {
                new AccountKit({} as any)
            } catch (error) {
                assert.equal(
                    error.message,
                    'A `chain` (ChainDefinition) must be passed when initializing the AccountKit.'
                )
            }
        })

        test('sets client if provided', function () {
            expect(accountKit.client).to.exist
        })

        test('allow overriding of default contract', function () {
            const kit = new AccountKit({
                chain: Chains.Jungle4,
                contract: new SystemContract.Contract({client: makeClient()}),
                fetch: mockFetch,
            })
        })
    })

    suite('load', function () {
        test('throws error if account does not exist', async function () {
            try {
                await accountKit.load('nonexistent')
                assert.fail()
            } catch (error) {
                assert.instanceOf(error, Error)
            }
        })

        test('returns an Account object when account exists', async function () {
            const account = await accountKit.load('teamgreymass')
            expect(account).to.be.instanceOf(Account)
        })

        test('returns default account type', async function () {
            const kit = new AccountKit({chain: Chains.Jungle4, fetch: mockFetch})
            const account = await kit.load('teamgreymass')
            expect(account.data).to.be.instanceOf(API.v1.AccountObject)
            expect(account.data).not.to.be.instanceOf(TelosAccountObject)
            expect(account.data).not.to.be.instanceOf(WAXAccountObject)
        })

        test('returns telos account type', async function () {
            const kit = new AccountKit({chain: Chains.Telos, fetch: mockFetch})
            const account = await kit.load('teamgreymass')
            expect(account.data).to.be.instanceOf(API.v1.AccountObject)
            expect(account.data).to.be.instanceOf(TelosAccountObject)
            expect(account.data).not.to.be.instanceOf(WAXAccountObject)
            assert.isDefined(account.data.voter_info?.last_stake)
        })

        test('returns wax account type', async function () {
            const kit = new AccountKit({chain: Chains.WAX, fetch: mockFetch})
            const account = await kit.load('teamgreymass')
            expect(account.data).to.be.instanceOf(API.v1.AccountObject)
            expect(account.data).not.to.be.instanceOf(TelosAccountObject)
            expect(account.data).to.be.instanceOf(WAXAccountObject)
            assert.isDefined(account.data.voter_info?.unpaid_voteshare)
            assert.isDefined(account.data.voter_info?.unpaid_voteshare_last_updated)
            assert.isDefined(account.data.voter_info?.unpaid_voteshare_change_rate)
            assert.isDefined(account.data.voter_info?.last_claim_time)
        })
    })
})
