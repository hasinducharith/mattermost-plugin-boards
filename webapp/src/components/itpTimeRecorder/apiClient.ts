// Copyright (c) 2020-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

class ApiClient {
    private baseUrl: string
  
    constructor(baseUrl: string) {
        this.baseUrl = baseUrl
    }
  
    private async request<T>(path: string, config?: RequestInit): Promise<T> {
        try {
            const response = await fetch(this.baseUrl + path, config)
            if (!response.ok) {
                throw new Error(`Request failed with status: ${response.status}`)
            }
            const data: T = await response.json()
            return data
        } catch (error) {
            throw error
        }
    }
  
    public async get<T>(path: string, config?: RequestInit): Promise<T> {
        return this.request<T>(path, {
            method: 'GET',
            ...config,
        })
    }
  
    public async post<T>(path: string, data?: any, config?: RequestInit): Promise<T> {
        return this.request<T>(path, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
            ...config,
        })
    }
  
    // Define more methods for other HTTP methods (PUT, DELETE) as needed.
  
    // You can also define specific API endpoints and configurations here.
}
  
// Export an instance of the API client with your base URL.
const api = new ApiClient('https://mm2kimai-staging.itplace.io')
  
export default api
