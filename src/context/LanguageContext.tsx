"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import AsyncStorage from '@react-native-async-storage/async-storage';

type TranslationKeys = {
    settings: string;
    appearance: string;
    theme: string;
    fontSize: string;
    poemFontSize: string;
    language: string;
    about: string;
    version: string;
    favorites: string;
    noFavoritesYet: string;
    browseWriters: string;
    searchWriters: string;
    noWritersFound: string;
    poems: string;
    biography: string;
    books: string;
    developers: string;
    darkMode: string;
    lightMode: string;
    script: string;
    latin: string;
    cyrillic: string;
}

type Translations = {
    ru: TranslationKeys;
    uz: TranslationKeys;
}

interface LanguageContextType {
    language: keyof Translations;
    changeLanguage: (lang: keyof Translations) => void;
    translations: TranslationKeys;
}

const translations: Translations = {
    ru: {
        settings: "Настройки",
        appearance: "Внешний вид",
        theme: "Тёмный режим",
        fontSize: "Размер шрифта",
        poemFontSize: "Размер шрифта стихов",
        language: "Язык",
        about: "О приложении",
        version: "Версия",
        favorites: "Избранное",
        noFavoritesYet: "Пока нет избранного",
        browseWriters: "Просмотр писателей",
        searchWriters: "Поиск писателей...",
        noWritersFound: "Писатели не найдены",
        poems: "Стихи",
        biography: "Биография",
        books: "Книги",
        developers: "Разработчики",
        darkMode: "Тёмный режим",
        lightMode: "Светлый режим",
        script: "Алфавит",
        latin: "Латиница",
        cyrillic: "Кириллица"
    },
    uz: {
        settings: "Sozlamalar",
        appearance: "Ko'rinish",
        theme: "Tungi rejim",
        fontSize: "Shrift o'lchami",
        poemFontSize: "She'r shrift o'lchami",
        language: "Til",
        about: "Ilova haqida",
        version: "Versiya",
        favorites: "Sevimlilar",
        noFavoritesYet: "Hozircha sevimlilar yo'q",
        browseWriters: "Yozuvchilarni ko'rish",
        searchWriters: "Yozuvchilarni qidirish...",
        noWritersFound: "Yozuvchilar topilmadi",
        poems: "She'rlar",
        biography: "Biografiya",
        books: "Kitoblar",
        developers: "Dasturchilar",
        darkMode: "Tungi rejim",
        lightMode: "Yorug' rejim",
        script: "Alifbo",
        latin: "Lotin",
        cyrillic: "Kirill"
    }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = '@books:language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<keyof Translations>("ru")

    // Load saved language preference
    useEffect(() => {
        const loadSavedLanguage = async () => {
            try {
                const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
                if (savedLanguage === 'ru' || savedLanguage === 'uz') {
                    setLanguage(savedLanguage);
                }
            } catch (error) {
                console.error('Error loading language:', error);
            }
        };
        loadSavedLanguage();
    }, []);

    const changeLanguage = useCallback((lang: keyof Translations) => {
        setLanguage(lang);
        AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
            .catch(error => console.error('Error saving language:', error));
    }, []);

    return (
        <LanguageContext.Provider
            value={{
                language,
                changeLanguage,
                translations: translations[language],
            }}
        >
            {children}
        </LanguageContext.Provider>
    )
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
