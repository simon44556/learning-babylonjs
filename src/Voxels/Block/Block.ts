import { BlockType } from "./BlockType";

// One block which contains basic properties
// Each block has a hash index in the chunk
// Position is calculated by ([x + chunkWidth * (y + ChunkHeight * z)]) Dimension being size of the chunk
export class Block {
  blockType: BlockType;
  isTransparent: boolean;

  constructor(type: BlockType, isTransparent?: boolean) {
    this.blockType = type;
    this.isTransparent = isTransparent || false;
  }

  setType(type: BlockType): void {
    this.blockType = type;
  }
  setTransparent(transparent: boolean): void {
    this.isTransparent = transparent;
  }
}
