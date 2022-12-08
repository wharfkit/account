import { API, UInt64 } from '@greymass/eosio';

interface ResourcesType {
    cpu: UInt64;
    net: UInt64;
    ram: UInt64;
}

export class Resources {
    cpu_amount: number;
    net_amount: number;
    ram_amount: number;

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



}