import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
export const loadHouseModels = async (houseNamearr: string[]): Promise<{ name: string; glft: GLTF }[]> => {
	// const houseArr = ["house_lv0", "house_lv1", "house_lv2"];
	const promiseArr: Promise<{ name: string; glft: GLTF }>[] = new Array<Promise<{ name: string; glft: GLTF }>>();
	const gltfLoader = new GLTFLoader();
	houseNamearr.forEach((itemName) => {
		const promise = new Promise<{ name: string; glft: GLTF }>((resolve, reject) => {
			gltfLoader.load(
				`https://fatpaper-1304992673.cos.ap-guangzhou.myqcloud.com/monopoly/static/${itemName}.glb`,
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
