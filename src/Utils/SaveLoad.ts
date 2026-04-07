import { gameContext } from '../Context/GameContext';
import {
    currentPage as mainCurrentPage,
    activeTab,
    scheduleCreated,
    isFirstSeason,
    playerAwards,
    retiredPlayers,
} from '../Pages/MainPage/MainPage';

const SAVE_KEY = 'footballManagerSave';

export function saveGame(): void {
    try {
        const state = {
            teamsMap: Array.from(gameContext.teamsMap.value.entries()),
            playersMap: Array.from(gameContext.playersMap.value.entries()),
            nationalTeams: gameContext.nationalTeams.value,
            userManager: gameContext.userManager.value,
            leagues: gameContext.leagues.value,
            tournaments: gameContext.tournaments.value,
            internationalTournaments: gameContext.internationalTournaments.value,
            currentYear: gameContext.currentYear.value,
            achievements: gameContext.achievements.value,
            managerHistory: gameContext.managerHistory.value,
            currentTournament: gameContext.currentTournament.value,
            currentInternationalTournament: gameContext.currentInternationalTournament.value,
            mainCurrentPage: mainCurrentPage.value,
            activeTab: activeTab.value,
            scheduleCreated: scheduleCreated.value,
            isFirstSeason: isFirstSeason.value,
            playerAwards: playerAwards.value,
            retiredPlayers: retiredPlayers.value,
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch {
        // localStorage may be full or unavailable — fail silently
    }
}

export function hasSave(): boolean {
    return !!localStorage.getItem(SAVE_KEY);
}

export function loadGame(): boolean {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    try {
        const state = JSON.parse(raw);
        gameContext.teamsMap.value = new Map(state.teamsMap);
        gameContext.playersMap.value = new Map(state.playersMap);
        gameContext.nationalTeams.value = state.nationalTeams;
        gameContext.userManager.value = state.userManager;
        gameContext.leagues.value = state.leagues;
        gameContext.tournaments.value = state.tournaments;
        gameContext.internationalTournaments.value = state.internationalTournaments;
        gameContext.currentYear.value = state.currentYear;
        gameContext.achievements.value = state.achievements;
        gameContext.managerHistory.value = state.managerHistory;
        gameContext.currentTournament.value = state.currentTournament;
        gameContext.currentInternationalTournament.value = state.currentInternationalTournament;
        mainCurrentPage.value = state.mainCurrentPage;
        activeTab.value = state.activeTab;
        scheduleCreated.value = state.scheduleCreated;
        isFirstSeason.value = state.isFirstSeason;
        playerAwards.value = state.playerAwards;
        retiredPlayers.value = state.retiredPlayers;
        gameContext.currentPage.value = "MainPage";
        return true;
    } catch {
        return false;
    }
}

export function deleteSave(): void {
    localStorage.removeItem(SAVE_KEY);
}
