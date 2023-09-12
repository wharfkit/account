import {assert, expect} from 'chai'

import {Account, AccountKit, SystemContract} from '../../src'
import {Chains} from '@wharfkit/common'
import {makeClient, mockFetch} from '@wharfkit/mock-data'

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
    })
})
