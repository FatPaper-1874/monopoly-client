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
	PointLightHelper,
} from "three";

import { gsap } from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ChanceCardInfo, ItemType, MapItem, PlayerInfo, PropertyInfo } from "@/interfaces/bace";
import { loadImg2mesh } from "@/utils/three/role-loader";
import { useGameInfo, useMapData, usePlayerWalkAnimation, useUserInfo } from "@/store";
import { watch, toRaw, WatchStopHandle, Component, createApp, ComponentPublicInstance } from "vue";
import { loadItemTypeModules } from "@/utils/three/itemtype-loader";
import { GameSocketClient } from "@/utils/websocket/fp-ws-client";
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
import PropertyInfoCard from "../components/property-info-card.vue";
import moneyPopTip from "../components/money-pop-tip.vue";
import { loadHouseModels } from "./house-loader";
import { MeshBasicMaterial } from "three";
import { __MONOPOLYSERVER__ } from "../../../../global.config";
import { debounce, getScreenPosition } from "@/utils";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";
import { ChanceCardOperateType, ChanceCardType, RoleAnimations } from "@/enums/game";
import { PlayerEntity } from "@/classes/game/PlayerEntity";
import useEventBus from "@/utils/event-bus";

const GROUND_HEIGHT = 0.09;

export class GameRenderer {
	private canvas: HTMLCanvasElement;
	private renderer: WebGLRenderer;
	private popElementRenderer: CSS2DRenderer;
	private scene: Scene;
	private camera: PerspectiveCamera;
	private composer: EffectComposer;
	private renderPass: RenderPass;
	private chanceCardTargetOutlinePass: OutlinePass;

	private mapContainer: Group;
	private mapModules: Map<string, Group>;
	private mapItems: Map<string, Group>;
	private playerEntites: Map<string, PlayerEntity>;
	private housesModules: Map<string, Group>;
	private housesItems: Map<string, Group>;
	private playerPosition: Map<string, number>;
	private requestAnimationFrameId: number;

	private watcherList: WatchStopHandle[] = [];

	private isLockingRole: boolean;

	private currentFocusModule: Object3D | null;

	private propertyInfoLabel: CSS2DObject;
	private propertyInfoLabelInstance: ComponentPublicInstance;

	constructor(canvas: HTMLCanvasElement, container: HTMLDivElement) {
		this.canvas = canvas;
		this.renderer = new WebGLRenderer({ canvas, antialias: true });

		this.scene = new Scene();
		this.camera = new PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 1000);
		this.composer = new EffectComposer(this.renderer);
		this.renderPass = new RenderPass(this.scene, this.camera);
		this.chanceCardTargetOutlinePass = new OutlinePass(
			new Vector2(canvas.clientWidth, canvas.clientHeight),
			this.scene,
			this.camera
		);
		const pixelRatio = this.renderer.getPixelRatio();
		// width、height是canva画布的宽高度

		// const smaaPass = new SMAAPass(canvas.clientWidth * pixelRatio, canvas.clientHeight * pixelRatio);
		//
		// this.composer.addPass(smaaPass);
		this.composer.addPass(this.renderPass);
		this.composer.addPass(this.chanceCardTargetOutlinePass);

		this.mapContainer = new Group();
		this.mapModules = new Map<string, Group>();
		this.mapItems = new Map<string, Group>();
		this.playerEntites = new Map<string, PlayerEntity>();
		this.housesModules = new Map<string, Group>();
		this.housesItems = new Map<string, Group>();
		this.playerPosition = new Map<string, number>();
		this.requestAnimationFrameId = -1;
		this.isLockingRole = true;

		this.currentFocusModule = null;
		const { css2dObject, appInstance } = createCSS2DObject(PropertyInfoCard, {
			property: null,
		});
		this.propertyInfoLabel = css2dObject;
		this.propertyInfoLabelInstance = appInstance;

		this.scene.add(this.propertyInfoLabel);

		this.popElementRenderer = new CSS2DRenderer();
		this.popElementRenderer.setSize(window.innerWidth, window.innerHeight);
		this.popElementRenderer.domElement.style.position = "absolute";
		this.popElementRenderer.domElement.style.top = "0px";
		this.popElementRenderer.domElement.style.pointerEvents = "none";
		this.popElementRenderer.domElement.style.zIndex = "500";
		container.appendChild(this.popElementRenderer.domElement);

		window.addEventListener(
			"resize",
			debounce(() => {
				this.camera.aspect = window.innerWidth / window.innerHeight; //相机视角长宽比
				this.camera.updateProjectionMatrix();
				this.renderer.setSize(window.innerWidth, window.innerHeight);
				this.renderPass.setSize(window.innerWidth, window.innerHeight);
				this.composer.setSize(window.innerWidth, window.innerHeight);
				this.popElementRenderer.setSize(window.innerWidth, window.innerHeight);
			}, 500)
		);
	}

	public async init() {
		//加载背景
		this.initBackground();

		//加载地图
		await this.initMap();

		//加载玩家模型
		await this.initPlayer();

		//加载机会卡
		this.initChanceCard();

		//初始化灯光
		this.initLight();

		//设置OutlinePass
		this.initOutlinePass();

		console.dir(Array.from(this.playerEntites.values()));

		const userInfoStore = useUserInfo();

		//添加光线投射用于选择对象
		const propertyRaycaster = new Raycaster();
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
			pointer.x = (event.clientX / this.canvas.clientWidth) * 2 - 1;
			pointer.y = -(event.clientY / this.canvas.clientHeight) * 2 + 1;
		};
		window.addEventListener("pointermove", onPointerMove);

		const loop = () => {
			this.requestAnimationFrameId = requestAnimationFrame(loop);

			this.handlePropertyRaycaster(propertyRaycaster, pointer);

			if (this.isLockingRole && this.playerEntites.has(userInfoStore.userId)) {
				this.updateCamera(controls, this.playerEntites.get(userInfoStore.userId)!.model, 5, 30);
			}
			controls.update();

			Array.from(this.playerEntites.values()).forEach((player) => {
				player.model.lookAt(this.camera.position);
				player.update();
			});

			// this.renderer.render(this.scene, this.camera);
			this.composer.render();
			this.popElementRenderer.render(this.scene, this.camera);
		};

		loop();
	}

	private initBackground() {
		const bgTextureLoader = new TextureLoader();
		const mapData = useMapData();
		const bgTexture = bgTextureLoader.load(`http://${mapData.mapBackground}`);

		this.scene.background = bgTexture;
		this.scene.add(this.mapContainer);
	}

	private async initMap() {
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

		//监听地皮等级，进行升级的时候改变模型
		this.addPropertyLevelWatcher();
	}

	private async initPlayer() {
		const mapDataStore = useMapData();
		const playersList = mapDataStore.playerList;
		await this.loadPlayersModules(playersList);

		const gameInfoStore = useGameInfo();
		gameInfoStore.playersList = playersList;
		playersList.forEach((player) => {
			this.updatePlayerPosition(player);
		});

		//玩家模型走路动画监听
		this.addPlayerWalkWatcher();

		//玩家金钱变化监听,金钱失去或得到效果
		this.addPlayerMoneyWatcher();
	}

	private initChanceCard() {
		this.addChanceCardUseWatcher();
	}

	private initLight() {
		//创建灯光
		const ambienLight = new AmbientLight(0xffffff, 1); // soft white light
		this.scene.add(ambienLight);
		// const ambienLight2 = new AmbientLight(0xffffff, 0.7); // soft white light
		// this.scene.add(ambienLight2);

		const hemiLight = new HemisphereLight(0xf3f3f3, 0xfff1e2, 0.7);
		hemiLight.position.copy(this.getGroupCenter(this.mapContainer));
		hemiLight.position.setY(3);
		this.scene.add(hemiLight);

		const pointLight = new PointLight(0xfff1e2, 2, 10);
		pointLight.position.copy(this.getGroupCenter(this.mapContainer));
		pointLight.position.setY(5);

		const lightHelper = new PointLightHelper(pointLight);
		this.scene.add(lightHelper);
		this.scene.add(pointLight);
	}

	private initOutlinePass() {
		//模型描边颜色，默认白色
		this.chanceCardTargetOutlinePass.visibleEdgeColor.set(0x00ff00);
		//高亮发光描边厚度
		this.chanceCardTargetOutlinePass.edgeThickness = 1;
		//高亮描边发光强度
		this.chanceCardTargetOutlinePass.edgeStrength = 5;
		//模型闪烁频率控制，默认0不闪烁
		this.chanceCardTargetOutlinePass.pulsePeriod = 2;
	}

	private handlePropertyRaycaster(raycaster: Raycaster, pointer: Vector2) {
		// 通过摄像机和鼠标位置更新射线
		raycaster.setFromCamera(pointer, this.camera);

		const intersects = raycaster.intersectObjects(Array.from(this.housesItems.values()));
		if (intersects.length > 0) {
			const intersect = intersects[0];
			const target = intersect.object.parent as Group;
			const propertyInfo = target.userData as any;
			if (propertyInfo.isProperty) {
				this.propertyInfoLabel.position.copy(target.position);
				this.propertyInfoLabel.position.y += 2.2;
				//@ts-ignore
				this.propertyInfoLabelInstance.updateProperty(propertyInfo);
			}
		} else {
			//@ts-ignore
			this.propertyInfoLabelInstance.updateProperty(null);
		}
	}

	public distory() {
		cancelAnimationFrame(this.requestAnimationFrameId);
		this.watcherList.forEach((watcherStopHandle) => watcherStopHandle());
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

	private addPlayerWalkWatcher() {
		const mapDataStore = useMapData();
		const playerWalkStore = usePlayerWalkAnimation();

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
							!this.housesItems.has(newList[i].id) ||
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

	private addPlayerMoneyWatcher() {
		const _this = this;
		const gameInfoStore = useGameInfo();
		gameInfoStore.playersList.forEach((player, index) => {
			_this.watcherList.push(
				watch(
					() => gameInfoStore.playersList[index].money,
					(newMoney, oldMoney = 0) => {
						this.createPopoverOnPlayerTop(player.user.userId, moneyPopTip, { money: newMoney - oldMoney }, 2000);
					},
					{ immediate: true }
				)
			);
		});
	}

	private addChanceCardUseWatcher() {
		const eventEmitter = useEventBus();
		eventEmitter.on(ChanceCardOperateType.HOVER, handleChanceCardHover.bind(this));
		eventEmitter.on(ChanceCardOperateType.DROG, handleChanceCardDrog.bind(this));

		function handleChanceCardHover(this: GameRenderer, chanceCard: ChanceCardInfo) {
			switch (chanceCard.type) {
				case ChanceCardType.ToSelf:
					this.outlineModels(this.getModulesByChanceCardType(ChanceCardType.ToSelf));
					break;
				case ChanceCardType.ToOtherPlayer:
					this.outlineModels(this.getModulesByChanceCardType(ChanceCardType.ToOtherPlayer));
					break;
				case ChanceCardType.ToProperty:
					this.outlineModels(this.getModulesByChanceCardType(ChanceCardType.ToProperty));
					break;
			}
		}

		function handleChanceCardDrog(this: GameRenderer, chanceCard: ChanceCardInfo, mouseX: number, mouseY: number) {
			const raycaster = new Raycaster();
			const pointer = new Vector2();
			pointer.x = (mouseX / this.canvas.clientWidth) * 2 - 1;
			pointer.y = -(mouseY / this.canvas.clientHeight) * 2 + 1;

			raycaster.setFromCamera(pointer, this.camera);
			const intersects = raycaster.intersectObjects(this.getModulesByChanceCardType(chanceCard.type), true);

			if (intersects.length > 0) {
				const firstInstance = intersects[0];
				const target = firstInstance.object;

				let temp: THREE.Object3D | null = target;
				while (temp) {
					if (temp.userData.isProperty) {
						GameSocketClient.getInstance().useChanceCard(chanceCard.id, temp.userData.id);
						break;
					} else {
						temp = temp.parent;
					}
				}
			} else {
				//@ts-ignore
				this.propertyInfoLabelInstance.updateProperty(null);
			}

			this.chanceCardTargetOutlinePass.selectedObjects = [];
		}
	}

	private outlineModels(models: Object3D[]) {
		console.log(models);
		this.chanceCardTargetOutlinePass.selectedObjects = models;
	}

	private async updateBuilding(newProperty: PropertyInfo) {
		const oldModel = this.housesItems.get(newProperty.id);
		if (oldModel) {
			await gsap.to(oldModel.scale, { x: 0, y: 0, z: 0, duration: 0.2 });
			this.mapContainer.remove(oldModel);
		}

		const mapInfo = useMapData();
		const targetMapItem = mapInfo.mapItemsList.find((item) => item.property?.id === newProperty.id);
		if (!targetMapItem) return;

		const targetMapItemModel = this.mapItems.get(targetMapItem?.id);
		if (!targetMapItemModel) return;

		const buildModel = this.housesModules.get(`house_lv${newProperty.buildingLevel}`)?.clone();
		if (!buildModel) return;

		buildModel.position.copy(targetMapItemModel.position);
		buildModel.position.y += GROUND_HEIGHT;
		buildModel.scale.copy(targetMapItemModel.scale);
		buildModel.userData = { ...newProperty, isProperty: true };

		buildModel.children.forEach((mesh) => {
			const _mesh = mesh as Mesh;
			console.log(_mesh);

			const meshName = mesh.userData.name as string;
			if (meshName.includes("color-block")) {
				const basicMaterial = new MeshBasicMaterial();
				if (newProperty.owner) {
					basicMaterial.color.set(newProperty.owner.color);
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
			lookat.setY(GROUND_HEIGHT);

			buildModel.lookAt(lookat);
			buildModel.rotateY(Math.PI / 2);
		}
		buildModel.scale.set(0, 0, 0);

		this.housesItems.set(newProperty.id, buildModel);
		this.mapContainer.add(buildModel);
		gsap.to(buildModel.scale, { x: 0.5, y: 0.5, z: 0.5, duration: 0.4 });
	}

	private async updatePlayerPositionByStep(playerId: string, sourceIndex: number, stepNum: number, total: number) {
		if (!this.playerEntites.has(playerId)) return;
		this.playerPosition.set(playerId, (sourceIndex + stepNum) % total);
		const playerEntity = this.playerEntites.get(playerId);
		if (playerEntity) {
			await playerEntity.doAnimation(RoleAnimations.RoleWalkStart);
			playerEntity.doAnimation(RoleAnimations.Idle, true);
			const playerModule = playerEntity.model;
			playerEntity.doAnimation(RoleAnimations.RoleWalking, true);
			for (let i = 1; i <= stepNum; i++) {
				const nextMapItem = this.getMapItem((sourceIndex + i) % total); //下一步
				if (nextMapItem) {
					const { x: nextMapItemScreenX, y: nextMapItemScreenY } = getScreenPosition(nextMapItem, this.camera);
					const { x: playerScreenX, y: playerScreenY } = getScreenPosition(playerEntity.model, this.camera);
					const currentAnimationName = playerEntity.getCurrentAnimationName();
					if (
						nextMapItemScreenX > playerScreenX &&
						(currentAnimationName === RoleAnimations.RoleWalking || currentAnimationName === RoleAnimations.Idle)
					) {
						gsap.to(playerEntity.model.scale, { x: 1, duration: 0.3 });
					} else if (
						nextMapItemScreenX < playerScreenX &&
						(currentAnimationName === RoleAnimations.RoleWalking || currentAnimationName === RoleAnimations.Idle)
					) {
						gsap.to(playerEntity.model.scale, { x: -1, duration: 0.3 });
					}
					const { x, y, z } = nextMapItem.position;
					await gsap.to(playerModule.position, { x, y: y + GROUND_HEIGHT, z, duration: 0.6 });
					// await gsap.to(playerModule.position, {x, y, z, duration: 0.6});
				} else {
					throw new Error("在设置角色运动朝向时读取MapItem错误");
				}
			}
			await playerEntity.doAnimation(RoleAnimations.RoleWalkEnd);
			playerEntity.doAnimation(RoleAnimations.Idle, true);
		}
		GameSocketClient.getInstance().AnimationComplete();
	}

	private updatePlayerPosition(player: PlayerInfo) {
		const { x, y, z } = this.getMapItemPosition(player.positionIndex);

		if (!this.playerEntites.has(player.id)) return;
		this.playerEntites.get(player.id)!.model.position.set(x, y + GROUND_HEIGHT, z);
		// this.playerEntites.get(player.id)!.model.position.set(x, y, z);
	}

	private getMapItemPosition(index: number) {
		const mapStore = useMapData();
		const mapIndex = mapStore.mapIndexList;
		const id = mapIndex[index];
		if (!this.mapItems.has(id)) return new Vector3(0, 0, 0);
		return this.mapItems.get(id)!.position;
	}

	private getMapItem(index: number) {
		const mapStore = useMapData();
		const mapIndex = mapStore.mapIndexList;
		const id = mapIndex[index];
		return this.mapItems.get(id);
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

	private getModulesByChanceCardType(type: ChanceCardType) {
		const chanceCardTargetEachType: Record<ChanceCardType, Object3D[]> = {
			[ChanceCardType.ToSelf]: (() => {
				const selfEntity = this.playerEntites.get(useUserInfo().userId);
				return selfEntity ? [selfEntity.model] : [];
			})(),
			[ChanceCardType.ToOtherPlayer]: (() =>
				Array.from(this.playerEntites.values())
					.filter((playerEntity) => playerEntity.playerInfo.id !== useUserInfo().userId)
					.map((p) => p.model))(),
			[ChanceCardType.ToProperty]: (() => Array.from(this.housesItems.values()))(),
			[ChanceCardType.ToMapItem]: (() =>
				Array.from(this.playerEntites.values())
					.filter((playerEntity) => playerEntity.playerInfo.id !== useUserInfo().userId)
					.map((p) => p.model))(),
		};
		return chanceCardTargetEachType[type];
	}

	private async loadPlayersModules(playerList: Array<PlayerInfo>) {
		for await (const player of playerList) {
			try {
				this.playerPosition.set(player.id, toRaw(player.positionIndex));
				const playerEntity = new PlayerEntity(
					1,
					`http://${player.user.role.baseUrl}/`,
					player.user.role.fileName,
					player
				);
				await playerEntity.load();
				this.playerEntites.set(player.id, playerEntity);
				this.scene.add(playerEntity.model);
			} catch (e) {
				console.log(e);
			}
		}
	}

	private async loadHousesModels(houseNameList: string[]) {
		const modelList = await loadHouseModels(houseNameList);
		modelList.forEach((model) => {
			console.log("🚀 ~ GameRenderer ~ modelList.forEach ~ model:", model);
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
			tempModule.rotation.y = (Math.PI / 2) * item.rotation;
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

	private createPopoverOnPlayerTop(
		playerId: string,
		component: Component,
		props?: Record<string, any>,
		delay?: number
	) {
		const playerEntity = this.playerEntites.get(playerId);
		if (!playerEntity) return;
		const position = new Vector3();
		position.copy(playerEntity.model.position);

		const { css2dObject, appInstance, unmount } = createCSS2DObject(component, props);

		position.y += 1.1;
		css2dObject.position.copy(position);
		this.scene.add(css2dObject);
		delay && setTimeout(unmount, delay);
	}
}

function createCSS2DObject(rootComponent: Component, rootProps?: Record<string, any>) {
	// 创建Vue应用程序实例
	const app = createApp(rootComponent, rootProps);

	// 创建一个div元素，并将应用程序实例挂载到该元素上
	const containerEl = document.createElement("div");
	const appInstance = app.mount(containerEl);

	// 创建CSS2DObject，并将包含组件DOM的div元素作为参数传递
	const css2dObject = new CSS2DObject(containerEl);

	function unmount() {
		app.unmount();
	}

	// 返回CSS2DObject
	return { css2dObject, appInstance, containerEl, unmount };
}
