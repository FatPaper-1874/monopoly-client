import {
	AmbientLight,
	HemisphereLight,
	PerspectiveCamera,
	Scene,
	Vector3,
	WebGLRenderer,
	Group,
	TextureLoader,
	Object3D,
	MathUtils,
	Raycaster,
	Vector2,
	Intersection,
	Mesh,
	PointLight,
} from "three";

import { gsap } from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ItemType, MapItem, PlayerInfo, PropertyInfo } from "../../interfaces/bace";
import { loadImg2mesh } from "./role-loader";
import { useGameInfo, useMapData, usePlayerWalk, useUserInfo } from "../../store/index";
import { watch, toRaw, WatchStopHandle, Component, createApp, ComponentPublicInstance } from "vue";
import { loadItemTypeModules } from "./model-loader";
import { GameSocketClient } from "../websocket/fp-ws-client";
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
import PropertyInfoCard from "@/components/common/property-info-card.vue";
import { loadHouseModels } from "./house-loader";
import { rgb2hex } from "..";
import { MeshBasicMaterial } from "three";

export class ThreeBuilder {
	private canvas: HTMLCanvasElement;
	private renderer: WebGLRenderer;
	private labelRenderer: CSS2DRenderer;
	private scene: Scene;
	private camera: PerspectiveCamera;
	private mapContainer: Group;
	private mapModules: Map<string, Group>;
	private mapItems: Map<string, Group>;
	private playerModules: Map<string, Group>;
	private housesModules: Map<string, Group>;
	private housesItem: Map<string, Group>;
	private playerPosition: Map<string, number>;
	private requestAnimationFrameId: number;

	private watcherList: WatchStopHandle[] = [];

	private isLockingRole: boolean;

	private currentFocusModule: Object3D | null;
	private propertyInfoLabel: CSS2DObject;
	private propertyInfoLabelInstance: ComponentPublicInstance;

	constructor(canvas: HTMLCanvasElement, contianer: HTMLDivElement) {
		this.canvas = canvas;
		this.renderer = new WebGLRenderer({ canvas, antialias: true });

		this.scene = new Scene();
		this.camera = new PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 1000);
		this.mapContainer = new Group();
		this.mapModules = new Map<string, Group>();
		this.mapItems = new Map<string, Group>();
		this.playerModules = new Map<string, Group>();
		this.housesModules = new Map<string, Group>();
		this.housesItem = new Map<string, Group>();
		this.playerPosition = new Map<string, number>();
		this.requestAnimationFrameId = -1;
		this.isLockingRole = true;

		this.currentFocusModule = null;
		const { css2dObject, appInstance } = this.generateCSS2DObject(PropertyInfoCard, {
			property: null,
		});
		this.propertyInfoLabel = css2dObject;
		this.propertyInfoLabelInstance = appInstance;

		this.scene.add(this.propertyInfoLabel);

		this.labelRenderer = new CSS2DRenderer();
		this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
		this.labelRenderer.domElement.style.position = "absolute";
		this.labelRenderer.domElement.style.top = "0px";
		this.labelRenderer.domElement.style.pointerEvents = "none";
		this.labelRenderer.domElement.style.zIndex = "500";
		contianer.appendChild(this.labelRenderer.domElement);

		window.onresize = () => {
			this.camera.aspect = window.innerWidth / window.innerHeight; //相机视角长宽比
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(window.innerWidth, window.innerHeight);
			this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
		};
	}

	public async init() {
		const bgTextureLoader = new TextureLoader();
		const bgTexture = bgTextureLoader.load("bg.png");

		this.scene.background = bgTexture;
		this.scene.add(this.mapContainer);

		//加载地图和模型
		const mapDataStore = useMapData();

		//加载模型
		const mapItemTypeList = mapDataStore.itemTypesList;
		await this.loadMapModels(mapItemTypeList);

		//加载屋子的模型
		const houseArr = ["house_lv0", "house_lv1", "house_lv2"];
		await this.loadHousesModels(houseArr);

		//加载地图
		const mapItemsList = mapDataStore.mapItemsList;
		await this.loadMap(mapItemsList);

		//加载地皮
		const gameInfo = useGameInfo();
		gameInfo.propertiesList.forEach((property) => {
			this.updateBuilding(property);
		});

		//加载玩家模型
		const playersList = mapDataStore.playerList;
		await this.loadPlayersModules(playersList);

		const gameInfoStroe = useGameInfo();

		gameInfoStroe.playersList = playersList;

		playersList.forEach((player) => this.updatePlayerPosition(player));

		this.addPlayerPositionWatcher();
		this.addPropertyLevelWatcher();

		//创建灯光
		const ambienLight = new AmbientLight(0xffffff, 1); // soft white light
		this.scene.add(ambienLight);
		// const ambienLight2 = new AmbientLight(0xffffff, 0.7); // soft white light
		// this.scene.add(ambienLight2);

		const hemiLight = new HemisphereLight(0xf3f3f3, 0xfff1e2, 0.7);
		hemiLight.position.copy(this.getGroupCenter(this.mapContainer));
		hemiLight.position.setY(3);
		this.scene.add(hemiLight);

		const pointLight = new PointLight(0xffffff, 1, 10);
		pointLight.position.copy(this.getGroupCenter(this.mapContainer));
		pointLight.position.setY(5);
		this.scene.add(pointLight);

		const userInfoStore = useUserInfo();

		//添加光线投射用于选择对象
		const raycaster = new Raycaster();
		const pointer = new Vector2();
		// 创建轨道控制器
		const controls = new OrbitControls(this.camera, this.canvas);
		controls.enableDamping = true;
		controls.maxDistance = 30;
		controls.minDistance = 1;
		controls.maxPolarAngle = Math.PI / 2;
		controls.minPolarAngle = Math.PI / 3;
		controls.update();

		const onPointerMove = (event: MouseEvent) => {
			// 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
			pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
			pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
		};
		window.addEventListener("pointermove", onPointerMove);

		const loop = () => {
			this.requestAnimationFrameId = requestAnimationFrame(loop);

			// 通过摄像机和鼠标位置更新射线
			raycaster.setFromCamera(pointer, this.camera);

			const intersects = raycaster.intersectObjects(this.scene.children);

			this.handleIntersectsResult(intersects);

			if (this.isLockingRole && this.playerModules.has(userInfoStore.userId)) {
				this.updateCamera(controls, this.playerModules.get(userInfoStore.userId)!, 5, 30);
			}
			controls.update();

			Array.from(this.playerModules.values()).forEach((player) => {
				player.lookAt(this.camera.position);
			});

			this.renderer.render(this.scene, this.camera);
			this.labelRenderer.render(this.scene, this.camera);
		};

		loop();
	}

	public distory() {
		cancelAnimationFrame(this.requestAnimationFrameId);
		this.watcherList.forEach((watcherStopHandle) => watcherStopHandle());
	}

	private handleIntersectsResult(intersects: Intersection<Object3D<any>>[]) {
		if (intersects.length > 0) {
			intersects.forEach((intersect) => {
				if (intersect.object.userData.property) {
					this.currentFocusModule = intersect.object.parent || intersect.object;
					const propertyId = intersect.object.userData.property.id;
					const gameInfoStore = useGameInfo();
					const property = gameInfoStore.propertiesList.find((item) => item.id == propertyId);

					if (property) {
						this.propertyInfoLabel.position.copy(this.currentFocusModule.position);
						this.propertyInfoLabel.position.y += 2.2;

						//@ts-ignore
						this.propertyInfoLabelInstance.updateProperty(property);
					}
				}
			});
		} else {
			//@ts-ignore
			this.propertyInfoLabelInstance.updateProperty(null);
		}
	}

	private updateCamera(controls: OrbitControls, targetObject: Object3D, followDistance: number, followAngleY: number) {
		if (!targetObject) return;
		const targetPos = targetObject.position;
		const followPos = new Vector3();
		followPos.x = targetPos.x - Math.sin(targetObject.rotation.y) * followDistance;
		followPos.y = targetPos.y + followDistance * Math.tan(MathUtils.degToRad(followAngleY));
		followPos.z = targetPos.z - Math.cos(targetObject.rotation.y) * followDistance;
		controls.target.copy(targetPos);
	}

	private addPlayerPositionWatcher() {
		const mapDataStore = useMapData();
		const playerWalkStore = usePlayerWalk();

		this.watcherList.push(
			watch(playerWalkStore, (newVal) => {
				const sourcePosition = toRaw(this.playerPosition.get(newVal.walkPlayerId)) as number;
				const mapIndexLength = toRaw(mapDataStore.mapIndexList.length);
				this.updatePlayerPositionByStep(newVal.walkPlayerId, sourcePosition, newVal.walkstep, mapIndexLength);
			})
		);
	}

	private addPropertyLevelWatcher() {
		const gameInfoStore = useGameInfo();
		this.watcherList.push(
			watch(
				() => gameInfoStore.propertiesList,
				(newList, oldList) => {
					for (let i = 0; i < newList.length; i++) {
						if (
							!this.housesItem.has(newList[i].id) ||
							newList[i].owner?.id !== oldList[i].owner?.id ||
							newList[i].buildingLevel !== oldList[i].buildingLevel
						) {
							// 对于新旧数组中不同的元素，更新 Three.js 地图
							this.updateBuilding(newList[i]);
						}
					}
					this.renderer.render(this.scene, this.camera);
				}
			)
		);
	}

	private updateBuilding(newProperty: PropertyInfo) {
		const oldModel = this.housesItem.get(newProperty.id);
		if (oldModel) this.mapContainer.remove(oldModel);

		const mapInfo = useMapData();
		const targetMapItem = mapInfo.mapItemsList.find((item) => item.property?.id === newProperty.id);
		if (!targetMapItem) return;

		const targetMapItemModel = this.mapItems.get(targetMapItem?.id);
		if (!targetMapItemModel) return;

		const buildModel = this.housesModules.get(`house_lv${newProperty.buildingLevel}`)?.clone();
		if (!buildModel) return;

		buildModel.position.copy(targetMapItemModel.position);
		buildModel.position.y += 0.5;
		buildModel.scale.copy(targetMapItemModel.scale);

		buildModel.children.forEach(async (mesh) => {
			const _mesh = mesh as Mesh;
			const meshName = mesh.userData.name as string;
			if (meshName.includes("color-block")) {
				const basicMaterial = new MeshBasicMaterial();
				if (newProperty.owner) {
					basicMaterial.color.set(rgb2hex(newProperty.owner.color));
				} else {
					basicMaterial.color.set("#cccccc");
				}
				_mesh.material = basicMaterial;
			}
		});

		const linkMapItem = mapInfo.mapItemsList.find((item) => {
			if (!item.linkto) return false;
			if (item.linkto.id === targetMapItem.id) return true;
		});

		if (linkMapItem && this.mapItems.has(linkMapItem.id)) {
			const lookat = new Vector3();
			lookat.copy(this.mapItems.get(linkMapItem.id)!.position);
			lookat.setY(0.5);

			buildModel.lookAt(lookat);
		}

		this.housesItem.set(newProperty.id, buildModel);
		this.mapContainer.add(buildModel);
	}

	private async updatePlayerPositionByStep(playerId: string, sourceIndex: number, stepNum: number, total: number) {
		this.playerPosition.set(playerId, (sourceIndex + stepNum) % total);
		const timeLine = gsap.timeline({ repeat: 0 });
		if (!this.playerModules.has(playerId)) return;
		const playerModule = this.playerModules.get(playerId) as Group;
		for (let i = 1; i <= stepNum; i++) {
			let { x, y, z } = this.getMapItemPosition((sourceIndex + i) % total);
			timeLine.to(playerModule.position, { x, y: y + 1, z, duration: 0.6 });
		}
		await timeLine.play();
		GameSocketClient.getInstance().AnimationComplete();
	}

	private updatePlayerPosition(player: PlayerInfo) {
		const { x, y, z } = this.getMapItemPosition(player.positionIndex);

		if (!this.playerModules.has(player.id)) return;
		this.playerModules.get(player.id)!.position.set(x, y + 1, z);
	}

	private getMapItemPosition(index: number) {
		const mapStore = useMapData();
		const mapIndex = mapStore.mapIndexList;
		const id = mapIndex[index];
		if (!this.mapItems.has(id)) return new Vector3(0, 0, 0);
		return this.mapItems.get(id)!.position;
	}

	private getGroupCenter(group: Group) {
		if (group.children.length === 0) return new Vector3(0, 0, 0);
		const centerPoint = new Vector3();
		group.children.forEach(function (child) {
			centerPoint.add(child.position);
		});
		const numChildren = group.children.length;
		centerPoint.divideScalar(numChildren);
		return centerPoint;
	}

	private async loadPlayersModules(playerList: Array<PlayerInfo>) {
		for await (const player of playerList) {
			try {
				this.playerPosition.set(player.id, toRaw(player.positionIndex));
				this.playerModules.set(player.id, await loadImg2mesh(`/roles/${player.user.role.filename}.png`, 0.05, 0.1));
				this.scene.add(this.playerModules.get(player.user.userId)!);
			} catch (e) {
				console.log(e);
			}
		}
	}

	private async loadHousesModels(houseNameList: string[]) {
		const modelList = await loadHouseModels(houseNameList);
		modelList.forEach((model) => {
			this.housesModules.set(model.name, model.glft.scene);
		});
	}

	private async loadMapModels(itemTypeList: ItemType[]) {
		const modelList = await loadItemTypeModules(itemTypeList);
		modelList.forEach((model) => {
			this.mapModules.set(model.id, model.glft.scene);
		});
	}

	private async loadMap(mapData: Array<MapItem>) {
		mapData.forEach((item) => {
			const tempModule = this.mapModules.get(item.type.id)!.clone();
			tempModule.children[0].userData = {
				typeId: item.type.id,
				itemId: item.id,
				property: toRaw(item.property) || undefined,
			};
			tempModule.scale.set(0.5, 0.5, 0.5);
			tempModule.position.set(item.x + item.type.size / 2, 0, item.y + item.type.size / 2);
			this.mapItems.set(item.id, tempModule);
			this.mapContainer.add(tempModule);
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

	public generateCSS2DObject(component: Component, porps: Record<string, any>) {
		// 创建Vue应用程序实例
		const app = createApp(component, porps);

		// 创建一个div元素，并将应用程序实例挂载到该元素上
		const div = document.createElement("div");
		const appInstance = app.mount(div);

		// 创建CSS2DObject，并将包含组件DOM的div元素作为参数传递
		const css2dObject = new CSS2DObject(div);

		// 返回CSS2DObject
		return { css2dObject, appInstance };
	}
}
