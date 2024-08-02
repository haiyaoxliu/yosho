import { VirtualNode } from "@/draw/virtual-node";

export type RenderQueueItem = 
    | { type: "create"; id: string; node: VirtualNode }
    | { type: "update"; id: string; node: VirtualNode }
    | { type: "delete"; id: string };

export class VirtualDOM {
    private nodes: Map<string, VirtualNode> = new Map();
    private renderQueue: RenderQueueItem[] = [];

    constructor() {
        const root = new VirtualNode("container", "column", null);
        this.nodes.set("0", root);
    }

    private addToRenderQueue(item: RenderQueueItem) {
        this.renderQueue.push(item);
    }

    createNode(parentId: string, node: VirtualNode) {
        const parent = this.nodes.get(parentId);
        if (parent) {
            const childId = parent.getNextChildId(parentId);
            parent.addChild(childId);
            this.nodes.set(childId, node);
            this.addToRenderQueue({ type: "create", id: childId, node });
        }
    }

    updateNode(nodeId: string, updates: Partial<VirtualNode>) {
        const node = this.nodes.get(nodeId);
        if (node) {
            Object.assign(node, updates);
            this.addToRenderQueue({ type: "update", id: nodeId, node });
        }
    }

    deleteNode(nodeId: string) {
        const node = this.nodes.get(nodeId);
        if (node) {
            const parentId = VirtualNode.getParentId(nodeId);
            const parent = this.nodes.get(parentId);
            if (parent) {
                parent.removeChild(nodeId);
                this.nodes.delete(nodeId);
                this.addToRenderQueue({ type: "delete", id: nodeId });
            }
        }
    }

    getRenderQueue(): RenderQueueItem[] {
        const queue = [...this.renderQueue];
        this.renderQueue = []; // Clear the queue
        return queue;
    }
}