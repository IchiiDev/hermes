export default class PluralFormatter {

    private readonly key: string
    private readonly oneData: string
    private readonly pluralData: string
    private readonly zeroData: string | undefined

    constructor(key: string, data: string) {
        const parts = data.split('|')
        if (parts.length < 2)
            throw new Error(`Invalid data: ${data} (Should be "one|plural[|zero]")`)
        this.key = key
        this.oneData = parts[0]
        this.pluralData = parts[1]
        this.zeroData = parts[2]
    }

    public resolve(object: any): string {
        if (this.key in object && typeof object[this.key] === 'number') {
            if (object[this.key] === 0 && this.zeroData)
                return this.zeroData
            return object[this.key] === 1 ? this.oneData : this.pluralData
        }
        throw new Error(`Missing or invalid key "${this.key}" (should be number)`)
    }

}
