import { useCallback } from "react";

import { enUSMessages } from "./en-US";
import { zhCNMessages } from "./zh-CN";
import { useLocaleStore, type AppLocale } from "@/stores/use-locale-store";

export const locales = ["en-US", "zh-CN"] as const satisfies readonly AppLocale[];
export type TranslationKey = keyof typeof enUSMessages;

const messages: Record<AppLocale, Record<TranslationKey, string>> = {
    "en-US": enUSMessages,
    "zh-CN": zhCNMessages,
};

export function translate(locale: AppLocale, key: TranslationKey) {
    return messages[locale][key] || messages["en-US"][key];
}

export function useTranslation() {
    const locale = useLocaleStore((state) => state.locale);
    const t = useCallback((key: TranslationKey) => translate(locale, key), [locale]);
    return { locale, t };
}
