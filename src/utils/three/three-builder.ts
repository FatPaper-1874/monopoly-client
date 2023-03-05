import {
	AmbientLight,
	AxesHelper,
	DirectionalLight,
	HemisphereLight,
	PerspectiveCamera,
	Scene,
	Vector3,
	WebGLRenderer,
	Group,
	Color,
	TextureLoader,
	Object3D,
	MathUtils,
	Camera,
	ACESFilmicToneMapping,
} from "three";

import { gsap } from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MapItem, PlayerInfo } from "../../interfaces/bace";
import { loadImg2mesh } from "./loader";
import { loadMapModules } from "./map-loader";
import { useGameInfo, useMap, useUserInfo } from "../../store/index";
import { watch, computed } from "vue";

export class ThreeBuilder {
	private canvas: HTMLCanvasElement;
	private renderer: WebGLRenderer;
	private scene: Scene;
	private camera: PerspectiveCamera;
	private mapContainer: Group;
	private mapModules: { [key: string]: Group };
	private mapItems: { [key: string]: Group };
	private playerModules: { [key: string]: Group };
	private requestAnimationFrameId: number;

	private isLockingRole: boolean;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.renderer = new WebGLRenderer({ canvas, antialias: true });
		this.scene = new Scene();
		this.camera = new PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 1000);
		this.mapContainer = new Group();
		this.mapModules = {};
		this.mapItems = {};
		this.playerModules = {};
		this.requestAnimationFrameId = -1;
		this.isLockingRole = true;
	}

	public async init() {
		const bgTextureLoader = new TextureLoader();
		const bgTexture = bgTextureLoader.load("bg.png");

		this.scene.background = bgTexture;
		this.scene.add(this.mapContainer);

		//创建坐标系参考
		const axesHelper = new AxesHelper(5);
		this.scene.add(axesHelper);

		//创建灯光
		const light = new AmbientLight(0xffffff, 0.7); // soft white light
		this.scene.add(light);

		const hemiLight = new HemisphereLight(0xffffff, 0xffffff);
		hemiLight.position.set(0, 10, 0);
		this.scene.add(hemiLight);

		const dirLight = new DirectionalLight(0xffffff, 0.2);
		dirLight.position.set(5, 10, -5);
		this.scene.add(dirLight);

		// 创建轨道控制器
		const controls = new OrbitControls(this.camera, this.canvas);
		controls.enableDamping = true;
		controls.update();

		//加载地图和模型
		const mapDataStore = useMap();
		await this.loadMap(mapDataStore.mapData);
		const gameInfoStore = useGameInfo();
		await this.loadPlayers(gameInfoStore.playerList);

		this.addPositionIndexWatchers();

		const userInfoStore = useUserInfo();

		const loop = () => {
			this.requestAnimationFrameId = requestAnimationFrame(loop);

			if (this.isLockingRole) this.updateCamera(controls, this.playerModules[userInfoStore.userId], 5, 30);
			controls.update();

			for (const key in this.playerModules) {
				if (Object.prototype.hasOwnProperty.call(this.playerModules, key)) {
					const playerModule = this.playerModules[key];
					playerModule.lookAt(this.camera.position);
				}
			}

			this.renderer.render(this.scene, this.camera);
		};

		loop();
	}

	public distory() {
		cancelAnimationFrame(this.requestAnimationFrameId);
	}

	private updateCamera(controls: OrbitControls, targetObject: Object3D, followDistance: number, followAngleY: number) {
		var targetPos = targetObject.position;
		var followPos = new Vector3();
		followPos.x = targetPos.x - Math.sin(targetObject.rotation.y) * followDistance;
		followPos.y = targetPos.y + followDistance * Math.tan(MathUtils.degToRad(followAngleY));
		followPos.z = targetPos.z - Math.cos(targetObject.rotation.y) * followDistance;
		controls.target.copy(targetPos);
	}

	private addPositionIndexWatchers() {
		const gameInfoStroe = useGameInfo();
		const playerList = computed(() => gameInfoStroe.playerList);
		const mapStore = useMap();
		for (let index = 0; index < playerList.value.length; index++) {
			watch(
				() => playerList.value[index].positionIndex,
				(newIndex, oldIndex) => {
					this.updatePlayerPositionByStep(playerList.value[index], oldIndex, newIndex, mapStore.mapIndex.length);
				},
				{ deep: true }
			);
		}
	}

	private async updatePlayerPositionByStep(
		player: PlayerInfo,
		sourceIndex: number,
		targetIndex: number,
		total: number
	) {
		const timeLine = gsap.timeline({ repeat: 0 });
		const playerModule = this.playerModules[player.user.userId];
		const stepNum =
			targetIndex - sourceIndex > 0 ? targetIndex - sourceIndex : total - Math.abs(targetIndex - sourceIndex);
		console.log(stepNum);
		for (let i = 1; i <= stepNum; i++) {
			let { x, y, z } = this.getMapItemPosition((sourceIndex + i) % total);
			console.log(((sourceIndex + i) % total) + "---");
			timeLine.to(playerModule.position, { x, y: y + 1, z, duration: 1 });
		}
		await timeLine.play();
	}

	private updatePlayerPosition(player: PlayerInfo) {
		const { x, y, z } = this.getMapItemPosition(player.positionIndex);
		this.playerModules[player.user.userId].position.set(x, y + 1, z);
	}

	private getMapItemPosition(index: number) {
		const mapStore = useMap();
		const mapIndex = mapStore.mapIndex;
		const id = mapIndex[index];
		return this.mapItems[id].position;
	}

	private async loadPlayers(playerList: Array<PlayerInfo>) {
		for await (const player of playerList) {
			this.playerModules[player.user.userId] = await loadImg2mesh(`/roles/${player.user.role.filename}.png`, 0.05, 0.1);
			this.scene.add(this.playerModules[player.user.userId]);
			this.updatePlayerPosition(player);
		}
	}

	private async loadMap(mapData: Array<MapItem>) {
		this.mapModules = await loadMapModules(mapData);
		mapData.forEach((item) => {
			const tempModule = this.mapModules[item.type.name].clone();
			tempModule.scale.set(0.5, 0.5, 0.5);
			tempModule.position.set(item.x + item.type.size / 2, 0, item.y + item.type.size / 2);
			this.mapContainer.add(tempModule);
			this.mapItems[item.id] = tempModule;
		});
	}

	public async reloadMap(mapData: Array<MapItem>) {
		this.mapContainer.clear();
		await this.loadMap(mapData);
	}

	public toggleLockCamera() {
		this.isLockingRole = !this.isLockingRole;
		return this.isLockingRole;
	}
}
