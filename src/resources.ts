import { API, UInt64, AssetType } from '@greymass/eosio';

type ResourceValue = UInt64 | AssetType | number;

interface ResourcesType {
    cpu?: ResourceValue;
    net?: ResourceValue;
    ram?: ResourceValue;
}

interface ResourcesDeltaType {
    ram_to_buy?: ResourceValue;
    ram_to_sell?: ResourceValue;
    net_to_stake?: ResourceValue;
    net_to_unstake?: ResourceValue;
    cpu_to_stake?: ResourceValue;
    cpu_to_unstake?: ResourceValue;
}

export class Resources {
    cpu_amount: number;
    net_amount: number;
    ram_amount: number;
    desired_ram: number = 0;
    desired_cpu: number = 0;
    desired_net: number = 0;

    constructor(cpu, net, ram) {
        this.cpu_amount = cpu;
        this.net_amount = net;
        this.ram_amount = ram;
    }

    static from(accountData: API.v1.AccountObject | ResourcesType): Resources {
        if (accountData instanceof API.v1.AccountObject) {
            return new Resources(accountData.cpu_weight, accountData.net_weight, accountData.ram_quota);;
        }
        return new Resources(UInt64.from(accountData.cpu), UInt64.from(accountData.net), UInt64.from(accountData.ram));
    }

    get cpu(): number {
        return Number(this.cpu_amount);
    }

    get net(): number {
        return Number(this.net_amount);
    }

    get ram(): number {
        return Number(this.ram_amount);
    }

    updateTargetRam(bytes: ResourceValue): void {
        this.desired_ram = Number(bytes);
    }

    updateTargetCpu(cpu: ResourceValue): void {
        this.desired_cpu = Number(cpu);
    }

    updateTargetNet(net: ResourceValue): void {
        this.desired_net = Number(net);
    }

    updateTargetResources(resources: ResourcesType): void {
        if (resources.cpu) {
            this.updateTargetCpu(resources.cpu);
        }

        if (resources.net) {
            this.updateTargetNet(resources.net);
        }

        if (resources.ram) {
            this.updateTargetRam(resources.ram);
        }
    }

    get cpuNeeded(): number {
        return Math.max(this.desired_cpu - this.cpu, 0)
    }

    get netNeeded(): number {
        return Math.max(this.desired_net - this.net, 0)
    }

    get ramNeeded(): number {
        return Math.max(this.desired_ram - this.ram, 0)
    }

    get surplusRam(): number {
        return Math.max(this.ram - this.desired_ram, 0);
    }

    get surplusCpu(): number {
        return Math.max(this.cpu - this.desired_cpu, 0);
    }

    get surplusNet(): number {
        return Math.max(this.net - this.desired_net, 0);
    }

    get resourcesNeeded(): ResourcesType {
        const resources: ResourcesType = {};

        if (this.cpuNeeded > 0) {
            resources.cpu = this.cpuNeeded;
        }

        if (this.netNeeded > 0) {
            resources.net = this.netNeeded;
        }

        if (this.ramNeeded > 0) {
            resources.ram = this.ramNeeded;
        }

        return resources;
    }

    get surplusResources(): ResourcesType {
        const resources: ResourcesType = {};

        if (this.surplusCpu > 0) {
            resources.cpu = this.surplusCpu;
        }

        if (this.surplusNet > 0) {
            resources.net = this.surplusNet;
        }

        if (this.surplusRam > 0) {
            resources.ram = this.surplusRam;
        }

        return resources;
    }

    get desiredResourceChanges(): ResourcesDeltaType {
        const resources: ResourcesType = {};

        const resourcesToSell = this.surplusResources;

        const resourcesToBuy = this.resourcesNeeded;

        return {
            cpu_to_stake: resourcesToBuy.cpu,
            cpu_to_unstake: resourcesToSell.cpu,
            net_to_stake: resourcesToBuy.net,
            net_to_unstake: resourcesToSell.net,
            ram_to_buy: resourcesToBuy.ram,
            ram_to_sell: resourcesToSell.ram,
        }
    }
}
