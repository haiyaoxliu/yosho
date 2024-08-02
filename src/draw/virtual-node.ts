import { Tile } from "@/data/tile"

type Direction = "row" | "column";

export class VirtualNode {
    public children: string[] = [];
    private nextChildIndex: number = 0;

    constructor(
        public type: "container" | "tile",
        public direction: Direction | null,
        public tile: Tile | null
    ) {}

    addChild(childId: string) {
        this.children.push(childId);
    }

    removeChild(childId: string) {
        const index = this.children.indexOf(childId);
        if (index !== -1) {
            this.children.splice(index, 1);
        }
    }

    getNextChildId(parentId: string): string {
        const childId = `${parentId}-${this.nextChildIndex}`;
        this.nextChildIndex++;
        return childId;
    }

    static getParentId(id: string): string {
        const parts = id.split('-');
        return parts.slice(0, -1).join('-');
    }
}