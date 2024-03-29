import {assert, expect} from 'chai'

import {Account, AccountKit, SystemContract} from '../../src'
import {makeClient} from '@wharfkit/mock-data'
import {API} from '@wharfkit/antelope'
import {ChainDefinition, Chains, TelosAccountObject, WAXAccountObject} from '@wharfkit/common'

const client = makeClient('https://jungle4.greymass.com')

suite('AccountKit', function () {
    let accountKit: AccountKit

    this.beforeAll(function () {
        accountKit = new AccountKit(Chains.Jungle4, {
            client: makeClient('https://jungle4.greymass.com'),
        })
    })

    suite('constructor', function () {
        test('sets client from chain definition provided', function () {
            expect(accountKit.client).to.exist
        })

        test('allow overriding of default contract', function () {
            const kit = new AccountKit(Chains.Jungle4, {
                client: makeClient('https://jungle4.greymass.com'),
                contract: new SystemContract.Contract({client}),
            })

            expect(kit.contract).to.exist
        })
    })

    suite('load', function () {
        this.beforeAll(function () {
            accountKit = new AccountKit(Chains.Jungle4, {client})
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

        test('returns the default account object type on EOS', async function () {
            const kit = new AccountKit(Chains.EOS, {client: makeClient('https://eos.greymass.com')})
            const account = await kit.load('teamgreymass')
            expect(account.data).to.be.instanceOf(API.v1.AccountObject)
            expect(account.data).not.to.be.instanceOf(TelosAccountObject)
            expect(account.data).not.to.be.instanceOf(WAXAccountObject)
        })

        test('returns telos account type', async function () {
            const kit = new AccountKit(Chains.Telos, {
                client: makeClient('https://telos.greymass.com'),
            })
            const account = await kit.load('teamgreymass')
            expect(account.data).to.be.instanceOf(API.v1.AccountObject)
            expect(account.data).not.to.be.instanceOf(WAXAccountObject)
            expect(account.data).to.be.instanceOf(TelosAccountObject)
            assert.isDefined(account.data.voter_info?.last_stake)
        })

        test('returns wax account type', async function () {
            const kit = new AccountKit(Chains.WAX, {client: makeClient('https://wax.greymass.com')})
            const account = await kit.load('teamgreymass')
            expect(account.data).to.be.instanceOf(API.v1.AccountObject)
            expect(account.data).not.to.be.instanceOf(TelosAccountObject)
            expect(account.data).to.be.instanceOf(WAXAccountObject)
            assert.isDefined(account.data.voter_info?.unpaid_voteshare)
            assert.isDefined(account.data.voter_info?.unpaid_voteshare_last_updated)
            assert.isDefined(account.data.voter_info?.unpaid_voteshare_change_rate)
            assert.isDefined(account.data.voter_info?.last_claim_time)
        })

        test('returns wax account type from custom definition', async function () {
            const kit = new AccountKit(
                ChainDefinition.from<WAXAccountObject>({
                    id: '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4',
                    url: 'https://wax.greymass.com',
                    accountDataType: WAXAccountObject,
                }),
                {
                    client: makeClient('https://wax.greymass.com'),
                }
            )
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
