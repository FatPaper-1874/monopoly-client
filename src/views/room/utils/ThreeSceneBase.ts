import * as THREE from "three";
import {debounce} from "@/utils";

export class ThreeSceneBase{
    protected renderer: THREE.WebGLRenderer;
    protected scene: THREE.Scene;
    protected camera: THREE.PerspectiveCamera;
    protected requestAnimationFrameId: number = -1;
    private resizeObserver: ResizeObserver | undefined;

    constructor(canvas: HTMLCanvasElement, resize = true) {
        this.renderer = new THREE.WebGLRenderer({canvas});
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
        // this.renderLoop();

        const parentEl = canvas.parentElement;
        if (resize && parentEl) {
            const tempDivEl = document.createElement('div');
            tempDivEl.style.width = '100%';
            tempDivEl.style.height = '100%';
            tempDivEl.append(canvas);
            parentEl.append(tempDivEl)
            const callback: ResizeObserverCallback = (entries) => {
                if (entries.length === 0) return
                const _parentEl = entries[0].target;
                if (_parentEl) {
                    this.renderer.setSize(_parentEl.clientWidth, _parentEl.clientHeight);
                    this.camera.aspect = _parentEl.clientWidth / _parentEl.clientHeight;
                    this.camera.updateProjectionMatrix();
                }
            }
            const resizeObserver = new ResizeObserver(debounce(callback.bind(this), 100));
            resizeObserver.observe(tempDivEl, {})
            this.resizeObserver = resizeObserver;
        }
    }

    protected renderLoop() {
        this.renderer.render(this.scene, this.camera);
        this.requestAnimationFrameId = requestAnimationFrame(this.renderLoop.bind(this));
    }

    protected destroy() {
        this.resizeObserver && this.resizeObserver.disconnect();
        cancelAnimationFrame(this.requestAnimationFrameId);
        this.scene.clear();
        this.renderer.dispose();
    }
}