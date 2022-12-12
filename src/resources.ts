import { API, UInt64 } from '@greymass/eosio';

type ResourceValue = UInt64 | number;

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
        return {
            cpu: this.cpuNeeded,
            net: this.netNeeded,
            ram: this.ramNeeded,
        }
    }

    get surplusResources(): ResourcesType {
        return {
            cpu: this.surplusCpu,
            net: this.surplusNet,
            ram: this.surplusRam,
        };
    }

    get desiredResourceChanges(): ResourcesDeltaType {
        const resourcesDelta: ResourcesDeltaType = {};

        const resourcesToSell = this.surplusResources;

        const resourcesToBuy = this.resourcesNeeded;

        if (resourcesToBuy.cpu && resourcesToBuy.cpu > 0) {
            resourcesDelta.cpu_to_stake = resourcesToBuy.cpu;
        }

        if (resourcesToBuy.net && resourcesToBuy.net > 0) {
            resourcesDelta.net_to_stake = resourcesToBuy.net;
        }

        if (resourcesToBuy.ram && resourcesToBuy.ram > 0) {
            resourcesDelta.ram_to_buy = resourcesToBuy.ram;
        }

        if (resourcesToSell.cpu && resourcesToSell.cpu > 0) {
            resourcesDelta.cpu_to_unstake = resourcesToSell.cpu;
        }

        if (resourcesToSell.net && resourcesToSell.net > 0) {
            resourcesDelta.net_to_unstake = resourcesToSell.net;
        }

        if (resourcesToSell.ram && resourcesToSell.ram > 0) {
            resourcesDelta.ram_to_sell = resourcesToSell.ram;
        }

        return resourcesDelta
    }
}
