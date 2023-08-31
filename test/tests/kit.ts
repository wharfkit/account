import {assert, expect} from 'chai'

import { APIClient } from '@wharfkit/antelope';

import { Account, AccountKit } from '../../src';
import { MockProvider } from 'test/utils/mock-provider';

const eosApiClient = new APIClient({
    provider: new MockProvider('https://eos.greymass.com'),
})

suite('AccountKit', function() {
    let accountKit: AccountKit;

    this.beforeAll(function() {
        const client = eosApiClient;
        accountKit = new AccountKit({ client });
    });

    suite('constructor', function() {
        test('throws error if client is not provided', function() {
            try {
                new AccountKit({} as any)
            } catch (error) {
                assert.equal(error.message, 'A `client` must be passed when initializing the AccountKit.');
            }
        });

        test('sets client if provided', function() {
            expect(accountKit.client).to.exist;
        });
    });

    suite('load', function() {
        test('throws error if account does not exist', async function() {
            try {
                await accountKit.load('nonexistent');
                assert.fail();
            } catch (error) {
                assert.equal(error.message, 'Account nonexistent does not exist');
            }
        });

        test('returns an Account object when account exists', async function() {
            const account = await accountKit.load('teamgreymass');
            expect(account).to.be.instanceOf(Account);
        })
    });
});
