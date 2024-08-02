import { RenderQueueItem } from "@/draw/virtual-dom";
import { VirtualNode } from "@/draw/virtual-node";

export function render(queue: RenderQueueItem[]) {
    for (const item of queue) {
        const domId = `node-${item.id}`;
        switch (item.type) {
            case "create":
                const newElement = document.createElement('div');
                newElement.id = domId;
                if (item.node.type === "tile") {
                    newElement.textContent = item.node.tile?.content || "";
                } else {
                    newElement.style.display = "flex";
                    newElement.style.flexDirection = item.node.direction || "column";
                }
                const parentDomId = `node-${VirtualNode.getParentId(item.id)}`;
                const parentElement = document.getElementById(parentDomId);
                if (parentElement) {
                    parentElement.appendChild(newElement);
                }
                break;
            case "update":
                const elementToUpdate = document.getElementById(domId);
                if (elementToUpdate && item.node.type === "tile") {
                    elementToUpdate.textContent = item.node.tile?.content || "";
                }
                break;
            case "delete":
                const elementToDelete = document.getElementById(domId);
                if (elementToDelete) {
                    elementToDelete.remove();
                }
                break;
        }
    }
}