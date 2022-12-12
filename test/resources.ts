import { assert } from 'chai'
import { mockAccountObject } from './mock-data'
import { Resources } from '../src/resources'

suite('Resources', function () {
    test('construct', function () {
        const resources = new Resources(
            111,
            222,
            333,
        )

        assert.instanceOf(resources, Resources)
    })

    test('from - with resource type object', function () {
        const resources = testResourcesInstance()

        assert.instanceOf(resources, Resources)
    })

    test('from - with API.v1.Account type object', function () {
        const resources = Resources.from(mockAccountObject)

        assert.instanceOf(resources, Resources)
    })

    test('cpu', function () {
        const resources = testResourcesInstance()

        assert.equal(resources.cpu, 333)
    })

    test('net', function () {
        const resources = testResourcesInstance()

        assert.equal(resources.net, 222)
    })

    test('ram', function () {
        const resources = testResourcesInstance()

        assert.equal(resources.ram, 111)
    })

    suite('update resource targets', function () {
        test('updateTargetRam', function () {
            const resources = testResourcesInstance()

            resources.updateTargetRam(444)

            assert.equal(resources.desired_ram, 444)
        })

        test('updateTargetCpu', function () {
            const resources = testResourcesInstance()

            resources.updateTargetCpu(555)

            assert.equal(resources.desired_cpu, 555)
        })

        test('updateTargetNet', function () {
            const resources = testResourcesInstance()

            resources.updateTargetNet(666)

            assert.equal(resources.desired_net, 666)
        })

        suite('updateTargetResources', function () {
            test('with all resources', function () {
                const resources = testResourcesInstance()

                resources.updateTargetResources({
                    cpu: 777,
                    net: 888,
                    ram: 999,
                })

                assert.equal(resources.desired_cpu, 777)
                assert.equal(resources.desired_net, 888)
                assert.equal(resources.desired_ram, 999)
            })

            test('with partial resources', function () {
                const resources = testResourcesInstance()

                resources.updateTargetResources({
                    cpu: 777,
                    net: 225,
                })

                assert.equal(resources.desired_cpu, 777)
                assert.equal(resources.desired_net, 225)
            })
        })
    })

    suite('needed resources', function () {
        suite('cpuNeeded', function () {
            test('with missing cpu', function () {
                const resources = testResourcesInstance()

                resources.updateTargetCpu(555)

                assert.equal(resources.cpuNeeded, 222)
            })

            test('with too much cpu', function () {
                const resources = testResourcesInstance()

                resources.updateTargetCpu(111)

                assert.equal(resources.cpuNeeded, 0)
            })
        })

        suite('netNeeded', function () {
            test('with missing net', function () {
                const resources = testResourcesInstance()

                resources.updateTargetNet(555)

                assert.equal(resources.netNeeded, 333)
            })

            test('with too much net', function () {
                const resources = testResourcesInstance()

                resources.updateTargetNet(111)

                assert.equal(resources.netNeeded, 0)
            })
        })

        suite('ramNeeded', function () {
            test('with missing ram', function () {
                const resources = testResourcesInstance()

                resources.updateTargetRam(555)

                assert.equal(resources.ramNeeded, 444)
            })

            test('with too much ram', function () {
                const resources = testResourcesInstance()

                resources.updateTargetRam(111)

                assert.equal(resources.ramNeeded, 0)
            })
        })
    })

    suite('surplus resources', function () {
        suite('surplusCpu', function () {
            test('with missing cpu', function () {
                const resources = testResourcesInstance()

                resources.updateTargetCpu(555)

                assert.equal(resources.surplusCpu, 0)
            })

            test('with too much cpu', function () {
                const resources = testResourcesInstance()

                resources.updateTargetCpu(111)

                assert.equal(resources.surplusCpu, 222)
            })
        })

        suite('surplusNet', function () {
            test('with missing net', function () {
                const resources = testResourcesInstance()

                resources.updateTargetNet(555)

                assert.equal(resources.surplusNet, 0)
            })

            test('with too much net', function () {
                const resources = testResourcesInstance()

                resources.updateTargetNet(111)

                assert.equal(resources.surplusNet, 111)
            })
        })

        suite('surplusRam', function () {
            test('with missing ram', function () {
                const resources = testResourcesInstance()

                resources.updateTargetRam(555)

                assert.equal(resources.surplusRam, 0)
            })

            test('with too much ram', function () {
                const resources = testResourcesInstance()

                resources.updateTargetRam(111)

                assert.equal(resources.surplusRam, 0)
            })
        })

        suite('surplusResources', function () {
            test('with missing resources', function () {
                const resources = testResourcesInstance()

                resources.updateTargetResources({
                    cpu: 555,
                    net: 666,
                    ram: 777,
                })

                assert.deepEqual(resources.surplusResources, {
                    cpu: 0,
                    net: 0,
                    ram: 0,
                })
            })

            test('with too much resources', function () {
                const resources = testResourcesInstance()

                resources.updateTargetResources({
                    cpu: 111,
                    net: 200,
                    ram: 333,
                })

                assert.deepEqual(resources.surplusResources, {
                    cpu: 222,
                    net: 22,
                    ram: 0,
                })
            })
        })
    })

    suite('desiredResourceChanges', function () {
        test('with no changes', function () {
            const resources = testResourcesInstance()

            resources.updateTargetResources({
                cpu: 333,
                net: 222,
                ram: 111,
            })

            assert.deepEqual(resources.desiredResourceChanges, {})
        })

        test('with changes', function () {
            const resources = testResourcesInstance()

            resources.updateTargetResources({
                cpu: 555,
                net: 666,
                ram: 777,
            })

            assert.deepEqual(resources.desiredResourceChanges, {
                cpu_to_stake: 222,
                net_to_stake: 444,
                ram_to_buy: 666,
            })
        })
    })
})

function testResourcesInstance(): Resources {
    return Resources.from({
        cpu: 333,
        net: 222,
        ram: 111,
    })
}
