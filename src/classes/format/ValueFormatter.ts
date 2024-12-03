export default class ValueFormatter {

    private readonly key: string

    constructor(key: string) {
        this.key = key
    }

    public resolve(object: any): string {
        if (this.key in object)
            return object[this.key]
        throw new Error(`Missing key "${this.key}"`)
        return ''
    }

}
