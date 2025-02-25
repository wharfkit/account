export * from './account'
export * from './permission'
export * from './resource'
export * from './kit'
import {abi, abiBlob, Contract, TableMap, Types} from './contracts/eosio'

export const SystemContract = {
    abi,
    abiBlob,
    Contract,
    TableMap,
    Types,
}
