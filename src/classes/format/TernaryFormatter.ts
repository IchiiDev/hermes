export default class TernaryFormatter {

    private readonly key: string
    private readonly thenData: string
    private readonly elseData: string

    constructor(key: string, data: string) {
        const parts = data.split('|')
        if (parts.length !== 2)
            throw new Error(`Invalid data: ${data} (Should be "then|else")`)
        this.key = key
        this.thenData = parts[0]
        this.elseData = parts[1]
    }

    public resolve(object: any): string {
        if (this.key in object && typeof object[this.key] === 'boolean')
            return object[this.key] ? this.thenData : this.elseData
        throw new Error(`Missing or invalid key "${this.key}" (should be boolean)`)
    }

}
