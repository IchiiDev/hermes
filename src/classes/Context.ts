import LangData from "./LangData";

export default class Context {

    private readonly data: LangData
    private readonly basePath: string

    public static create(data: LangData, basePath: string = '') {
        return new Context(data, basePath)
    }

    private constructor(data: LangData, basePath: string) {
        this.data = data
        this.basePath = basePath
    }

    public t(key: string, object?: any) {
        const value = this.data.getStrings()[(this.basePath !== '') ? `${this.basePath}.${key}`: key]
        if (!value)
            throw new Error(`Translation not found for key: ${(this.basePath !== '') ? `${this.basePath}.${key}` : key} in lang: ${this.data.lang}`)
        return this.data.getStrings()[(this.basePath !== '') ? `${this.basePath}.${key}`: key].resolve(object)
    }

}
