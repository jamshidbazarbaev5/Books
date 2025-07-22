"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import AsyncStorage from '@react-native-async-storage/async-storage';

type TranslationKeys = {
    // General
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
    cancel: string;
    retry: string;
    loading: string;
    error: string;

    // Writers
    writers: string;
    writersAvailable: string;
    browseWriters: string;
    searchWriters: string;
    noWritersFound: string;
    searchAuthors: string;
    tryDifferentSearch: string;
    
    // Books & Reading
    books: string;
    searchBooks: string;
    noBooks: string;
    bookProgress: string;
    completed: string;
    page: string;
    pageOf: string;
    chapters: string;
    readingSettings: string;
    viewAllBookmarks: string;
    addBookmark: string;
    removeBookmark: string;
    shareBook: string;
    loadingBook: string;
    switchScript: string;
    
    // Poems
    poems: string;
    noPoems: string;
    keyPoints: string;
    
    // Content Types
    biography: string;
    developers: string;
    nationalWritings: string;
    
    // Theme
    darkMode: string;
    lightMode: string;
    
    // Script
    script: string;
    latin: string;
    cyrillic: string;
    
    // Introduction Screen
    welcome: string;
    welcomeSubtitle: string;
    writersCollection: string;
    writersDescription: string;
    digitalLibrary: string;
    digitalLibraryDesc: string;
    nationalWritingsTitle: string;
    nationalWritingsDesc: string;
    favoritesTitle: string;
    favoritesDesc: string;
    startExploring: string;
}

type Translations = {
    ru: TranslationKeys;
    uz: TranslationKeys;
}

interface LanguageContextType {
    language: keyof Translations;
    changeLanguage: (lang: keyof Translations) => void;
    translations: any;
}

const translations = {
    ru: {
        // General
        
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
        cancel: "Отмена",
        retry: "Повторить",
        loading: "Загрузка...",
        error: "Ошибка",
        availableAuthors:"Доступные авторы",
        authors: "Авторы",  
        page: "Страница",
        of: "из",
        // Writers
        writers: "Писатели",
        writersAvailable: "доступных авторов",
        browseWriters: "Просмотр писателей",
        searchWriters: "Поиск писателей...",
        noWritersFound: "Писатели не найдены",
        searchAuthors: "Поиск авторов...",
        tryDifferentSearch: "Попробуйте другой поисковый запрос или обновите страницу",
        nationalWritings: "Национальная литература",
        searchNationalWritings: "Поиск национальной литературы...",
        // Books & Reading
        books: "Фольклор",
        searchBooks: "Поиск книг...",
        noBooks: "Книги не найдены",
        bookProgress: "Прогресс чтения",
        completed: "завершено",
        // page: "Страница",
        pageOf: "из",
        chapters: "Главы",
        readingSettings: "Настройки чтения",
        viewAllBookmarks: "Все закладки",
        addBookmark: "Добавить закладку",
        removeBookmark: "Удалить закладку",
        shareBook: "Поделиться книгой",
        loadingBook: "Загрузка книги...",
        switchScript: "Переключить на",

        // Poems
        poems: "Стихи",
        noPoems: "Стихи не найдены",
        keyPoints: "Ключевые моменты",

        // Content Types
        biography: "Биография",
        developers: "Разработчики",
        // nationalWritings: "Национальная литература",
        riddles: "Загадки",
        // Theme
        darkMode: "Тёмный режим",
        lightMode: "Светлый режим",
        // noWritersFound: "Авторы не найдены",
        // Script
        script: "Алфавит",
        latin: "Латиница",
        cyrillic: "Кириллица",

        // Introduction Screen
        welcome: "Добро пожаловать в Books",
        welcomeSubtitle: "Ваш личный литературный помощник",
        writersCollection: "Коллекция писателей",
        writersDescription: "Исследуйте нашу обширную коллекцию талантливых писателей и их произведений",
        digitalLibrary: "Цифровая библиотека",
        digitalLibraryDesc: "Доступ к широкому выбору книг на кончиках ваших пальцев",
        nationalWritingsTitle: "Национальная литература",
        nationalWritingsDesc: "Откройте для себя литературные произведения разных культур",
        favoritesTitle: "Избранное",
        favoritesDesc: "Сохраняйте и организуйте ваш любимый контент",
        startExploring: "Начать исследование"
    },
    uz: {
        // General
        riddles: "Topishmoqlar",
        searchNationalWritings: "Milliy adabiyotlarni qidirish...",
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
        cancel: "Bekor qilish",
        retry: "Qayta urinish",
        loading: "Yuklanmoqda...",
        error: "Xato",
        poems: "She'rlar",
        page: "Sahifa",
        of: "dan",
        availableAuthors:"Mavjud yozuvchilar",
        authors: "Yozuvchilar",
        // Writers
        writers: "Yozuvchilar",
        writersAvailable: "ta yozuvchi mavjud",
        browseWriters: "Yozuvchilarni ko'rish",
        searchWriters: "Yozuvchilarni qidirish...",
        noWritersFound: "Yozuvchilar topilmadi",
        searchAuthors: "Mualliflarni qidirish...",
        tryDifferentSearch: "Boshqa so'z bilan qidirib ko'ring yoki sahifani yangilang",
        //search
        // searchAuthors: "Mualliflarni qidirish...",

        // Books & Reading
        books: "Kitoblar",
        searchBooks: "Kitoblarni qidirish...",
        noBooks: "Kitoblar topilmadi",
        bookProgress: "O'qish jarayoni",
        completed: "tugallandi",
        // page: "Sahifa",
        pageOf: "dan",
        chapters: "Boblar",
        readingSettings: "O'qish sozlamalari",
        viewAllBookmarks: "Barcha xatcho'plar",
        addBookmark: "Xatcho'p qo'shish",
        removeBookmark: "Xatcho'pni o'chirish",
        shareBook: "Kitobni ulashish",
        loadingBook: "Kitob yuklanmoqda...",
        switchScript: "Yozuvni o'zgartirish",

        // Poems
        // poems: "She'rlar",
        noPoems: "She'rlar topilmadi",
        keyPoints: "Asosiy nuqtalar",

        // Content Types
        biography: "Biografiya",
        developers: "Dasturchilar",
        nationalWritings: "Milliy adabiyot",

        // Theme
        darkMode: "Tungi rejim",
        lightMode: "Yorug' rejim",

        // Script
        script: "Alifbo",
        latin: "Lotin",
        cyrillic: "Kirill",

        // Introduction Screen
        welcome: "Books ilovasiga xush kelibsiz",
        welcomeSubtitle: "Sizning shaxsiy adabiy hamrohingiz",
        writersCollection: "Yozuvchilar to'plami",
        writersDescription: "Bizning katta iste'dodli yozuvchilar va ularning asarlari to'plamini o'rganing",
        digitalLibrary: "Raqamli kutubxona",
        digitalLibraryDesc: "Keng ko'lamli kitoblar to'plamiga kirish imkoniyati",
        nationalWritingsTitle: "Milliy adabiyot",
        nationalWritingsDesc: "Turli madaniyatlarning adabiy asarlarini kashf eting",
        favoritesTitle: "Sevimlilar",
        favoritesDesc: "Sevimli kontentingizni saqlang va tartibga soling",
        startExploring: "Boshlash"
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
