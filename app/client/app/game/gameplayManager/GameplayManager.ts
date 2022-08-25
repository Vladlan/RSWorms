import { IStartGameOptions } from '../../../../ts/interfaces';
import { TEndTurnCallback } from '../../../../ts/types';
import GameInterface from '../gameInterface/GameInterface';
import IOManager from '../IOManager/IOManager';
import EntityManager from '../world/entity/EntityManager';
import World from '../world/World';
import Team from './team/Team';

export default class gameplayManager {
    private entityManager: EntityManager;
    private ioManager: IOManager;
    private gameInterface: GameInterface;
    private world: World;
    private teams: Team[] = [];
    private currentTurn = -1;
    private turnTimestamp = 0;
    private turnTime = 30;
    private endTurnTime = 5;
    private isEnding = 0;
    constructor(world: World, ioManager: IOManager, gameInterface: GameInterface) {
        this.world = world;
        this.entityManager = world.entityManager;
        this.ioManager = ioManager;
        this.gameInterface = gameInterface;
    }

    private createTeams(options: IStartGameOptions) {
        if (!options.multiplayer) {
            const teamsCount = options.teamNames.length;
            for (let i = 0; i < teamsCount; i++) {
                const team = new Team(i);
                for (let j = 0; j < options.wormsCount; j++) {
                    const worm = this.entityManager.generateWorm(i, j);
                    if (!worm) {
                        throw new Error(`[GameplayManager] can't create worm`);
                    }
                    team.pushWorm(worm);
                }
                this.teams.push(team);
            }
        }
    }

    init(options: IStartGameOptions) {
        this.createTeams(options);
        this.nextTurn();
    }

    nextTurn() {
        this.isEnding = 0;
        this.turnTimestamp = Date.now();
        this.currentTurn++;
        const wind = this.world.changeWind();
        this.gameInterface.windElement.update(wind);
        const teamIndex = this.currentTurn % this.teams.length;
        const currentTeam = this.teams[teamIndex];
        const currentWorm = currentTeam.getNextWorm();

        const previousWorm = this.ioManager.wormManager.getWorm();
        if (previousWorm) {
            previousWorm.endTurn();
        }
        currentWorm.startTurn(this.endTurn);
        this.gameInterface.timerElement.show(true);
        this.ioManager.wormManager.setWorm(currentWorm);
    }

    endTurn: TEndTurnCallback = (delaySec: number) => {
        this.isEnding = Date.now() + delaySec * 1000;
    };

    turnLoop() {
        if (this.isEnding) {
            this.gameInterface.timerElement.update(this.isEnding - Date.now() + 1000);
            if (Date.now() > this.isEnding) {
                this.nextTurn();
            }
        } else {
            this.gameInterface.timerElement.update(this.turnTime * 1000 - (Date.now() - this.turnTimestamp) + 1000);

            if (Date.now() - this.turnTimestamp > this.turnTime * 1000) {
                this.nextTurn();
            }
        }
    }
}