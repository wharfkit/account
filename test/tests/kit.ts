import {assert, expect} from 'chai'

import {Account, AccountKit, SystemContract} from '../../src'
import {makeClient} from '@wharfkit/mock-data'

const client = makeClient('https://jungle4.greymass.com')

suite('AccountKit', function () {
    let accountKit: AccountKit

    this.beforeAll(function () {
        accountKit = new AccountKit({client})
    })

    suite('constructor', function () {
        test('throws error if client is not provided', function () {
            try {
                new AccountKit({} as any)
            } catch (error) {
                assert.equal(
                    error.message,
                    'A `client` must be passed when initializing the AccountKit.'
                )
            }
        })

        test('sets client if provided', function () {
            expect(accountKit.client).to.exist
        })

        test('allow overriding of default contract', function () {
            const kit = new AccountKit({
                client,
                contract: new SystemContract.Contract({client: makeClient()}),
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
