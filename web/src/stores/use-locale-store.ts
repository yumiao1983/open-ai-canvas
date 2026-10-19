import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AppLocale = "en-US" | "zh-CN";

type LocaleStore = {
    locale: AppLocale;
    setLocale: (locale: AppLocale) => void;
};

const supportedLocales: AppLocale[] = ["en-US", "zh-CN"];

export const useLocaleStore = create<LocaleStore>()(
    persist(
        (set) => ({
            locale: "en-US",
            setLocale: (locale) => set((state) => supportedLocales.includes(locale) ? { locale } : state),
        }),
        {
            name: "sceneform:locale",
            merge: (persisted, current) => {
                const locale = (persisted as Partial<LocaleStore> | undefined)?.locale;
                const resolvedLocale: AppLocale = supportedLocales.includes(locale as AppLocale) ? locale as AppLocale : "en-US";
                return { ...current, locale: resolvedLocale };
            },
        },
    ),
);
