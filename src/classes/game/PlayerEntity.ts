import {GameEntity} from "@/classes/game/GameEntity";
import {PlayerInfo} from "@/interfaces/bace";
import * as THREE from 'three'
import {RoleAnimations} from "@/enums/game";

export class PlayerEntity extends GameEntity {
    public playerInfo: PlayerInfo;

    constructor(size: number, baseUrl: string, fileNameWithoutType: string, playerInfo: PlayerInfo) {
        super(size, baseUrl, fileNameWithoutType);
        this.playerInfo = playerInfo;
    }

    public async doAnimation(name: string, loop: boolean = false) {
        //To do
        await super.doAnimation(name, loop);
    }

    public async load() {
        const s = await super.load();
        if (this.skeletonMesh) this.skeletonMesh.userData = {id: this.playerInfo.id}
        this.doAnimation('idle', true);
        return s;
    }

    public updatePlayerInfo(playerInfo: PlayerInfo) {
        this.playerInfo = playerInfo;
        super.currentPositionIndex = playerInfo.positionIndex;
    }
}