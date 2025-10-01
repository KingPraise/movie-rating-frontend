export interface Movie {
    id: number;
    title: string;
    genre: string;
    release_year: number;
    description?: string;
    created_by: number;
    ratings_avg: string;   
    ratings_count: number;
    created_at: string;
}
