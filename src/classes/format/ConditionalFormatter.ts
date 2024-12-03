export default class ConditionalFormatter {
    private readonly key: string
    private readonly data: string

    constructor(key: string, data: string) {
        this.key = key
        this.data = data
    }

    public resolve(object: any): string {
        if (this.key in object && typeof object[this.key] === 'boolean')
            return object[this.key] ? this.data : ''
        throw new Error(`Missing or invalid key "${this.key}" (should be boolean)`)
    }

}
