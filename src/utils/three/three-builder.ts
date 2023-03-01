import { AmbientLight, AxesHelper, DirectionalLight, HemisphereLight, PerspectiveCamera, Scene, Vector3, WebGLRenderer, Group, Color, TextureLoader } from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MapItem } from "../../interfaces/bace";
import { loadMapModules } from "./map-loader";

export class ThreeBuilder {
	private renderer: WebGLRenderer;
	private scene: Scene;
	private camera: PerspectiveCamera;
	private mapContainer: Group;
	private modules: { [key: string]: Group };
	private roles: { [key: string]: Group };

	constructor(canvas: HTMLCanvasElement) {
		this.renderer = new WebGLRenderer({ canvas });
		this.scene = new Scene();
		this.camera = new PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 1000);
		this.mapContainer = new Group();
		this.modules = {};
		this.roles = {};

		const bgTextureLoader = new TextureLoader();
		const bgTexture = bgTextureLoader.load('bg.png');

		this.scene.background = bgTexture;
		this.scene.add(this.mapContainer);

		this.camera.position.set(10.5, 30, 10.5);
		this.camera.rotateY(100);

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
		const controls = new OrbitControls(this.camera, canvas);
		controls.target.set(10.5, 0, 10.45);

		const loop = () => {
			requestAnimationFrame(loop);

			controls.update();

			this.renderer.render(this.scene, this.camera);
		};

		loop();
	}

	public async loadMap(mapData: Array<MapItem>) {
		this.modules = await loadMapModules(mapData);
		mapData.forEach((item) => {
			const tempModule = this.modules[item.type.name].clone();
			tempModule.scale.set(0.5, 0.5, 0.5);
			tempModule.position.set(item.x + item.type.size / 2, 0, item.y + item.type.size / 2);
			this.mapContainer.add(tempModule);
		});
	}

	public async reloadMap(mapData: Array<MapItem>) {
		this.mapContainer.clear();
		await this.loadMap(mapData);
	}
}
