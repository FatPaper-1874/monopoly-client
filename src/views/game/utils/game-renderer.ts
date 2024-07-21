import {
    AmbientLight,
    Box3,
    Color,
    DirectionalLight,
    DoubleSide,
    Group,
    HemisphereLight,
    MathUtils,
    Mesh,
    MeshBasicMaterial,
    MeshStandardMaterial,
    Object3D,
    PerspectiveCamera,
    PlaneGeometry,
    Quaternion,
    Raycaster,
    Scene,
    Sprite,
    SpriteMaterial,
    SRGBColorSpace,
    Texture,
    TextureLoader,
    Vector2,
    Vector3,
    WebGLRenderer,
} from "three";

import {gsap} from "gsap";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {ChanceCardInfo, ItemType, MapItem, PlayerInfo, PropertyInfo} from "@/interfaces/game";
import {useDeviceStatus, useGameInfo, useMapData, usePlayerWalkAnimation, useUserInfo} from "@/store";
import {Component, ComponentPublicInstance, createApp, toRaw, watch, WatchStopHandle} from "vue";
import {loadItemTypeModules} from "@/utils/three/itemtype-loader";
import {GameSocketClient} from "@/utils/websocket/fp-ws-client";
import {CSS2DObject, CSS2DRenderer} from "three/examples/jsm/renderers/CSS2DRenderer";
import PropertyInfoCard from "./components/property-info-card.vue";
import ArrivedEventCard from "./components/arrived-event-card.vue";
import moneyPopTip from "../components/money-pop-tip.vue";
import {loadHouseModels} from "./house-loader";
import {debounce, getScreenPosition} from "@/utils";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {OutlinePass} from "three/examples/jsm/postprocessing/OutlinePass";
import {ChanceCardOperateType, ChanceCardType, RoleAnimations} from "@/enums/game";
import {PlayerEntity} from "@/classes/game/PlayerEntity";
import useEventBus from "@/utils/event-bus";
import {GammaCorrectionShader} from "three/examples/jsm/shaders/GammaCorrectionShader";
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass";

const BLOCK_HEIGHT = 0.09;

export class GameRenderer {
    private canvas: HTMLCanvasElement;
    private renderer: WebGLRenderer;
    private popElementRenderer: CSS2DRenderer;
    private scene: Scene;
    private camera: PerspectiveCamera;
    private composer: EffectComposer;
    private renderPass: RenderPass;
    private chanceCardTargetOutlinePass: OutlinePass;

    private mapContainer: Group = new Group();
    private mapModules: Map<string, Group> = new Map<string, Group>();
    private mapItems: Map<string, Group> = new Map<string, Group>();
    private playerEntities: Map<string, PlayerEntity> = new Map<string, PlayerEntity>();
    private housesModules: Map<string, Group> = new Map<string, Group>();
    private housesItems: Map<string, Group> = new Map<string, Group>();
    private arrivedEventIcons: Map<string, Mesh> = new Map<string, Mesh>();
    private playerPosition: Map<string, number> = new Map<string, number>();
    private requestAnimationFrameId: number = -1;

    private playerWatchers: Map<string, {
        stopWatcher: WatchStopHandle | undefined,
        moneyWatcher: WatchStopHandle | undefined,
        bankruptWatcher: WatchStopHandle | undefined,
    }> = new Map();
    private commonWatchers: WatchStopHandle[] = [];

    private isLockingRole: boolean = false;

    private currentFocusModule: Object3D | null = null;

    private propertyInfoLabel: CSS2DObject;
    private propertyInfoLabelInstance: ComponentPublicInstance;

    private arrivedEventInfoLabel: CSS2DObject;
    private arrivedEventInfoLabelInstance: ComponentPublicInstance;

    constructor(canvas: HTMLCanvasElement, container: HTMLDivElement) {
        this.canvas = canvas;
        this.renderer = new WebGLRenderer({canvas, antialias: true});
        this.renderer.outputColorSpace = SRGBColorSpace

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
        const gammaPass = new ShaderPass(GammaCorrectionShader);
        this.composer.addPass(gammaPass);

        const {
            css2DObject: propertyCSS2DObject,
            appInstance: propertyInfoLabelInstance
        } = createCSS2DObjectFromVue(PropertyInfoCard, {
            property: null,
        });
        this.propertyInfoLabel = propertyCSS2DObject;
        this.propertyInfoLabelInstance = propertyInfoLabelInstance;

        const {
            css2DObject: arrivedEventCSS2DObject,
            appInstance: arrivedEventLabelInstance
        } = createCSS2DObjectFromVue(ArrivedEventCard, {
            property: null,
        });
        this.arrivedEventInfoLabel = arrivedEventCSS2DObject;
        this.arrivedEventInfoLabelInstance = arrivedEventLabelInstance;

        this.scene.add(this.propertyInfoLabel);
        this.scene.add(this.arrivedEventInfoLabel);

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

        const userInfoStore = useUserInfo();

        //添加光线投射用于选择对象
        const propertyRaycaster = new Raycaster();
        const arrivedEventRaycaster = new Raycaster();
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
            this.handleArrivedEventRaycaster(propertyRaycaster, pointer);

            if (this.isLockingRole && this.playerEntities.has(userInfoStore.userId)) {
                this.updateCamera(controls, this.playerEntities.get(userInfoStore.userId)!.model, 5, 30);
            }
            controls.update();

            Array.from(this.playerEntities.values()).forEach((player) => {
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

        //玩家数据监听
        this.addPlayerStateWatcher();

        //玩家模型走路动画监听
        this.addPlayerWalkWatcher();
    }

    private initChanceCard() {
        this.addChanceCardUseWatcher();
    }

    private initLight() {
        //创建灯光
        const ambientLight = new AmbientLight(0xffffff, 2); // soft white light
        this.scene.add(ambientLight);
        // const ambienLight2 = new AmbientLight(0xffffff, 0.7); // soft white light
        // this.scene.add(ambienLight2);

        const hemisphereLight = new HemisphereLight(0xf3f3f3, 0xfff1e2, 2);
        hemisphereLight.color.setHSL(0.6, 1, 0.6);
        hemisphereLight.groundColor.setHSL(0.095, 1, 0.75);
        hemisphereLight.position.copy(this.getGroupCenter(this.mapContainer));
        hemisphereLight.position.setY(20);
        this.scene.add(hemisphereLight);

        const dirLight = new DirectionalLight(0xffffff, 3);
        dirLight.color.setHSL(0.1, 1, 0.95);
        dirLight.position.set(-1, 20, -1);
        dirLight.position.multiplyScalar(30);
        dirLight.target.position.set(21, 0, 21);
        this.scene.add(dirLight);

        dirLight.castShadow = true;

        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;

        const d = 50;

        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;

        dirLight.shadow.camera.far = 3500;
        dirLight.shadow.bias = -0.0001;

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
                this.propertyInfoLabel.position.y += (new Box3()).setFromObject(target).max.y;
                //@ts-ignore
                this.propertyInfoLabelInstance.updateProperty(propertyInfo);
            }
        } else {
            //@ts-ignore
            this.propertyInfoLabelInstance.updateProperty(null);
        }
    }

    private handleArrivedEventRaycaster(raycaster: Raycaster, pointer: Vector2) {
        // 通过摄像机和鼠标位置更新射线
        raycaster.setFromCamera(pointer, this.camera);

        const intersects = raycaster.intersectObjects(Array.from(this.mapItems.values()));
        if (intersects.length > 0) {
            const firstInstance = intersects[0];
            let target: Object3D | null = firstInstance.object;
            while (target) {
                if (target.userData.isMapItem) {
                    break;
                } else {
                    target = target.parent;
                }
            }
            if (target && target.userData.arrivedEvent) {
                const arrivedEvent = target.userData.arrivedEvent;

                this.arrivedEventInfoLabel.position.copy(target.position);
                // this.arrivedEventInfoLabel.position.y += 2.2;
                //@ts-ignore
                this.arrivedEventInfoLabelInstance.updateArrivedEvent(arrivedEvent);
            } else {
                //@ts-ignore
                this.arrivedEventInfoLabelInstance.updateArrivedEvent(null);
            }
        } else {
            //@ts-ignore
            this.arrivedEventInfoLabelInstance.updateArrivedEvent(null);
        }
    }

    public destroy() {
        cancelAnimationFrame(this.requestAnimationFrameId);
        Array.from(this.playerWatchers.values()).forEach(watchers => {
            watchers.stopWatcher && watchers.stopWatcher();
            watchers.moneyWatcher && watchers.moneyWatcher();
            watchers.bankruptWatcher && watchers.bankruptWatcher();
        })
        this.commonWatchers.forEach(f => f());
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

    private addPlayerStateWatcher() {
        const gameInfoStore = useGameInfo();
        gameInfoStore.playersList.forEach((player, index) => {
            const stopWatcher = watch(
                () => gameInfoStore.playersList[index].stop,
                (newStop) => {
                    if (newStop > 0) {
                        const playerEntity = Array.from(this.playerEntities.values()).find(p => p.playerInfo.id === player.id);
                        playerEntity && playerEntity.doAnimation("sleeping", true);
                    }
                },
                {immediate: true}
            )
            const moneyWatcher = watch(
                () => gameInfoStore.playersList[index].money,
                (newMoney, oldMoney = 0) => {
                    this.createPopoverOnPlayerTop(player.user.userId, moneyPopTip, {money: newMoney - oldMoney}, 2000);
                },
                {immediate: true}
            )
            const bankruptWatcher = watch(
                () => gameInfoStore.playersList[index].isBankrupted,
                (isBankrupted) => {
                    if (!isBankrupted) return;
                    const playerEntity = Array.from(this.playerEntities.values()).find(p => p.playerInfo.id === player.id);
                    playerEntity && playerEntity.doAnimation("failed", true);
                    const watchers = this.playerWatchers.get(player.id);
                    if (watchers) {
                        watchers.stopWatcher && watchers.stopWatcher();
                        watchers.moneyWatcher && watchers.moneyWatcher();
                        watchers.bankruptWatcher && watchers.bankruptWatcher();
                    }
                },
                {immediate: true}
            )
            this.playerWatchers.set(player.id, {
                stopWatcher,
                moneyWatcher,
                bankruptWatcher,
            })
        });
    }

    private addPlayerWalkWatcher() {
        const mapDataStore = useMapData();
        const playerWalkStore = usePlayerWalkAnimation();

        this.commonWatchers.push(
            watch(playerWalkStore, (newVal) => {
                const sourcePosition = toRaw(this.playerPosition.get(newVal.walkPlayerId)) as number;
                const mapIndexLength = toRaw(mapDataStore.mapIndexList.length);
                this.updatePlayerPositionByStep(newVal.walkPlayerId, sourcePosition, newVal.walkstep, mapIndexLength);
            })
        );
    }

    private addPropertyLevelWatcher() {
        const gameInfoStore = useGameInfo();
        this.commonWatchers.push(
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

    private addChanceCardUseWatcher() {
        const eventEmitter = useEventBus();
        eventEmitter.on(ChanceCardOperateType.HOVER, handleChanceCardHover.bind(this));
        eventEmitter.on(ChanceCardOperateType.DROG, handleChanceCardDrog.bind(this));

        function handleChanceCardHover(this: GameRenderer, chanceCard: ChanceCardInfo) {
            switch (chanceCard.type) {
                case ChanceCardType.ToSelf:
                    this.outlineModels(this.getModulesByChanceCardType(ChanceCardType.ToSelf));
                    break;
                case ChanceCardType.ToPlayer:
                    this.outlineModels(this.getModulesByChanceCardType(ChanceCardType.ToPlayer));
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
                let temp: Object3D | null = firstInstance.object;
                while (temp) {
                    if (temp.userData.id) {
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
        this.chanceCardTargetOutlinePass.selectedObjects = models;
    }

    private async updateBuilding(newProperty: PropertyInfo) {
        const oldModel = this.housesItems.get(newProperty.id);
        if (oldModel) {
            await gsap.to(oldModel.scale, {x: 0, y: 0, z: 0, duration: 0.2});
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
        buildModel.position.y += BLOCK_HEIGHT;
        buildModel.scale.copy(targetMapItemModel.scale);
        buildModel.userData = {...newProperty, isProperty: true};

        buildModel.traverse((object) => {
            if (object.userData.name) {
                const meshName = object.userData.name as string;
                if (meshName.includes("color-block")) {
                    object.traverse(o => {
                        //@ts-ignore
                        if (o.isMesh) {
                            // const basicMaterial = (<Mesh>o).material as Material;
                            const basicMaterial = new MeshStandardMaterial();
                            if (newProperty.owner) {
                                basicMaterial.color = new Color(Number(newProperty.owner.color.replace("#", "0x")));
                                // const {r, g, b} = hexToRgbNormalized(newProperty.owner.color);
                                // basicMaterial.onBeforeCompile = function (shader) {
                                //     shader.fragmentShader = shader.fragmentShader.replace(
                                //         '#include <dithering_fragment>',
                                //         `
                                //         #include <dithering_fragment>
                                //         gl_FragColor = vec4(${r} * gl_FragColor.r, ${g} * gl_FragColor.g, ${b} * gl_FragColor.b, gl_FragColor.a);
                                //         `
                                //     )
                                // }
                            } else {
                                basicMaterial.color.set("#cccccc");
                            }
                            (<Mesh>o).material = basicMaterial;
                        }
                    })

                }
            }
        });

        const linkMapItem = mapInfo.mapItemsList.find((item) => {
            if (!item.linkto) return false;
            if (item.linkto.id === targetMapItem.id) return true;
        });

        if (linkMapItem && this.mapItems.has(linkMapItem.id)) {
            const lookat = new Vector3();
            lookat.copy(this.mapItems.get(linkMapItem.id)!.position);
            lookat.setY(BLOCK_HEIGHT);

            buildModel.lookAt(lookat);
            buildModel.rotateY(-Math.PI / 2);
        }
        buildModel.scale.set(0, 0, 0);

        this.housesItems.set(newProperty.id, buildModel);
        this.mapContainer.add(buildModel);
        gsap.to(buildModel.scale, {x: 0.5, y: 0.5, z: 0.5, duration: 0.4});
    }

    private async updatePlayerPositionByStep(playerId: string, sourceIndex: number, stepNum: number, total: number) {
        if (!this.playerEntities.has(playerId)) return;
        this.playerPosition.set(playerId, (sourceIndex + stepNum) % total);
        const playerEntity = this.playerEntities.get(playerId);
        if (playerEntity) {
            // playerEntity.doAnimation(RoleAnimations.Idle, true);
            const playerModule = playerEntity.model;
            playerEntity.doAnimation(RoleAnimations.RoleWalking, true);

            //页面进入后台后取消动画
            let animationShouldStop = false;
            let currentAnimation: gsap.core.Tween | null = null;
            const deviceStatusStore = useDeviceStatus();
            deviceStatusStore.$subscribe((mutation, state) => {
                animationShouldStop = state.isFocus;
            })
            for (let i = 1; i <= stepNum; i++) {
                //页面进入后台后取消动画
                if (animationShouldStop) {
                    currentAnimation && currentAnimation.kill();
                    const endMapItem = this.getMapItem((sourceIndex + stepNum) % total);
                    if (endMapItem) {
                        const {x, y, z} = endMapItem.position;
                        playerModule.position.set(x, y + BLOCK_HEIGHT, z);
                    } else {
                        throw new Error("在读取EndMapItem错误");
                    }
                    break;
                }
                const nextMapItem = this.getMapItem((sourceIndex + i) % total); //下一步
                if (nextMapItem) {
                    const {x: nextMapItemScreenX, y: nextMapItemScreenY} = getScreenPosition(nextMapItem, this.camera);
                    const {x: playerScreenX, y: playerScreenY} = getScreenPosition(playerEntity.model, this.camera);
                    const currentAnimationName = playerEntity.getCurrentAnimationName();
                    if (
                        nextMapItemScreenX > playerScreenX &&
                        (currentAnimationName === RoleAnimations.RoleWalking || currentAnimationName === RoleAnimations.Idle)
                    ) {
                        currentAnimation = gsap.to(playerEntity.model.scale, {x: 1, duration: 0.3});
                    } else if (
                        nextMapItemScreenX < playerScreenX &&
                        (currentAnimationName === RoleAnimations.RoleWalking || currentAnimationName === RoleAnimations.Idle)
                    ) {
                        currentAnimation = gsap.to(playerEntity.model.scale, {x: -1, duration: 0.3});
                    }
                    const {x, y, z} = nextMapItem.position;
                    currentAnimation = gsap.to(playerModule.position, {x, y: y + BLOCK_HEIGHT, z, duration: 0.6});
                    await currentAnimation.play();
                    // await gsap.to(playerModule.position, {x, y, z, duration: 0.6});
                } else {
                    throw new Error("在设置角色运动朝向时读取MapItem错误");
                }
            }
            playerEntity.doAnimation(RoleAnimations.Idle, true);
        }
        GameSocketClient.getInstance().AnimationComplete();
    }

    private updatePlayerPosition(player: PlayerInfo) {
        const {x, y, z} = this.getMapItemPosition(player.positionIndex);

        if (!this.playerEntities.has(player.id)) return;
        this.playerEntities.get(player.id)!.model.position.set(x, y + BLOCK_HEIGHT, z);
        // this.playerEntities.get(player.id)!.model.position.set(x, y, z);
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
                const selfEntity = this.playerEntities.get(useUserInfo().userId);
                return selfEntity ? [selfEntity.model] : [];
            })(),
            [ChanceCardType.ToPlayer]: (() =>
                Array.from(this.playerEntities.values())
                    .filter((playerEntity) => !playerEntity.playerInfo.isBankrupted)
                    .map((p) => p.model))(),
            [ChanceCardType.ToProperty]: (() => Array.from(this.housesItems.values()))(),
            [ChanceCardType.ToMapItem]: (() =>
                Array.from(this.playerEntities.values())
                    .filter((playerEntity) => playerEntity.playerInfo.id !== useUserInfo().userId)
                    .map((p) => p.model))(),
        };
        return chanceCardTargetEachType[type];
    }

    private async loadPlayersModules(playerList: Array<PlayerInfo>) {
        const playerModelSize = 0.7;
        for await (const player of playerList) {
            try {

                this.playerPosition.set(player.id, toRaw(player.positionIndex));
                const playerEntity = new PlayerEntity(
                    playerModelSize,
                    `http://${player.user.role.baseUrl}/`,
                    player.user.role.fileName,
                    player
                );
                await playerEntity.load();
                this.playerEntities.set(player.id, playerEntity);
                const nameSprite = createTextSprite(player.user.username, 32, player.user.color, 5);
                nameSprite.position.set(0, playerModelSize + 0.05, 0)
                playerEntity.model.add(nameSprite);
                this.scene.add(playerEntity.model);
            } catch (e) {

            }
        }
    }

    private async loadHousesModels(houseNameList: string[]) {
        const modelList = await loadHouseModels(houseNameList);
        modelList.forEach((model) => {
            ;
            this.housesModules.set(model.name, model.glft.scene);
        });
    }

    private async loadMapModels(itemTypeList: ItemType[]) {
        const modelList = await loadItemTypeModules(itemTypeList);
        modelList.forEach((model) => {
            this.mapModules.set(model.id, model.glft.scene);
        });
    }

    private async loadMap(mapItemsList: Array<MapItem>) {
        const textureLoader = new TextureLoader();
        const mapDataStore = useMapData();
        const mapIndex = mapDataStore.mapIndexList;
        mapItemsList.forEach((mapItem) => {
            const tempModule = this.mapModules.get(mapItem.type.id)!.clone();
            tempModule.userData = {
                typeId: mapItem.type.id,
                itemId: mapItem.id,
                property: toRaw(mapItem.property) || undefined,
                arrivedEvent: toRaw(mapItem.arrivedEvent) || undefined,
                isMapItem: true,
            };
            tempModule.scale.set(0.5, 0.5, 0.5);
            // tempModule.position.set(mapItem.x + mapItem.type.size / 2, 0, mapItem.y + mapItem.type.size / 2);
            // tempModule.rotation.y = (Math.PI / 2) * mapItem.rotation;
            if (mapItem.arrivedEvent) {
                const mapItemsInMapIndex = mapItemsList.filter((i) =>
                    mapIndex.includes(i.id)
                );
                const arrivedEvent = mapItem.arrivedEvent;
                textureLoader.load(`http://${arrivedEvent.iconUrl}`, (texture) => {
                    // texture.matrixAutoUpdate = false

                    texture.colorSpace = SRGBColorSpace;
                    const planeGeometry = new PlaneGeometry(1, 1);
                    const planeMaterial = new MeshBasicMaterial({
                        map: texture,
                        side: DoubleSide,
                        transparent: true,
                        depthWrite: false,
                    });
                    const iconPlane = new Mesh(planeGeometry, planeMaterial);
                    iconPlane.rotateX(Math.PI / 2)
                    if (mapIndex.length > 0) {
                        //根据路径优化图标方向
                        const currentIndex = mapIndex.findIndex((item) => item === mapItem.id);
                        const preMapItem = mapItemsInMapIndex[(currentIndex - 1) < 0 ? (currentIndex - 1 + mapItemsInMapIndex.length) : (currentIndex - 1)]
                        const nextMapItem = mapItemsInMapIndex[(currentIndex + 1) % mapItemsInMapIndex.length];
                        // 计算两个点之间的向量
                        const direction = new Vector3();
                        direction.subVectors(new Vector3(preMapItem.x, 0, preMapItem.y), new Vector3(nextMapItem.x, 0, nextMapItem.y)).normalize();
                        // 设定一个法向量，图片朝上，y=1
                        const normal = new Vector3(0, 1, 0);
                        // 计算旋转四元数，使得法向量旋转到direction
                        const quaternion = new Quaternion();
                        quaternion.setFromUnitVectors(normal, direction);
                        //应用
                        iconPlane.quaternion.copy(quaternion);
                        this.arrivedEventIcons.set(arrivedEvent.id, iconPlane)
                        this.mapContainer.add(iconPlane);
                        this.setItemPositionOnMap(iconPlane, mapItem.x, mapItem.y, 0, BLOCK_HEIGHT + 0.01);
                    }
                });
            }
            this.setItemPositionOnMap(tempModule, mapItem.x, mapItem.y, mapItem.rotation);
            this.mapItems.set(mapItem.id, tempModule);
            this.mapContainer.add(tempModule);
        });
    }

    private setItemPositionOnMap(object: Object3D, x: number, z: number, rotation = 0, y: number = 0) {
        object.position.set(x + 0.5, y, z + 0.5);
        object.rotation.y = (Math.PI / 2) * rotation;
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
        const playerEntity = this.playerEntities.get(playerId);
        if (!playerEntity) return;
        const position = new Vector3();
        position.copy(playerEntity.model.position);

        const {css2DObject, appInstance, unmount} = createCSS2DObjectFromVue(component, props);

        position.y += (playerEntity.size + 0.1);
        css2DObject.position.copy(position);
        this.scene.add(css2DObject);
        delay && setTimeout(unmount, delay);
    }
}

function createCSS2DObjectFromVue(rootComponent: Component, rootProps?: Record<string, any>) {
    // 创建Vue应用程序实例
    const app = createApp(rootComponent, rootProps);

    // 创建一个div元素，并将应用程序实例挂载到该元素上
    const containerEl = document.createElement("div");
    const appInstance = app.mount(containerEl);

    // 创建CSS2DObject，并将包含组件DOM的div元素作为参数传递
    const css2DObject = new CSS2DObject(containerEl);

    function unmount() {
        app.unmount();
    }

    // 返回CSS2DObject
    return {css2DObject, appInstance, containerEl, unmount};
}

function createTextSprite(text: string, fontSize: number, color: string, strokeWidth: number) {
    const canvas = document.createElement("canvas");
    const resolution = 10;
    const h = fontSize * resolution;
    const w = fontSize * resolution;
    canvas.width = w;
    canvas.height = h;
    const c = canvas.getContext("2d") as CanvasRenderingContext2D;
    // 文字
    c.beginPath();
    c.translate(w / 2, h / 2);
    c.fillStyle = color;
    c.font = `bold ${fontSize}px ContentFont`;
    c.textBaseline = "middle";
    c.textAlign = "center";
    c.lineWidth = strokeWidth;
    c.strokeStyle = "#fff";
    c.strokeText(text, 0, 0);
    c.fillText(text, 0, 0);
    const texture = new Texture(canvas);
    texture.needsUpdate = true;
    texture.colorSpace = SRGBColorSpace;
    const material = new SpriteMaterial({
        map: texture,
        depthWrite: false,
        transparent: true,
        side: DoubleSide,

    });
    return new Sprite(material);
}