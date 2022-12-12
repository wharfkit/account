
import { Asset, AssetType } from '@greymass/eosio';

interface FilteringParams {
    above: AssetType;
    below: AssetType;
}

export class Balances {
    balances: Asset[];

    constructor(balances: Asset[] = []) {
        this.balances = balances;
    }

    static from(balances: AssetType[]): Balances {
        return new Balances(balances.map(balance => Asset.from(balance)) || []);
    }

    get total(): Asset {
        return this.balances.reduce((total, balance) => total.add(balance), Asset.from(0));
    }

    get(symbolCode: Asset.SymbolCodeType): Asset {
        return this.balances.find(balance => balance.symbol.code.equals(symbolCode)) || Asset.from(0, symbolCode);
    }

    sort(): Asset[] {
        return this.balances.sort((a, b) => b.value - a.value);
    }

    filter({ above, below }: FilteringParams): Asset[] {
        return this.balances.filter(balance => {
            return balance.value > Number(above) && balance.value < Number(below);
        })
    }
}