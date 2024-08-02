import { VirtualDOM } from "@/draw/virtual-dom";
import { VirtualNode } from "@/draw/virtual-node";
import { Tile } from "@/data/tile";

export class VirtualDOMManager {
    public vdom: VirtualDOM = new VirtualDOM();

    drawTile(parentId: string, tile: Tile) {
        const node = new VirtualNode("tile", null, tile);
        this.vdom.createNode(parentId, node);
    }

    drawContainer(parentId: string, direction: "row" | "column") {
        const node = new VirtualNode("container", direction, null);
        this.vdom.createNode(parentId, node);
    }

    updateTileContent(nodeId: string, content: string) {
        this.vdom.updateNode(nodeId, { tile: new Tile("Updated Tile", content) });
    }

    deleteTile(nodeId: string) {
        this.vdom.deleteNode(nodeId);
    }
}
