export interface Player {
    name: string;
    position: string;
    overall: number;
    country: string;
    startingNational?: boolean;
    startingTeam?: boolean;
    team: string;
    age: number;
    potential: number;
    value: number;
    contract: Record<number, number>;
}

export interface Manager {
    name: string;
    country: string;
    team: string;
    age: number;
    type: string;
    trophies?: number;
}

export interface Team {
    name: string;
    league?: string;
    manager: Manager;
    color: string;
    players?: Player[];
    moneyToSpend: number;
}

export interface NationalTeam {
    team: Team;
    country: string;
}