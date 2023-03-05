import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Group } from "three";

interface MapItem {
	id: string;
	x: number;
	y: number;
	type: TypeItem;
	link?: MapItem;
}

interface TypeItem {
	color: string;
	name: string;
	module: string;
	size: number;
}

export async function loadMapModules(mapData: Array<MapItem>): Promise<{ [key: string]: Group }> {
  const moduleNameList = Array.from(new Set(mapData.map(item => item.type.module)));
  const modules = await loadGLTFModules(moduleNameList.map(name => `modules/${name}.glb`));
  const modulesObj: { [key: string]: Group } = {};
  
  modules.forEach(gltf => {
    modulesObj[gltf.scene.name] = gltf.scene;
  })
  return modulesObj;
}

const loadGLTFModules = async (urlarr: string[]): Promise<GLTF[]> => {
	const promiseArr: Promise<GLTF>[] = new Array<Promise<GLTF>>();
	const gltfLoader = new GLTFLoader();
	urlarr.forEach((url) => {
		const promise = gltfLoader.loadAsync(url);
		promiseArr.push(promise);
	});
	return await Promise.all(promiseArr);
};
