type SwitchCaseRange = {
    left: number | '-inf'
    right: number | 'inf'
    includeLeft: boolean
    includeRight: boolean
}
type SwitchCaseType = SwitchCaseRange | number | string

export default class SwitchFormatter {
    private readonly key: string
    private readonly cases: [SwitchCaseType, string][]

    constructor(key: string, data: string) {
        this.key = key
        this.cases = []
        const parts = data.split('|')

        for (const part of parts) {
            const [condition, value] = part.split(':')
            if (!value)
                throw new Error(`Invalid data: ${data} (Should be "condition:value")`)
            this.cases.push([this.parseCondition(condition), value])
        }
    }

    private parseCondition(condition: string): SwitchCaseType {
        const match = condition.match(/(-inf|\d+!?)-(\d+!?|inf)/)
        if (!match) {
            if (!Number.isNaN(parseInt(condition)))
                return parseInt(condition)
            return condition
        }
        const data: SwitchCaseRange = {
            left: match[1] === '-inf' ? match[1] : parseInt(match[1]),
            right: match[2] === 'inf' ? match[2] : parseInt(match[2]),
            includeLeft: match[1].endsWith('!'),
            includeRight: match[2].endsWith('!')
        }
        if (data.left === '-inf' && data.right === 'inf')
            throw new Error('Invalid range (would always evaluate to true)')
        if (data.left > data.right)
            throw new Error('Invalid range (left bound is greater than right bound)')
        return data
    }

    private matchCondition(condition: SwitchCaseType, value: any): boolean {
        if (typeof condition === 'number' && typeof value === 'number')
            return value === condition
        if (typeof condition === 'string' && typeof value === 'string')
            return value === condition
        if (typeof condition !== 'object')
            throw new Error(`Invalid condition type: ${condition}`)
        if (typeof value !== 'number')
            throw new Error(`Invalid value type: ${value}`)
        if (condition.left === '-inf')
            return (condition.includeRight ? value <= <number>condition.right : value < <number>condition.right)
        if (condition.right === 'inf')
            return (condition.includeLeft ? value >= condition.left : value > condition.left)
        return (condition.includeLeft ? value >= condition.left : value > condition.left) &&
            (condition.includeRight ? value <= condition.right : value < condition.right)
    }

    public resolve(object: any): string {
        if (this.key in object) {
            const value = object[this.key]
            for (const [condition, result] of this.cases) {
                if (this.matchCondition(condition, value))
                    return result
            }
            throw new Error(`No matching case for key "${this.key}" with value ${value}`)
        } else throw new Error(`Missing key "${this.key}"`)
    }

}
