import { type currentYear } from './../Models/WorldStage';
import type { League, Team, Match } from "../Models/WorldStage";
import type { Signal } from '@preact/signals-react';

export function createSchedule(league: League, currentYear: Signal<currentYear>): Match[] {
    const schedule: Match[] = [];
    const teams = league.teams;
    const numTeams = teams.length;

    // Generate round-robin fixtures (each team plays every other team twice: home & away)
    const rounds: { home: number; away: number }[][] = [];

    // Use a standard round-robin algorithm
    // If odd number of teams, add a "bye" slot
    const teamIndices = teams.map((_, i) => i);
    const isOdd = numTeams % 2 !== 0;
    if (isOdd) teamIndices.push(-1); // -1 represents a bye

    const n = teamIndices.length;
    const half = n / 2;

    // First half of season (home fixtures)
    for (let round = 0; round < n - 1; round++) {
        const roundMatches: { home: number; away: number }[] = [];
        for (let i = 0; i < half; i++) {
            const home = teamIndices[i];
            const away = teamIndices[n - 1 - i];
            if (home === -1 || away === -1) continue; // skip bye
            roundMatches.push({ home, away });
        }
        rounds.push(roundMatches);

        // Rotate all indices except the first one
        const last = teamIndices.pop()!;
        teamIndices.splice(1, 0, last);
    }

    // Second half of season (reverse home/away)
    const firstHalf = [...rounds];
    const secondHalf = firstHalf.map((round) =>
        round.map((m) => ({ home: m.away, away: m.home }))
    );

    // Shuffle each half independently so matchups are randomized
    for (let i = firstHalf.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [firstHalf[i], firstHalf[j]] = [firstHalf[j], firstHalf[i]];
    }
    for (let i = secondHalf.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [secondHalf[i], secondHalf[j]] = [secondHalf[j], secondHalf[i]];
    }

    rounds.length = 0;
    for (let i = 0; i < firstHalf.length; i++) {
        rounds.push(firstHalf[i]);
    }
    for (let i = 0; i < secondHalf.length; i++) {
        rounds.push(secondHalf[i]);
    }

    // Generate Saturday dates starting from Aug 2, 2025 (one game per week)
    const weekendDates: Date[] = [];
    const seasonStart = new Date(2025, 7, 2); // Aug 2, 2025 (Saturday)
    let current = new Date(seasonStart);

    while (weekendDates.length < rounds.length) {
        weekendDates.push(new Date(current));
        current.setDate(current.getDate() + 7); // skip to next Saturday
    }

    const formatDate = (d: Date): string => {
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const yyyy = String(d.getFullYear());
        return `${mm}/${dd}/${yyyy}`;
    };

    // Convert to Match objects, one weekend date per round
    for (let r = 0; r < rounds.length; r++) {
        const round = rounds[r];
        const matchDate = formatDate(weekendDates[r]);
        for (const fixture of round) {
            const match: Match = {
                homeTeam: teams[fixture.home].Team,
                awayTeam: teams[fixture.away].Team,
                date: matchDate,
                homeScore: 0,
                awayScore: 0,
                homeScorers: [],
                awayScorers: [],
                homeAssists: [],
                awayAssists: [],
                isLeagueMatch: true,
                isTournamentMatch: false,
                isInternationalMatch: false,
            };
            schedule.push(match);
        }
    }

    return schedule;
}