type Episode = {
    rank: number;
    title: string;
    series: number | "Special";
    era: "Classic" | "Recent" | "Modern";
    broadcast_date: string;
    director: string;
    writer: string;
    plot: string;
    doctor: {
        actor: string;
        incarnation: string;
    };
    companion: CastMember;
    cast: CastMember[];
};

type CastMember = {
    actor: string;
    character: string;
};

