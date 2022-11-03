import {APIClient} from "@greymass/eosio";
import zlib from "zlib";
import {SigningRequest} from "eosio-signing-request";

const ESR_OPTIONS = {
    // string encoder
    TextEncoder,
    // string decoder
    TextDecoder,
    // zlib string compression (optional, recommended)
    zlib: {
        deflateRaw: (data) => new Uint8Array(zlib.deflateRawSync(Buffer.from(data))),
        inflateRaw: (data) => new Uint8Array(zlib.inflateRawSync(Buffer.from(data))),
    }
}

export function createESR(account, name, actionData) {

    const actions = [{
        account: 'eosio',
        name: 'voteproducer',
        authorization: [{
            actor: '............1',
            permission: '............2'
        }],
        data: actionData
    }]

    return SigningRequest.create({ actions }, ESR_OPTIONS)
}
