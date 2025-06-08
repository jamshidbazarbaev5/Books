import { BaseApi } from './api';

export interface Book {
  id: number;
  title_cyr: string;
  title_lat: string;
  description_cyr: string;
  description_lat: string;
  cover_image: string;
  epub_file?: string;
  epub_file_cyr: string | null;
  epub_file_lat: string | null;
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

export interface BooksResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Book[];
}

export class BooksApi extends BaseApi {
  private endpoint = '/books';

  async getBooks(): Promise<BooksResponse> {
    const response = await this.api.get<BooksResponse>(this.endpoint);
    return response.data;
  }

  async getBook(id: number): Promise<Book> {
    const response = await this.api.get<Book>(`${this.endpoint}/${id}`);
    return response.data;
  }
}

export const booksApi = new BooksApi();
