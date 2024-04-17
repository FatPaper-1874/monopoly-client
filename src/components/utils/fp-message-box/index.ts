import { App, createApp, VNode, watch } from "vue";
import FPMessageBoxVue from "./fp-message-box.vue";
import { useUtil } from "@/store";

interface Options extends Record<string, any> {
	title?: string;
	content?: string | VNode | (() => VNode);
	confirmText?: string;
	cancleText?: string;
}

export const FPMessageBox = (options: Options) => {
	return new Promise((resolve, reject) => {
		showMessageBox(options, resolve, reject);
	});
};

const showMessageBox = (options: Options, resolve: (value: unknown) => void, reject: (reason?: any) => void) => {
	const fragment = document.createDocumentFragment();
	const messageBoxApp = createApp(FPMessageBoxVue, options) as App<any>;

	const vm = messageBoxApp.mount(fragment);
	document.body.appendChild(fragment);

	//@ts-ignore
	vm.visible = true;

	const utilStore = useUtil();

	watch(
		//@ts-ignore
		() => vm.visible,
		(newVal) => {
			if (!newVal) {
				messageBoxApp.unmount();
				//@ts-ignore
				if (vm.isConfirm) {
					resolve("");
				} else {
					reject();
				}
			}
		}
	);

	watch(
		() => utilStore.timeOut,
		(newVal) => {
			if (newVal) {
				messageBoxApp.unmount();
			}
		}
	);
};