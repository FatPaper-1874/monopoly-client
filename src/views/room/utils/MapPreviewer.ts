import {
	AmbientLight,
	Box3,
	Color,
	Group,
	Object3D,
	PerspectiveCamera,
	Scene,
	SRGBColorSpace,
	Vector3,
	WebGLRenderer
} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {ItemType, MapItem} from "@/interfaces/bace";
import {loadItemTypeModules} from "@/utils/three/itemtype-loader";
import {debounce} from "@/utils";

export class MapPreviewer {
	private renderer: WebGLRenderer;
	private scene: Scene;
	private camera: PerspectiveCamera;
	private controls: OrbitControls;
	private mapContainer: Group;
	private models: { [key: string]: Group };
	private mapItemList: Object3D[];

	private requestAnimationFrameId: number;

	constructor(el: HTMLCanvasElement) {
		this.renderer = new WebGLRenderer({ canvas: el });
		this.scene = new Scene();
		this.scene.background = new Color(0xeeeeee);
		this.camera = new PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 1000);

		this.renderer.setSize(el.clientWidth, el.clientHeight);
		this.renderer.outputColorSpace = SRGBColorSpace;
		this.mapContainer = new Group();
		this.models = {};
		this.mapItemList = [];
		this.requestAnimationFrameId = -1;

		this.scene.add(this.mapContainer);

		//创建坐标系参考
		// const axesHelper = new AxesHelper(5);
		// this.scene.add(axesHelper);

		//创建灯光
		const light = new AmbientLight(0xffffff, 2); // soft white light
		this.scene.add(light);

		// 创建轨道控制器
		this.controls = new OrbitControls(this.camera, el);

		const loop = () => {
			this.requestAnimationFrameId = requestAnimationFrame(loop);

			this.controls.update();

			this.renderer.render(this.scene, this.camera);
		};

		window.addEventListener(
			"resize",
			debounce(() => {
				this.camera.aspect = el.clientWidth / el.clientHeight; //相机视角长宽比
				this.camera.updateProjectionMatrix();
				this.renderer.setSize(el.clientWidth, el.clientHeight);
			}, 1000)
		);

		loop();
	}

	public async loadModels(itemTypeList: ItemType[]) {
		const modelList = await loadItemTypeModules(itemTypeList.map((itemType) => itemType));
		const tempModelOBJ: { [key: string]: Group } = {};
		modelList.forEach((model) => {
			tempModelOBJ[model.id] = model.glft.scene;
		});

		this.models = tempModelOBJ;
	}

	public async loadMapItems(mapItemList: MapItem[]) {
		mapItemList.forEach((item) => {
			const tempModule = this.models[item.type.id].clone();
			tempModule.scale.set(0.5, 0.5, 0.5);
			tempModule.position.set(item.x + item.type.size / 2, 0, item.y + item.type.size / 2);
			tempModule.rotation.y = (Math.PI / 2) * item.rotation;
			this.mapContainer.add(tempModule);
		});
	}

	public async reloadMapItems(mapItemList: MapItem[]) {
		this.mapContainer.clear();
		await this.loadMapItems(mapItemList);
		this.lookAtCenter();
	}

	public lockCamera(isLock: boolean) {
		this.controls.enabled = !isLock;
		if (isLock) {
			this.lookAtCenter();
		}
	}

	public lookAtCenter() {
		// 获取场景中所有对象的中心点和最大高度
		const bbox = new Box3().setFromObject(this.mapContainer);

		const center = bbox.getCenter(new Vector3());
		const size = bbox.getSize(new Vector3());

		const maxSize = Math.max(...[size.x, size.z]);

		// 将相机移到合适的位置
		const distance = maxSize * Math.tan(this.camera.fov / 2) * 2;

		this.camera.position.set(center.x, center.y + distance * 1.2, center.z);
		this.camera.up.set(0, 0, -1);
		this.camera.lookAt(center);
		this.controls.target.set(center.x, center.y, center.z);
	}

	public distory() {
		cancelAnimationFrame(this.requestAnimationFrameId);
		this.scene.clear();
		this.renderer.clear();
		this.renderer.dispose();
		this.renderer.forceContextLoss();
	}
}
