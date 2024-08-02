import { TileNode } from "@/data/tile-node";

export class TileTree {
    constructor(
        public root: TileNode,
        public current: TileNode
    ) {}
}