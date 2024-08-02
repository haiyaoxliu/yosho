import { Tile } from "@/data/tile";

export class TileNode {
    constructor(
        public tile: Tile,
        // public relatives: TileNode[] = [this]
        public parent: TileNode,
        public children: TileNode[] = []
    ) {}
}