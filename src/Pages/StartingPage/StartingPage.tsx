import { useState, useEffect } from "react";
import { InitPlayers } from "../../Initalizer/InitPlayers";
import type { NationalTeam, Player, Team } from "../../Models/WorldStage";

interface StartingPageProps {
    setCurrentPage: (page: string) => void;
}

export function StartingPage({ setCurrentPage }: StartingPageProps) {

    return (
        <div>
            <h1>Footy Manager: World Stage</h1>
            <h3>Welcome to Footy Manager: World Stage!</h3>
            <h3>Click the button below to begin your journey.</h3>
            <button onClick={() => setCurrentPage("CreateManager")}>Start</button>
        </div>
    );
}

export default StartingPage;