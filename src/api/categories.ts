import { BaseApi } from './api';

export interface Categories {
   name_cyr:string;
   name_lat:string;
   description_cyr:string;
   description_lat:string;
   parent:number;
}

export interface CategoriesResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Categories[];
}


export class CategoriesApi extends BaseApi {
    private endpoint: string = '/categories';
    async getCategories():Promise<CategoriesResponse>{
        const response  = await this.api.get<CategoriesResponse>(this.endpoint);
    }
}