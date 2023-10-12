import {assert, expect} from 'chai'

import {Account, AccountKit, Chains, SystemContract} from '../../src'
import {makeClient} from '@wharfkit/mock-data'
import { API } from '@wharfkit/antelope'
import { TelosAccountObject, WAXAccountObject } from 'src/types'

const client = makeClient('https://jungle4.greymass.com')

suite('AccountKit', function () {
    let accountKit: AccountKit

    this.beforeAll(function () {
        accountKit = new AccountKit(Chains.Jungle4)
    })

    suite('constructor', function () {
        test('sets client from chain definition provided', function () {
            expect(accountKit.client).to.exist
        })

        test('allow overriding of default contract', function () {
            const kit = new AccountKit(
                Chains.Jungle4,
                {   
                    contract: new SystemContract.Contract({ client }),
                },
            )

            expect(kit.contract).to.exist
        })
    })

    suite('load', function () {
        this.beforeAll(function () {
            accountKit = new AccountKit(Chains.Jungle4, { client })
        })

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

        test('returns telos account type', async function () {
            const kit = new AccountKit(Chains.Telos, { client: makeClient('https://telos.greymass.com') })
            const account = await kit.load('teamgreymass')
            expect(account.data).to.be.instanceOf(API.v1.AccountObject)
            expect(account.data).to.be.instanceOf(TelosAccountObject)
            expect(account.data).not.to.be.instanceOf(WAXAccountObject)
            assert.isDefined(account.data.voter_info?.last_stake)
        })

        test('returns wax account type', async function () {
            const kit = new AccountKit(Chains.WAX, { client: makeClient('https://wax.greymass.com') })
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
