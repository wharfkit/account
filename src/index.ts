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

export {
    type ActionNameParams as SystemContractActionNameParams,
    type ActionNames as SystemContractActionNames,
} from './contracts/eosio'
