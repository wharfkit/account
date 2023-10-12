import {assert} from 'chai'
import {API, Asset, Authority, Int64, KeyWeight, Serializer} from '@wharfkit/antelope'
import {makeClient, mockSessionArgs, mockSessionOptions} from '@wharfkit/mock-data'
import {Session} from '@wharfkit/session'
import {PlaceholderAuth} from '@wharfkit/signing-request'

import {Account, AccountKit, Chains, Permission, SystemContract} from '../../src'

const mockAccountName = 'wharfkit1133'

const client = makeClient('https://jungle4.greymass.com')
const accountKit = new AccountKit(Chains.Jungle4, { client })
const session = new Session(
    {
        ...mockSessionArgs,
        actor: mockAccountName,
        permission: 'active',
        permissionLevel: `${mockAccountName}@active`,
    },
    mockSessionOptions
)

suite('Account', function () {
    let testAccount: Account

    setup(async function () {
        testAccount = await accountKit.load(mockAccountName)
    })

    test('construct', function () {
        const account = new Account({
            client,
            data: testAccount.data,
        })

        assert.instanceOf(account, Account)
    })
    test('accountName', function () {
        assert.isTrue(testAccount.accountName.equals('wharfkit1133'))
    })

    suite('data', function () {
        test('returns account data', async function () {
            assert.instanceOf(testAccount.data, API.v1.AccountObject)
        })
    })

    suite('permission', function () {
        test('returns permission object', async function () {
            assert.instanceOf(testAccount.permission('active'), Permission)
        })

        test('throws error when permission does not exist', function () {
            assert.throws(() => testAccount.permission('nonexistent'))
        })
    })

    suite('resource', function () {
        this.slow(200)
        this.timeout(5 * 1000)

        test('cpu', async function () {
            const resources = testAccount.resource('cpu')
            assert.instanceOf(resources.available, Int64)
            assert.instanceOf(resources.used, Int64)
            assert.instanceOf(resources.max, Int64)
        })

        test('net', async function () {
            const resources = testAccount.resource('net')
            assert.instanceOf(resources.available, Int64)
            assert.instanceOf(resources.used, Int64)
            assert.instanceOf(resources.max, Int64)
        })

        test('ram', async function () {
            const resources = testAccount.resource('ram')
            assert.instanceOf(resources.available, Int64)
            assert.instanceOf(resources.used, Int64)
            assert.instanceOf(resources.max, Int64)
        })
    })

    suite('setPermission', () => {
        test('basic syntax', () => {
            const auth = Authority.from({
                accounts: [],
                keys: [],
                threshold: 1,
                waits: [],
            })
            const permission = Permission.from({
                parent: 'active',
                perm_name: 'foo',
                required_auth: auth,
            })
            const action = testAccount.setPermission(permission)
            assert.isTrue(action.account.equals('eosio'))
            assert.isTrue(action.name.equals('updateauth'))
            assert.isTrue(action.authorization[0].equals(PlaceholderAuth))

            const decoded = Serializer.decode({
                data: action.data,
                type: SystemContract.Types.Updateauth,
            })
            assert.isTrue(decoded.account.equals('wharfkit1133'))
            assert.isTrue(decoded.parent.equals('active'))
            assert.isTrue(decoded.permission.equals('foo'))
            assert.isTrue(decoded.auth.equals(auth))
        })
        suite('create and remove permission', function () {
            test('create new permission', async () => {
                // Setup new permission, will be removed in next test
                const permission = Permission.from({
                    parent: 'active',
                    perm_name: 'unittest',
                    required_auth: Authority.from({
                        accounts: [],
                        keys: [],
                        threshold: 1,
                        waits: [],
                    }),
                })
                // Mutate to add a key
                permission.addKey('PUB_K1_6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5BoDq63')
                // Get action to commit change to chain
                const action = testAccount.setPermission(permission)
                await session.transact({action}, {broadcast: true})
            })
            test('remove it', async () => {
                const action = testAccount.removePermission('unittest')
                assert.isTrue(action.account.equals('eosio'))
                assert.isTrue(action.name.equals('deleteauth'))
                assert.isTrue(action.authorization[0].equals(PlaceholderAuth))

                const decoded = Serializer.decode({
                    data: action.data,
                    type: SystemContract.Types.Deleteauth,
                })
                assert.isTrue(decoded.account.equals('wharfkit1133'))
                assert.isTrue(decoded.permission.equals('unittest'))

                await session.transact({action}, {broadcast: true})
            })
        })
        suite('modify existing', function () {
            test('adding key', async () => {
                // Retrieve existing permission
                const permission = testAccount.permission('active')
                const originalKey = 'EOS6RMS3nvoN9StPzZizve6WdovaDkE5KkEcCDXW7LbepyAioMiK6'
                // Mutate to add a key
                permission.addKey('PUB_K1_6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5BoDq63')
                // Get action to commit change to chain
                const action = testAccount.setPermission(permission)
                assert.isTrue(action.account.equals('eosio'))
                assert.isTrue(action.name.equals('updateauth'))
                assert.isTrue(action.authorization[0].equals(PlaceholderAuth))

                const decoded = Serializer.decode({
                    data: action.data,
                    type: SystemContract.Types.Updateauth,
                })
                assert.isTrue(decoded.account.equals('wharfkit1133'))
                assert.isTrue(decoded.parent.equals('owner'))
                assert.isTrue(decoded.permission.equals('active'))
                assert.isTrue(decoded.auth.keys[0].key.equals(permission.required_auth.keys[0].key))
                assert.isTrue(
                    decoded.auth.keys[0].weight.equals(permission.required_auth.keys[0].weight)
                )
                // The keys will be reordered due to sorting requirements
                assert.isTrue(
                    decoded.auth.keys[0].key.equals(
                        'PUB_K1_6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5BoDq63'
                    )
                )
                assert.isTrue(decoded.auth.keys[1].key.equals(originalKey))
                assert.isTrue(decoded.auth.keys[1].weight.equals(1))
                assert.isTrue(decoded.auth.equals(permission.required_auth))

                await session.transact({action}, {broadcast: true})
            })
            test('remove key', async () => {
                // Retrieve existing permission
                const permission = testAccount.permission('active')
                const originalKey = 'EOS6RMS3nvoN9StPzZizve6WdovaDkE5KkEcCDXW7LbepyAioMiK6'
                // It needs to be added here because the cached record doesn't have it.
                // It should exist on-chain already due to the previous test.
                // Unsure how to get around this.
                permission.required_auth.keys.push(
                    KeyWeight.from({
                        key: 'PUB_K1_6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5BoDq63',
                        weight: 1,
                    })
                )
                permission.required_auth.sort()
                // Mutate to remove a key
                permission.removeKey('PUB_K1_6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5BoDq63')
                // Get action to commit change to chain
                const action = testAccount.setPermission(permission)
                assert.isTrue(action.account.equals('eosio'))
                assert.isTrue(action.name.equals('updateauth'))
                assert.isTrue(action.authorization[0].equals(PlaceholderAuth))

                const decoded = Serializer.decode({
                    data: action.data,
                    type: SystemContract.Types.Updateauth,
                })
                assert.isTrue(decoded.account.equals('wharfkit1133'))
                assert.isTrue(decoded.parent.equals('owner'))
                assert.isTrue(decoded.permission.equals('active'))
                assert.isTrue(decoded.auth.keys[0].key.equals(originalKey))
                assert.isTrue(decoded.auth.keys[0].weight.equals(1))
                assert.isTrue(decoded.auth.equals(permission.required_auth))

                await session.transact({action}, {broadcast: true})
            })
        })
    })

    test('linkauth', () => {
        const action = testAccount.linkauth('eosio.token', 'transfer', 'active')
        assert.isTrue(action.account.equals('eosio'))
        assert.isTrue(action.name.equals('linkauth'))
        assert.isTrue(action.authorization[0].equals(PlaceholderAuth))

        const decoded = Serializer.decode({data: action.data, type: SystemContract.Types.Linkauth})
        assert.isTrue(decoded.account.equals('wharfkit1133'))
        assert.isTrue(decoded.code.equals('eosio.token'))
        assert.isTrue(decoded.type.equals('transfer'))
        assert.isTrue(decoded.requirement.equals('active'))
    })

    test('unlinkauth', () => {
        const action = testAccount.unlinkauth('eosio.token', 'transfer')
        assert.isTrue(action.account.equals('eosio'))
        assert.isTrue(action.name.equals('unlinkauth'))
        assert.isTrue(action.authorization[0].equals(PlaceholderAuth))

        const decoded = Serializer.decode({
            data: action.data,
            type: SystemContract.Types.Unlinkauth,
        })
        assert.isTrue(decoded.account.equals('wharfkit1133'))
        assert.isTrue(decoded.code.equals('eosio.token'))
        assert.isTrue(decoded.type.equals('transfer'))
    })

    suite('buyRam', () => {
        test('only amount', () => {
            const action = testAccount.buyRam('1.0000 EOS')
            assert.isTrue(action.account.equals('eosio'))
            assert.isTrue(action.name.equals('buyram'))
            assert.isTrue(action.authorization[0].equals(PlaceholderAuth))

            const decoded = Serializer.decode({
                data: action.data,
                type: SystemContract.Types.Buyram,
            })
            assert.isTrue(decoded.payer.equals('wharfkit1133'))
            assert.isTrue(decoded.receiver.equals('wharfkit1133'))
            assert.isTrue(decoded.quant.equals('1.0000 EOS'))
        })
        test('override receiver', () => {
            const action = testAccount.buyRam('1.0000 EOS', {
                receiver: 'wharfkit1112',
            })
            assert.isTrue(action.account.equals('eosio'))
            assert.isTrue(action.name.equals('buyram'))
            assert.isTrue(action.authorization[0].equals(PlaceholderAuth))

            const decoded = Serializer.decode({
                data: action.data,
                type: SystemContract.Types.Buyram,
            })
            assert.isTrue(decoded.payer.equals('wharfkit1133'))
            assert.isTrue(decoded.receiver.equals('wharfkit1112'))
            assert.isTrue(decoded.quant.equals('1.0000 EOS'))
        })
    })

    suite('buyRamBytes', () => {
        test('only bytes', () => {
            const action = testAccount.buyRamBytes(1024)
            assert.isTrue(action.account.equals('eosio'))
            assert.isTrue(action.name.equals('buyrambytes'))
            assert.isTrue(action.authorization[0].equals(PlaceholderAuth))

            const decoded = Serializer.decode({
                data: action.data,
                type: SystemContract.Types.Buyrambytes,
            })
            assert.isTrue(decoded.payer.equals('wharfkit1133'))
            assert.isTrue(decoded.receiver.equals('wharfkit1133'))
            assert.isTrue(decoded.bytes.equals(1024))
        })
        test('override receiver', () => {
            const action = testAccount.buyRamBytes(1024, {
                receiver: 'wharfkit1112',
            })
            assert.isTrue(action.account.equals('eosio'))
            assert.isTrue(action.name.equals('buyrambytes'))
            assert.isTrue(action.authorization[0].equals(PlaceholderAuth))

            const decoded = Serializer.decode({
                data: action.data,
                type: SystemContract.Types.Buyrambytes,
            })
            assert.isTrue(decoded.payer.equals('wharfkit1133'))
            assert.isTrue(decoded.receiver.equals('wharfkit1112'))
            assert.isTrue(decoded.bytes.equals(1024))
        })
    })

    test('sellRam', () => {
        const action = testAccount.sellRam(1024)
        assert.isTrue(action.account.equals('eosio'))
        assert.isTrue(action.name.equals('sellram'))
        assert.isTrue(action.authorization[0].equals(PlaceholderAuth))

        const decoded = Serializer.decode({data: action.data, type: SystemContract.Types.Sellram})
        assert.isTrue(decoded.account.equals('wharfkit1133'))
        assert.isTrue(decoded.bytes.equals(1024))
    })

    suite('delegate', () => {
        test('no data', () => {
            const action = testAccount.delegate({})
            assert.isTrue(action.account.equals('eosio'))
            assert.isTrue(action.name.equals('delegatebw'))
            assert.isTrue(action.authorization[0].equals(PlaceholderAuth))

            const decoded = Serializer.decode({
                data: action.data,
                type: SystemContract.Types.Delegatebw,
            })
            assert.isTrue(decoded.from.equals('wharfkit1133'))
            assert.isTrue(decoded.receiver.equals('wharfkit1133'))
            assert.isTrue(decoded.stake_cpu_quantity.equals('0.0000 EOS'))
            assert.isTrue(decoded.stake_net_quantity.equals('0.0000 EOS'))
            assert.isFalse(decoded.transfer)
        })
        test('cpu only', () => {
            const action = testAccount.delegate({cpu: '1.0000 EOS'})
            assert.isTrue(action.account.equals('eosio'))
            assert.isTrue(action.name.equals('delegatebw'))
            assert.isTrue(action.authorization[0].equals(PlaceholderAuth))

            const decoded = Serializer.decode({
                data: action.data,
                type: SystemContract.Types.Delegatebw,
            })
            assert.isTrue(decoded.from.equals('wharfkit1133'))
            assert.isTrue(decoded.receiver.equals('wharfkit1133'))
            assert.isTrue(decoded.stake_cpu_quantity.equals('1.0000 EOS'))
            assert.isTrue(decoded.stake_net_quantity.equals('0.0000 EOS'))
            assert.isFalse(decoded.transfer)
        })
        test('net only', () => {
            const action = testAccount.delegate({net: '1.0000 EOS'})
            assert.isTrue(action.account.equals('eosio'))
            assert.isTrue(action.name.equals('delegatebw'))
            assert.isTrue(action.authorization[0].equals(PlaceholderAuth))

            const decoded = Serializer.decode({
                data: action.data,
                type: SystemContract.Types.Delegatebw,
            })
            assert.isTrue(decoded.from.equals('wharfkit1133'))
            assert.isTrue(decoded.receiver.equals('wharfkit1133'))
            assert.isTrue(decoded.stake_cpu_quantity.equals('0.0000 EOS'))
            assert.isTrue(decoded.stake_net_quantity.equals('1.0000 EOS'))
            assert.isFalse(decoded.transfer)
        })
        test('cpu and net', () => {
            const action = testAccount.delegate({cpu: '1.0000 EOS', net: '0.5000 EOS'})
            assert.isTrue(action.account.equals('eosio'))
            assert.isTrue(action.name.equals('delegatebw'))
            assert.isTrue(action.authorization[0].equals(PlaceholderAuth))

            const decoded = Serializer.decode({
                data: action.data,
                type: SystemContract.Types.Delegatebw,
            })
            assert.isTrue(decoded.from.equals('wharfkit1133'))
            assert.isTrue(decoded.receiver.equals('wharfkit1133'))
            assert.isTrue(decoded.stake_cpu_quantity.equals('1.0000 EOS'))
            assert.isTrue(decoded.stake_net_quantity.equals('0.5000 EOS'))
            assert.isFalse(decoded.transfer)
        })
        test('override receiver', () => {
            const action = testAccount.delegate({
                cpu: '1.0000 EOS',
                net: '0.5000 EOS',
                receiver: 'wharfkit1112',
            })
            assert.isTrue(action.account.equals('eosio'))
            assert.isTrue(action.name.equals('delegatebw'))
            assert.isTrue(action.authorization[0].equals(PlaceholderAuth))

            const decoded = Serializer.decode({
                data: action.data,
                type: SystemContract.Types.Delegatebw,
            })
            assert.isTrue(decoded.from.equals('wharfkit1133'))
            assert.isTrue(decoded.receiver.equals('wharfkit1112'))
            assert.isTrue(decoded.stake_cpu_quantity.equals('1.0000 EOS'))
            assert.isTrue(decoded.stake_net_quantity.equals('0.5000 EOS'))
            assert.isFalse(decoded.transfer)
        })
        test('override receiver and enable transfer', () => {
            const action = testAccount.delegate({
                cpu: '1.0000 EOS',
                net: '0.5000 EOS',
                receiver: 'wharfkit1112',
                transfer: true,
            })
            assert.isTrue(action.account.equals('eosio'))
            assert.isTrue(action.name.equals('delegatebw'))
            assert.isTrue(action.authorization[0].equals(PlaceholderAuth))

            const decoded = Serializer.decode({
                data: action.data,
                type: SystemContract.Types.Delegatebw,
            })
            assert.isTrue(decoded.from.equals('wharfkit1133'))
            assert.isTrue(decoded.receiver.equals('wharfkit1112'))
            assert.isTrue(decoded.stake_cpu_quantity.equals('1.0000 EOS'))
            assert.isTrue(decoded.stake_net_quantity.equals('0.5000 EOS'))
            assert.isTrue(decoded.transfer)
        })
    })

    suite('undelegate', () => {
        test('no data', () => {
            const action = testAccount.undelegate({})
            assert.isTrue(action.account.equals('eosio'))
            assert.isTrue(action.name.equals('undelegatebw'))
            assert.isTrue(action.authorization[0].equals(PlaceholderAuth))

            const decoded = Serializer.decode({
                data: action.data,
                type: SystemContract.Types.Undelegatebw,
            })
            assert.isTrue(decoded.from.equals('wharfkit1133'))
            assert.isTrue(decoded.receiver.equals('wharfkit1133'))
            assert.isTrue(decoded.unstake_cpu_quantity.equals('0.0000 EOS'))
            assert.isTrue(decoded.unstake_net_quantity.equals('0.0000 EOS'))
        })
        test('cpu only', () => {
            const action = testAccount.undelegate({cpu: '1.0000 EOS'})
            assert.isTrue(action.account.equals('eosio'))
            assert.isTrue(action.name.equals('undelegatebw'))
            assert.isTrue(action.authorization[0].equals(PlaceholderAuth))

            const decoded = Serializer.decode({
                data: action.data,
                type: SystemContract.Types.Undelegatebw,
            })
            assert.isTrue(decoded.from.equals('wharfkit1133'))
            assert.isTrue(decoded.receiver.equals('wharfkit1133'))
            assert.isTrue(decoded.unstake_cpu_quantity.equals('1.0000 EOS'))
            assert.isTrue(decoded.unstake_net_quantity.equals('0.0000 EOS'))
        })
        test('net only', () => {
            const action = testAccount.undelegate({net: '1.0000 EOS'})
            assert.isTrue(action.account.equals('eosio'))
            assert.isTrue(action.name.equals('undelegatebw'))
            assert.isTrue(action.authorization[0].equals(PlaceholderAuth))

            const decoded = Serializer.decode({
                data: action.data,
                type: SystemContract.Types.Undelegatebw,
            })
            assert.isTrue(decoded.from.equals('wharfkit1133'))
            assert.isTrue(decoded.receiver.equals('wharfkit1133'))
            assert.isTrue(decoded.unstake_cpu_quantity.equals('0.0000 EOS'))
            assert.isTrue(decoded.unstake_net_quantity.equals('1.0000 EOS'))
        })
        test('cpu and net', () => {
            const action = testAccount.undelegate({cpu: '1.0000 EOS', net: '0.5000 EOS'})
            assert.isTrue(action.account.equals('eosio'))
            assert.isTrue(action.name.equals('undelegatebw'))
            assert.isTrue(action.authorization[0].equals(PlaceholderAuth))

            const decoded = Serializer.decode({
                data: action.data,
                type: SystemContract.Types.Undelegatebw,
            })
            assert.isTrue(decoded.from.equals('wharfkit1133'))
            assert.isTrue(decoded.receiver.equals('wharfkit1133'))
            assert.isTrue(decoded.unstake_cpu_quantity.equals('1.0000 EOS'))
            assert.isTrue(decoded.unstake_net_quantity.equals('0.5000 EOS'))
        })
        test('override receiver', () => {
            const action = testAccount.undelegate({
                cpu: '1.0000 EOS',
                net: '0.5000 EOS',
                receiver: 'wharfkit1112',
            })
            assert.isTrue(action.account.equals('eosio'))
            assert.isTrue(action.name.equals('undelegatebw'))
            assert.isTrue(action.authorization[0].equals(PlaceholderAuth))

            const decoded = Serializer.decode({
                data: action.data,
                type: SystemContract.Types.Undelegatebw,
            })
            assert.isTrue(decoded.from.equals('wharfkit1133'))
            assert.isTrue(decoded.receiver.equals('wharfkit1112'))
            assert.isTrue(decoded.unstake_cpu_quantity.equals('1.0000 EOS'))
            assert.isTrue(decoded.unstake_net_quantity.equals('0.5000 EOS'))
        })
    })

    suite('balance', function () {
        this.slow(200)
        this.timeout(5 * 1000)

        test('returns resources object for system token', async function () {
            const balance = await testAccount.balance()
            assert.instanceOf(balance, Asset)
        })

        test('returns resources object for secondary token', async function () {
            const balance = await testAccount.balance('eosio.token', 'EOS')
            assert.instanceOf(balance, Asset)
        })

        test('throws error when token does not exist for given contract', function (done) {
            testAccount
                .balance('eosio.token', 'nonexist')
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
                .balance('nonexist')
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
