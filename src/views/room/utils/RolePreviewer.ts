import * as THREE from 'three'
import {ThreeSceneBase} from "@/views/room/utils/ThreeSceneBase";
import {RoleModel} from "@/views/room/utils/RoleModel";

export class RolePreviewer extends ThreeSceneBase {
    private role: RoleModel | undefined;

    constructor(canvas: HTMLCanvasElement, resize: boolean) {
        super(canvas, resize);
        const light = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(light);
        this.renderer.setClearAlpha(0);
        this.camera.position.set(0, 0.4, 1);
        this.camera.lookAt(new THREE.Vector3(0, 0.4, 0))
        this.renderLoop();
    }

    protected renderLoop() {
        this.role && this.role.update();
        super.renderLoop();
    }

    public async loadRole(baseUrl: string, fileName: string) {
        this.scene.clear();
        this.role = new RoleModel(1, baseUrl, fileName);
        const model = await this.role.load();
        console.log(model)
        this.scene.add(model);
        this.role.doAnimation('hi', false);
        return this.role;
    }
}