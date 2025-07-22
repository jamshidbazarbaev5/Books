export interface AudioPaths {
    ios: string;
    android: string;
}

export interface Poem {
    id: number;
    title: string;
    year: string;
    content: string;
    audio?: string | AudioPaths;
}

export interface Book {
    id: number;
    title?: string;
    title_cyr?: string;
    title_lat?: string;
    description?: string;
    description_cyr?: string;
    description_lat?: string;
    cover_image: string;
    epub_file?: string;
    epub_file_cyr?: string | null;
    epub_file_lat?: string | null;
    publication_year: number;
    publisher: string;
    is_active: boolean;
    order: number;
    authors: any[];
    categories: {
        id: number;
        name_cyr: string;
        name_lat: string;
    }[];
}

export interface Riddle {
    id: number;
    title: string;
    content: string;
    answers: string[];
}

export interface Writer {
    id: number;
    name_cyr: string;
    name_lat: string;
    photo: string;
    biography_cyr: string;
    biography_lat: string;
    date_of_birth: string;
    date_of_death: string;
    created_at: string;
    updated_at: string;
    poems?: Poem[];
    books?: Book[];
    gallery?: string[];
    riddles?: Riddle[];
}

export type WritersStackParamList = {
    WritersList: undefined;
    WriterDetail: { writer: Writer };
    Poem: { poem: Poem; writer: Writer };
    Book: {
        id: number;
        title: string;
        epubUrl?: string;
        currentScriptFile?: string;
        otherScriptFile?: string;
        audio?: string | AudioPaths;
    };
    AdvancedEpubReader: {
        title: string;
        epubUrl: string;
        initialPage?: number;
    };
    // existing screens not typed earlier
    BookList?: any;
    Riddle?: any;
    NationalWritings?: any;
};

export type RootStackParamList = {
    Writers: { screen: keyof WritersStackParamList; params?: any };
    Favorites: undefined;
    Settings: undefined;
    Bookmarks: undefined;
    Developers: undefined;
};
