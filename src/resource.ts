import {API, Int64} from '@wharfkit/antelope'

export type ResourceType = 'cpu' | 'net' | 'ram'

export interface ResourceValues {
    available: Int64
    used: Int64
    max: Int64
}

export class Resource {
    public resource: ResourceType
    public data: API.v1.AccountObject

    readonly available: Int64
    readonly used: Int64
    readonly max: Int64

    readonly weight?: Int64

    constructor(resource: ResourceType, data: API.v1.AccountObject) {
        this.resource = resource
        this.data = data
        switch (resource) {
            case 'cpu': {
                this.available = this.data.cpu_limit.available
                this.used = this.data.cpu_limit.used
                this.max = this.data.cpu_limit.max
                this.weight = this.data.cpu_weight
                break
            }
            case 'net': {
                this.available = this.data.net_limit.available
                this.used = this.data.net_limit.used
                this.max = this.data.net_limit.max
                this.weight = this.data.net_weight
                break
            }
            case 'ram': {
                this.available = this.data.ram_quota.subtracting(this.data.ram_usage)
                this.used = Int64.from(this.data.ram_usage)
                this.max = this.data.ram_quota
                break
            }
            default: {
                throw new Error(`Unknown resource type (${resource}).`)
            }
        }
    }
}
