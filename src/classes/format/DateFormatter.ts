export default class DateFormatter {

    private readonly key: string
    private readonly format: string

    constructor(key: string, data: string) {
        this.key = key
        this.format = data
    }

    private formatDate(date: Date): string {
        // Format the date following the format string
        // Replace YY with the year (Last two numbers), MM with the month, and DD with the day
        // YYYY for the full year, hh for the hours, mm for the minutes, and ss for the seconds
        // D for the day of the week, M for the month name
        // Etc.
        return this.format
            .replace(/\bYYYY\b/, date.getFullYear().toString())
            .replace(/\bYY\b/, date.getFullYear().toString().slice(-2))
            .replace(/\bMM\b/, (date.getMonth() + 1).toString().padStart(2, '0'))
            .replace(/\bDD\b/, date.getDate().toString().padStart(2, '0'))
            .replace(/\bhh\b/, date.getHours().toString().padStart(2, '0'))
            .replace(/\bmm\b/, date.getMinutes().toString().padStart(2, '0'))
            .replace(/\bss\b/, date.getSeconds().toString().padStart(2, '0'))
    }

    public resolve(object: any): string {
        if (this.key in object && object[this.key] instanceof Date)
            return this.formatDate(object[this.key])
        throw new Error(`Missing key "${this.key}"`)
    }

}
