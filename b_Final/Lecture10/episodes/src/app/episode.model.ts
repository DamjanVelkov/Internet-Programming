export interface Episode {
    id: number;
    title: string;
    series: number | string;
    era: string;
    broadcast_date: string;
    director: string;
    writer: string;
    plot: string;
    doctor: { actor: string; incarnation: string };
    companion?: PersonRole;
    cast: PersonRole[];
}

export interface PersonRole {
    actor: string;
    character: string;
}