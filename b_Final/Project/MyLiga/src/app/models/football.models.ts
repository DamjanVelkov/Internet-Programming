// API Response wrapper
export interface ApiResponse<T> {
  get: string;
  parameters: any;
  errors: any[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: T;
}

// League/Competition
export interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string;
  season: number;
  round?: string;
}

// Team/Club
export interface Team {
  id: number;
  name: string;
  logo: string;
  winner?: boolean | null;
}

export interface TeamInfo extends Team {
  code?: string;
  country?: string;
  founded?: number;
  national?: boolean;
}

export interface TeamVenue {
  id: number;
  name: string;
  address: string;
  city: string;
  capacity: number;
  surface: string;
  image: string;
}

export interface TeamDetails {
  team: TeamInfo;
  venue: TeamVenue;
}

// Player
export interface Player {
  id: number;
  name: string;
  firstname?: string;
  lastname?: string;
  age?: number;
  birth?: {
    date: string;
    place: string;
    country: string;
  };
  nationality?: string;
  height?: string;
  weight?: string;
  injured?: boolean;
  photo: string;
  number?: number;
  pos?: string;
  grid?: string;
}

export interface PlayerStatistics {
  player: Player;
  statistics: PlayerSeasonStats[];
}

export interface PlayerSeasonStats {
  team: Team;
  league: League;
  games: {
    appearences: number;
    lineups: number;
    minutes: number;
    number: number | null;
    position: string;
    rating: string | null;
    captain: boolean;
  };
  substitutes: {
    in: number;
    out: number;
    bench: number;
  };
  shots: {
    total: number | null;
    on: number | null;
  };
  goals: {
    total: number;
    conceded: number | null;
    assists: number | null;
    saves: number | null;
  };
  passes: {
    total: number | null;
    key: number | null;
    accuracy: number | null;
  };
  tackles: {
    total: number | null;
    blocks: number | null;
    interceptions: number | null;
  };
  duels: {
    total: number | null;
    won: number | null;
  };
  dribbles: {
    attempts: number | null;
    success: number | null;
    past: number | null;
  };
  fouls: {
    drawn: number | null;
    committed: number | null;
  };
  cards: {
    yellow: number;
    yellowred: number;
    red: number;
  };
  penalty: {
    won: number | null;
    commited: number | null;
    scored: number;
    missed: number;
    saved: number | null;
  };
}

// Match/Fixture
export interface Fixture {
  id: number;
  referee: string | null;
  timezone: string;
  date: string;
  timestamp: number;
  periods: {
    first: number | null;
    second: number | null;
  };
  venue: {
    id: number;
    name: string;
    city: string;
  };
  status: {
    long: string;
    short: string;
    elapsed: number | null;
  };
}

export interface Goals {
  home: number | null;
  away: number | null;
}

export interface Score {
  halftime: Goals;
  fulltime: Goals;
  extratime: Goals;
  penalty: Goals;
}

export interface Match {
  fixture: Fixture;
  league: League;
  teams: {
    home: Team;
    away: Team;
  };
  goals: Goals;
  score: Score;
}

// Standings
export interface Standing {
  rank: number;
  team: Team;
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  status: string;
  description: string | null;
  all: StandingStats;
  home: StandingStats;
  away: StandingStats;
  update: string;
}

export interface StandingStats {
  played: number;
  win: number;
  draw: number;
  lose: number;
  goals: {
    for: number;
    against: number;
  };
}

export interface StandingsResponse {
  league: League & {
    standings: Standing[][];
  };
}

// Match Events
export interface MatchEvent {
  time: {
    elapsed: number;
    extra: number | null;
  };
  team: Team;
  player: {
    id: number;
    name: string;
  };
  assist: {
    id: number | null;
    name: string | null;
  };
  type: 'Goal' | 'Card' | 'subst' | 'Var';
  detail: string;
  comments: string | null;
}

// Lineups
export interface Lineup {
  team: Team;
  coach: {
    id: number;
    name: string;
    photo: string;
  };
  formation: string;
  startXI: { player: Player }[];
  substitutes: { player: Player }[];
}

// Match Statistics
export interface MatchStatistic {
  team: Team;
  statistics: {
    type: string;
    value: number | string | null;
  }[];
}

// Top Scorers
export interface TopScorer {
  player: Player;
  statistics: PlayerSeasonStats[];
}

// Rounds
export type Round = string;

// Season
export interface Season {
  year: number;
  start: string;
  end: string;
  current: boolean;
  coverage: {
    fixtures: {
      events: boolean;
      lineups: boolean;
      statistics_fixtures: boolean;
      statistics_players: boolean;
    };
    standings: boolean;
    players: boolean;
    top_scorers: boolean;
    top_assists: boolean;
    top_cards: boolean;
    injuries: boolean;
    predictions: boolean;
    odds: boolean;
  };
}

// Head to Head
export interface H2H {
  fixture: Fixture;
  league: League;
  teams: {
    home: Team;
    away: Team;
  };
  goals: Goals;
  score: Score;
}

// Cached data interface
export interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}
