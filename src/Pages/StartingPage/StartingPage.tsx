import React from 'react';
import logo from '../../assets/Images/logo.png';
import styles from "./StartingPage.module.css";
import type { Signal } from '@preact/signals-react';

interface StartingPageProps {
    currentPage: Signal<string>;
}

export function StartingPage({ currentPage }: StartingPageProps) {

    return (
        <div className={styles.startingPageContainer}>
            <div>
                <img src={logo} className={styles.logo} alt="logo" />
            </div>
            <div className={styles.welcomeContainer}>
                <h3>Welcome to Footy Manager: World Stage!</h3>
                <h3>Click the button below to begin your football journey.</h3>
                <button onClick={() => currentPage.value = "CreateManager"}>Start</button>
            </div>
        </div>
    );
}

export default StartingPage;