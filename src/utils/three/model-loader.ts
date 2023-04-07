import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ItemType } from "./interfaces";
import { _BASEURL_ } from "@/bace";

export const loadItemTypeModules = async (itemTypeList: ItemType[]): Promise<{ id: string; glft: GLTF }[]> => {
	const promiseArr: Promise<{ id: string; glft: GLTF }>[] = new Array<Promise<{ id: string; glft: GLTF }>>();
	const gltfLoader = new GLTFLoader();
	itemTypeList.forEach((itemType) => {
		const promise = new Promise<{ id: string; glft: GLTF }>((resolve, reject) => {
			gltfLoader.load(
				`${_BASEURL_}/static/models/${itemType.model.fileName}`,
				(glft: GLTF) => {
					glft.userData = {typeId: itemType.id}
					resolve({ id: itemType.id, glft: glft });
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
