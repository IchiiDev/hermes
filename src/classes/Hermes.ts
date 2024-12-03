import { readdir } from 'fs/promises'
import { Langs, LangsKeys } from '../types/Langs'
import LangData from './LangData'
import Context from './Context';
import { LocalizedObject } from '../types/LocalizedObject';

const getLogLevel = (strategy: WarnStrategy) => {
    switch (strategy) {
        case 'throw': return console.error;
        case 'warn': return console.warn;
        default: return console.log;
    }
}

export type WarnStrategy = 'throw' | 'warn' | 'ignore';

export type HermesInitOptions =  Partial<{
    translationDir: string,
    noMissingTranslations: WarnStrategy,
    noEmptyTranslations: WarnStrategy
}>

export default class Hermes {
    private constructor(options: HermesInitOptions) {
        this.options = options || {}
    }
    private static instance: Hermes
    private translations: Record<Langs, LangData> = {} as Record<Langs, LangData>
    private readonly options: HermesInitOptions = {}

    public static async init(options: HermesInitOptions = {
        translationDir: './translations', // default value
        noMissingTranslations: 'warn', // default value
        noEmptyTranslations: 'warn' // default value
    }) {
        if (Hermes.instance)
            throw new Error('I18n already initialized');
        if (!options.translationDir)
            options.translationDir = './translations';
        if (!options.noMissingTranslations)
            options.noMissingTranslations = 'warn';
        if (!options.noEmptyTranslations)
            options.noEmptyTranslations = 'warn';
        Hermes.instance = new Hermes(options);

        const dir = options?.translationDir;

        const files = await readdir(dir);
        for (const file of files) {
            const lang = file.replace('.json', '') as Langs;
            if (!Object.values(Langs).includes(lang))
                continue;
            Hermes.instance.translations[lang] = await LangData.create(lang, `${dir}/${file}`);
        }

        try {
            if (options?.noMissingTranslations && options.noMissingTranslations !== 'ignore')
                Hermes.instance.checkTranslations();
            if (options?.noEmptyTranslations && options.noEmptyTranslations !== 'ignore')
                Hermes.instance.checkEmptyTranslations();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    public static getContext(lang: LangsKeys, basePath: string = '') {
        if (!Hermes.instance)
            throw new Error('I18n not initialized');
        if (!Hermes.instance.translations[lang])
            throw new Error(`Translation not found for lang: ${lang}`);
        return Context.create(Hermes.instance.translations[lang], basePath);
    }

    public static getLocalizedObject(key: string): LocalizedObject {
        if (!Hermes.instance)
            throw new Error('I18n not initialized');
        const object: LocalizedObject = {};
        const langs = Object.keys(Hermes.instance.translations) as Langs[];

        for (const lang of langs) {
            if (!Hermes.instance.translations[lang].getStrings()[key])
                continue;
            object[lang] = Hermes.instance.translations[lang].getStrings()[key].resolve({});
        }
        return object;
    }

    private checkTranslations() {
        const langs = Object.keys(this.translations) as Langs[];

        const missingTranslations: Record<Langs, string[]> = {} as Record<Langs, string[]>;
        for (const lang of langs) {
            missingTranslations[lang] = [];
            for (const [key] of Object.entries(this.translations[lang].getStrings())) {
                for (const lang2 of langs) {
                    if (lang === lang2)
                        continue;
                    if (!this.translations[lang2].getStrings()[key])
                        missingTranslations[lang2].push(key);
                }
            }
        }

        const missingTranslationsCount = langs.reduce((acc, lang) => acc + missingTranslations[lang].length, 0);
        if (missingTranslationsCount === 0)
            return;
        if (this.options.noMissingTranslations === 'ignore')
            return;
        const logLevel = getLogLevel(this.options.noMissingTranslations!);
        logLevel('[i18n] Missing translations:');
        for (const lang of langs) {
            if (missingTranslations[lang].length === 0)
                continue;
            logLevel(`- ${lang}: ${missingTranslations[lang].length} missing translations:`);
            for (const key of missingTranslations[lang])
                logLevel(`  - ${key}`);
        }
        if (this.options.noMissingTranslations === 'throw')
            throw new Error('Missing translations');
        return;
    }

    private checkEmptyTranslations() {
        const langs = Object.keys(this.translations) as Langs[];

        const emptyTranslations: Record<Langs, string[]> = {} as Record<Langs, string[]>;
        for (const lang of langs) {
            emptyTranslations[lang] = [];
            for (const [key, value] of Object.entries(this.translations[lang].getStrings())) {
                if (value.isEmpty())
                    emptyTranslations[lang].push(key);
            }
        }

        const emptyTranslationsCount = langs.reduce((acc, lang) => acc + emptyTranslations[lang].length, 0);
        if (emptyTranslationsCount === 0)
            return;
        if (this.options.noEmptyTranslations === 'ignore')
            return;
        const logLevel = getLogLevel(this.options.noEmptyTranslations!);
        logLevel('[i18n] Empty translations:');
        for (const lang of langs) {
            if (emptyTranslations[lang].length === 0)
                continue;
            logLevel(`- ${lang}: ${emptyTranslations[lang].length} empty translations:`);
            for (const key of emptyTranslations[lang])
                logLevel(`  - ${key}`);
        }
        if (this.options.noEmptyTranslations === 'throw')
            throw new Error('Empty translations');
        return;
    }

}
