import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ItemType } from "../../../utils/three/interfaces";
import { __MONOPOLYSERVER__ } from "../../../../global.config";

export const loadHouseModels = async (houseNamearr: string[]): Promise<{ name: string; glft: GLTF }[]> => {
	// const houseArr = ["house_lv0", "house_lv1", "house_lv2"];
	const promiseArr: Promise<{ name: string; glft: GLTF }>[] = new Array<Promise<{ name: string; glft: GLTF }>>();
	const gltfLoader = new GLTFLoader();
	houseNamearr.forEach((itemName) => {
		const promise = new Promise<{ name: string; glft: GLTF }>((resolve, reject) => {
			gltfLoader.load(
				`/models/${itemName}.glb`,
				(glft: GLTF) => {
					glft.userData = { name: itemName };
					resolve({ name: itemName, glft: glft });
				},
				undefined,
				(error) => {
					reject(error);
				}
			);
		});
		promiseArr.push(promise);
	});
	return await Promise.all(promiseArr);
};
