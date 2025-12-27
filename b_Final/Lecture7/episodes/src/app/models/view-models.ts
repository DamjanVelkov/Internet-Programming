export type ListEpisode = {
    rank: number;
    title: string;
    era: "Recent" | "Modern" | "Classic";
    year: number;
};

export const toListEpisode = (ep: Episode): ListEpisode => {
    return {
        rank: ep.rank,
        title: ep.title,
        era: ep.era,
        year: new Date(ep.broadcast_date).getFullYear(),
    };
}

export type DetailEpisode = {
    rank: number;
    title: string;
    series: number | "Special";
    era: "Recent" | "Modern" | "Classic";
    year: number;
    doctor: string
    companion: string;
    plot: string;
    cast: string[];
};

export const castToString = (cast: CastMember): string => `${cast.actor} as ${cast.character}`;

export const toDetailEpisode = (ep: Episode | null): DetailEpisode | null => {
    if (!ep) return null;
    return {
        rank: ep.rank,
        title: ep.title,
        series: ep.series,
        era: ep.era,
        year: new Date(ep.broadcast_date).getFullYear(),
        doctor: `${ep.doctor.actor} (${ep.doctor.incarnation})`,
        companion: castToString(ep.companion),
        plot: ep.plot,
        cast: ep.cast.map(castToString),
    };
}