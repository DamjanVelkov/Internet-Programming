export interface CastMember {
  actor: string;
  character: string;
}

export interface Movie {
  id: number;
  title: string;
  year: number;
  director: string;
  genre: string[];
  plot?: string;
  cast?: CastMember[];
  oscars?: { [key: string]: string };
  rating?: number;
}

export interface Actor {
  id: number;
  name: string;
  birthdate?: string;
  height?: number;
  nationality?: string;
  notable_works?: string[];
}

export interface MovieData {
  movies: Movie[];
  genres: string[];
  actors: Actor[];
}
