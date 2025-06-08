import { BaseApi } from './api';

export interface Developer {
  id: number;
  name: string;
  photo: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface DevelopersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Developer[];
}

export class DevelopersApi extends BaseApi {
  private endpoint = '/developers/';

  async getDevelopers(): Promise<DevelopersResponse> {
    const response = await this.api.get<DevelopersResponse>(this.endpoint);
    return response.data;
  }

  async getDeveloper(id: number): Promise<Developer> {
    const response = await this.api.get<Developer>(`${this.endpoint}${id}/`);
    return response.data;
  }

  async createDeveloper(data: Omit<Developer, 'id' | 'created_at' | 'updated_at'>): Promise<Developer> {
    const response = await this.api.post<Developer>(this.endpoint, data);
    return response.data;
  }

  async updateDeveloper(id: number, data: Partial<Developer>): Promise<Developer> {
    const response = await this.api.patch<Developer>(`${this.endpoint}${id}/`, data);
    return response.data;
  }

  async deleteDeveloper(id: number): Promise<void> {
    await this.api.delete(`${this.endpoint}${id}/`);
  }
}

export const developersApi = new DevelopersApi();
