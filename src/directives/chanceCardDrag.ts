import {ChanceCardOperateType} from "@/enums/game";
import {ChanceCardInfo} from "@/interfaces/bace";
import {lightenColor} from "@/utils";
import EventEmitter from "@/utils/eventemitter";
import {Directive, DirectiveBinding, toRaw} from "vue";

const eventEmitter = EventEmitter.getInstance();

export const chanceCardSource: Directive = {
    mounted: (el: HTMLElement, binding: DirectiveBinding) => {
        const chanceCard = toRaw(binding.value) as ChanceCardInfo;

        const svgNamespace = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNamespace, "svg");
        const path = document.createElementNS(svgNamespace, "path");
        const defsElement = document.createElementNS(svgNamespace, "defs");

        const markerElement = document.createElementNS(svgNamespace, "marker");
        markerElement.setAttribute("id", "arrow");
        markerElement.setAttribute("viewBox", "0 0 1024 1024");
        markerElement.setAttribute("width", "10");
        markerElement.setAttribute("height", "10");
        markerElement.setAttribute("refX", "820");
        markerElement.setAttribute("refY", "570");
        markerElement.setAttribute("markerWidth", "3");
        markerElement.setAttribute("markerHeight", "3");
        markerElement.setAttribute("transform", "translate(-60, 0)");
        markerElement.setAttribute("orient", "auto-start-reverse");
        const markerPath = document.createElementNS(svgNamespace, "path");
        markerPath.setAttribute(
            "d",
            "M399.304 0c47.25 0 87.652 41.3 87.652 89.6v199.702c34.096-32.68 99.532-36.692 141.888 12.598 45.658-28.576 106.034-4.294 124.63 32.9C851.756 316.852 896 378.692 896 480c0 5.492-0.406 26.552-0.39 32 0.336 123.942-62.13 153.788-76.63 247.462C815.366 782.808 795.198 800 771.572 800H428.522l-0.002-0.004c-36.732-0.022-71.778-21.214-87.69-56.928C314.842 685.296 242.754 552.244 186.184 528 149.794 512.406 128.016 485.232 128 448c-0.028-68.444 70.196-115.504 133.816-88.238 16.718 7.166 33.34 16.624 49.836 28.306V89.6c0-46.9 41.086-89.6 87.652-89.6zM400 832h384c26.51 0 48 21.49 48 48v96c0 26.51-21.49 48-48 48H400c-26.51 0-48-21.49-48-48v-96c0-26.51 21.49-48 48-48z m336 56c-22.092 0-40 17.908-40 40s17.908 40 40 40 40-17.908 40-40-17.908-40-40-40z"
        );
        markerPath.setAttribute("transform", "rotate(90 512 512)");
        markerPath.setAttribute("fill", chanceCard.color);
        markerPath.style.filter = "drop-shadow(1px 1px 5px #00000033)";
        markerElement.appendChild(markerPath);
        defsElement.appendChild(markerElement);

        svg.setAttribute("xmlns", svgNamespace);
        svg.setAttribute("width", window.innerWidth + "");
        svg.setAttribute("height", window.innerHeight + "");
        svg.setAttribute("viewBox", `0 0 ${window.innerWidth} ${window.innerHeight}`);
        svg.style.position = "fixed";
        svg.style.left = "0";
        svg.style.top = "0";
        svg.style.zIndex = "501";
        svg.style.pointerEvents = "none";
        svg.appendChild(defsElement);

        path.setAttribute("stroke", chanceCard.color);
        path.setAttribute("stroke-width", "15");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke-dasharray", "20 15");
        path.setAttribute("stroke-linejoin", "round");
        path.setAttribute("marker-end", "url(#arrow)");
        path.style.filter = "drop-shadow(1px 1px 5px #00000033)";

        svg.appendChild(path);

        el.draggable = true;

        function handleMouseMove(mouse: DragEvent) {
            // if (mouse.dataTransfer) {
            //     mouse.dataTransfer.dropEffect = 'none'
            //     mouse.dataTransfer.effectAllowed = "none";
            // }
            document.body.style.cursor = "none";
            const boundingRect = el.getBoundingClientRect();

            const startX = boundingRect.left + (boundingRect.right - boundingRect.left) / 2;
            const startY = boundingRect.top + 20;

            const endX = mouse.pageX;
            const endY = mouse.pageY;

            if (startX && startY && endX && endY) {
                setPath(startX, startY, endX, endY);
            }
        }

        function setPath(startX: number, startY: number, endX: number, endY: number) {
            path.setAttribute("d", `M ${startX} ${startY} ${endX} ${endY}`);
        }

        el.addEventListener("dragstart", (event: DragEvent) => {
            if (event.dataTransfer) {
                event.dataTransfer.setData("chance-card", JSON.stringify(chanceCard));
                event.dataTransfer.setDragImage(document.createElement("div"), 0, 0);
            }
            document.body.appendChild(svg);
            eventEmitter.emit(ChanceCardOperateType.HOVER, chanceCard);
        });

        el.addEventListener("dragend", (event: DragEvent) => {
            path.setAttribute("d", "");
            document.body.removeChild(svg);
            document.body.style.cursor = "initial";
        });

        el.addEventListener("drag", handleMouseMove);
    },
};

export const chanceCardTarget: Directive = {
    mounted: (el: HTMLElement, binding: DirectiveBinding) => {
        el.addEventListener("dragover", (event: DragEvent) => {
            if (event.dataTransfer) {
                event.dataTransfer.effectAllowed = "move";
            }
            event.preventDefault();
        });

        el.addEventListener("drop", (event: DragEvent) => {
            const dataTransfer = event.dataTransfer;
            if (dataTransfer) {
                const chanceCard = JSON.parse(dataTransfer.getData("chance-card"));
                eventEmitter.emit(ChanceCardOperateType.DROG, chanceCard, event.pageX, event.pageY);
            }
            event.preventDefault();
        });
    },
};
