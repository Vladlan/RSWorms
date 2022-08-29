/* eslint-disable @typescript-eslint/no-explicit-any */
import { EMapPacksDecorItems, EMapPacksNames, EWorldSizes } from '../../../ts/enums';
import { TStartGameCallback } from '../../../ts/types';
import PageBuilder from '../../utils/pageBuilder';
import './style.scss';
import { Context } from 'vm';

export default class Lobby {
    clouds: any[] = [];
    cloud: any;
    mainScreen: any;
    settings: any;
    customGameScreen: any;
    lobbyWrapper: any;
    canvasHeight = 0;
    canvasWidth = 0;
    windowHeight = 0;
    windowWidth = 0;
    teamName = 'Team';
    memberNames = ['Worm1', 'Worm2', 'Worm3', 'Worm4', 'Worm5'];
    randomTeamNames = ['Developers', 'ProjectCrashers', 'Loosers'];
    randomMemberNames = ['Aleg3000', 'Wsko', 'Overlord', 'Guy', 'Big One', 'OG Worm', 'Fat Ass'];
    ctx: Context | null = null;
    private startGameCallback: TStartGameCallback;
    constructor(startGameCallback: TStartGameCallback) {
        this.startGameCallback = startGameCallback;
        this.loop();
    }

    private createSettings() {
        this.settings = PageBuilder.createElement('div', { classes: 'settings' });
        this.settings.style.width = this.windowWidth + 'px';
        this.settings.style.height = this.windowHeight + 'px';
        this.settings.style.top = this.windowHeight * 2 + 'px';
        this.settings.style.left = this.windowWidth * 2 + 'px';
        const returnBtn = PageBuilder.createElement('div', { classes: 'return-button' });
        returnBtn.style.backgroundImage = 'url(../../assets/lobby/return.png)';
        returnBtn.addEventListener('click', () => {
            this.mainScreen.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        });

        const createTeamContainer = PageBuilder.createElement('div', { classes: 'create-team-container' });
        const audioOptionsContainer = PageBuilder.createElement('div', { classes: 'audio-options-container' });

        // const teamNameContainer = PageBuilder.createElement('div', { classes: 'team-name-container' });
        // const teamNameTitle = PageBuilder.createElement('h3', { classes: 'team-name-title' });
        // teamNameTitle.innerHTML = 'Team Name';
        // const teamNameInput = PageBuilder.createElement('input', { classes: 'text-input', id: 'team-name' });
        // teamNameContainer.append(teamNameTitle, teamNameInput);
        // createTeamContainer.append(teamNameContainer);

        createTeamContainer.innerHTML = `
            <div class="team-name-container">
                <h3 class="team-name-title">Team Name</h3>
                <div class="team-name-input-container">
                    <input class="input-text team-name" type="text" value="Team">
                    <button class="random-btn" id="team-random-btn">Random</button>
                </div>
            </div>
            <div class="team-name-container">
                <h3 class="team-name-title">Team Members</h3>
                <div class="team-name-input-container">
                    <input class="input-text worm-name" id="team-name" type="text" value="Worm 1" data-id="worm1">
                    <button class="random-btn" id="member-random-btn" data-id="worm1">Random</button>
                </div>
                <div class="team-name-input-container">
                    <input class="input-text worm-name" type="text" value="Worm 2" data-id="worm2">
                    <button class="random-btn" id="member-random-btn" data-id="worm2">Random</button>
                </div>
                <div class="team-name-input-container">
                    <input class="input-text worm-name" type="text" value="Worm 3" data-id="worm3">
                    <button class="random-btn" id="member-random-btn" data-id="worm3">Random</button>
                </div>
                <div class="team-name-input-container">
                    <input class="input-text worm-name" type="text" value="Worm 4" data-id="worm4">
                    <button class="random-btn" id="member-random-btn" data-id="worm4">Random</button>
                </div>
                <div class="team-name-input-container">
                    <input class="input-text worm-name" type="text" value="Worm 5" data-id="worm5">
                    <button class="random-btn" id="member-random-btn" data-id="worm5">Random</button>
                </div>
            </div>
            <button class="create">Create Team</button>
        `;

        this.settings.append(returnBtn, createTeamContainer, audioOptionsContainer);
        this.lobbyWrapper.append(this.settings);
    }

    private afterRender = () => {
        const teamRandomBtn = document.querySelector('#team-random-btn');
        // const teamNameInput = document.querySelector('#team-name');
        teamRandomBtn?.addEventListener('click', (e) => {
            const input = (e.currentTarget as HTMLElement).previousElementSibling as HTMLInputElement;
            input.value = this.randomTeamNames[Math.floor(Math.random() * this.randomTeamNames.length)];
        });
        const membersRandomBtns = document.querySelectorAll('#member-random-btn');
        membersRandomBtns.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const input = (e.currentTarget as HTMLElement).previousElementSibling as HTMLInputElement;
                input.value = this.randomMemberNames[Math.floor(Math.random() * this.randomMemberNames.length)];
            });
        });
        document.querySelector('.create')?.addEventListener('click', () => {
            this.memberNames = [];
            (document.querySelectorAll('.worm-name') as NodeListOf<HTMLInputElement>).forEach((worm) => {
                this.memberNames.push(worm.value);
            });
            this.teamName = (document.querySelector('.team-name') as HTMLInputElement).value;
            console.log(this.teamName, this.memberNames);
        })
    }

    private createLobby() {
        this.lobbyWrapper = PageBuilder.createElement('div', { id: 'lobby-wrapper' });
        document.body.append(this.lobbyWrapper);
        this.windowHeight = document.documentElement.clientHeight;
        this.windowWidth = document.documentElement.clientWidth;
        this.canvasWidth = this.windowWidth * 3;
        this.canvasHeight = this.windowHeight * 3;
        this.lobbyWrapper.style.width = `${this.windowWidth * 3}px`;
        this.lobbyWrapper.style.height = `${this.windowHeight * 3}px`;
        this.lobbyWrapper.innerHTML += `<canvas id='canvas-lobby' width='${this.canvasWidth}px' height='${this.canvasHeight}px'></canvas>`;
        const canvas = document.getElementById('canvas-lobby') as HTMLCanvasElement;
        this.ctx = canvas.getContext('2d');

        window.addEventListener('resize', () => {
            this.resize();
        });
    }

    private createMainScreen() {
        this.mainScreen = PageBuilder.createElement('div', { classes: 'main-screen' });
        this.mainScreen.style.width = this.windowWidth + 'px';
        this.mainScreen.style.height = this.windowHeight + 'px';
        this.mainScreen.style.top = this.windowHeight + 'px';
        this.mainScreen.style.left = this.windowWidth + 'px';

        const btnContainer = PageBuilder.createElement('div', { classes: 'main-screen-button-container' });

        const quickGameBtn = PageBuilder.createElement('div', { classes: 'main-screen-button' });
        quickGameBtn.style.backgroundImage = 'url(./assets/lobby/main-screen/worms-single.jpeg)';
        quickGameBtn.addEventListener('click', this.startGame.bind(this));

        const customGameBtn = PageBuilder.createElement('div', { classes: 'main-screen-button' });
        customGameBtn.style.backgroundImage = 'url(./assets/lobby/main-screen/worms-custom.jpeg)';
        customGameBtn.addEventListener('click', () => {
            this.customGameScreen.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        });
        const networkGameBtn = PageBuilder.createElement('div', { classes: 'main-screen-button' });
        networkGameBtn.style.backgroundImage = 'url(./assets/lobby/main-screen/wormsnetwork.jpeg)';
        const settingBtn = PageBuilder.createElement('div', { classes: 'main-screen-button' });
        settingBtn.style.backgroundImage = 'url(./assets/lobby/main-screen/wormssettings.jpeg)';
        settingBtn.addEventListener('click', () => {
            this.settings.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        });

        const title = PageBuilder.createElement('div', { classes: 'main-screen-title' });

        btnContainer.append(quickGameBtn, customGameBtn, networkGameBtn, settingBtn, title);
        this.mainScreen.append(btnContainer);

        this.lobbyWrapper.append(this.mainScreen);
    }

    private createCustomGameScreen() {
        this.customGameScreen = PageBuilder.createElement('div', { classes: 'custom-game-screen' });
        this.customGameScreen.style.width = this.windowWidth + 'px';
        this.customGameScreen.style.height = this.windowHeight + 'px';
        this.customGameScreen.style.top = '0px';
        this.customGameScreen.style.left = this.windowWidth * 2 + 'px';
        const returnBtn = PageBuilder.createElement('div', { classes: 'return-button' });
        returnBtn.style.backgroundImage = 'url(../../assets/lobby/return.png)';
        returnBtn.addEventListener('click', () => {
            this.mainScreen.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        });
        this.customGameScreen.append(returnBtn);

        this.lobbyWrapper.append(this.customGameScreen);
    }

    private loop = () => {
        requestAnimationFrame(this.drawClouds.bind(this));
        setTimeout(this.loop, 40);
    };

    private startGame() {
        document.body.innerHTML = '';
        const seed = Math.random();
        // const seed = 0.7135371756374531;
        // const seed = 0.7972989657842342;
        // const seed = 0.711119400099296;
        console.log('Seed: ', seed);
        this.startGameCallback({
            mapTexturePackName: EMapPacksNames.candy,
            worldSize: EWorldSizes.medium,
            seed,
            decor: {
                count: EMapPacksDecorItems[EMapPacksNames.candy],
                max: 6,
                min: 2,
            },
            // wormsCount: 3,
            // multiplayer: false,
            // teamNames: ['team-a', 'team-b', 'team-c'],
            // playerNames: [],
        });
    }

    private createClouds() {
        if (this.clouds.length > 0) return;
        this.cloud = new Image();
        this.cloud.src = '../../assets/lobby/cloud.png';
        const cloudWidth = 300;
        const cloudHeight = 150;
        const quantity = Math.round(this.canvasHeight / cloudHeight);
        for (let i = 0; i < quantity; i++) {
            const y = cloudHeight * i;
            for (let i = 0; i <= 5; i++) {
                this.clouds.push({
                    x: Math.round(Math.random() * this.canvasWidth),
                    y: y,
                    width: cloudWidth,
                    height: cloudHeight,
                    deltaX: Math.round(Math.random()) ? 2 : -2,
                });
            }
        }
    }

    private drawClouds() {
        if (this.ctx) {
            this.ctx.fillStyle = '#7AD7FF';
            this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            this.clouds.forEach((el: any) => {
                if (this.ctx) {
                    el.x += el.deltaX;
                    if (el.x > this.canvasWidth || el.x < 0) el.deltaX = -el.deltaX;
                    this.ctx.drawImage(this.cloud, el.x, el.y, el.width, el.height);
                }
            });
        }
    }

    private resize() {
        document.body.innerHTML = '';
        this.start();
    }

    public start() {
        this.createLobby();
        this.createMainScreen();
        this.createCustomGameScreen();
        this.createSettings();
        this.mainScreen.scrollIntoView();
        this.createClouds();
        this.mainScreen.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
        this.afterRender();
    }
}
