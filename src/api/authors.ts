import {BaseApi} from './api';

export interface Authors {
    id: number;
    name_cyr: string;
    name:string;
    name_lat: string;
    photo: string;
    biography_cyr: string;
    biography_lat: string;
    biography: string;
    
    date_of_birth: string;
    date_of_death: string;
    created_at: string;
    updated_at: string;
}

export interface AuthorsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Authors[];
}

export class AuthorsApi extends BaseApi {
    private endpoint = '/authors';

    async getAuthors(page?: number): Promise<AuthorsResponse> {
        const params = page ? { page } : {};
        const response = await this.api.get<AuthorsResponse>(this.endpoint, { params });
        return response.data;
    }

    async getAuthor(id: number): Promise<Authors> {
        const response = await this.api.get<Authors>(`${this.endpoint}/${id}`);
        return response.data;
    }

    async getFavoriteAuthors() {
        return this.api.get<Authors[]>('/authors/favorites');
    }

    async toggleFavoriteAuthor(authorId: number) {
        return this.api.post(`/authors/${authorId}/favorite`);
    }
}