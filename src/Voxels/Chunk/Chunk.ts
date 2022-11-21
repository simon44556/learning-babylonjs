import { Camera, Mesh, Vector3, VertexData } from "@babylonjs/core";
import { Null_Value } from "@babylonjs/inspector/lines/optionsLineComponent";
import { Block } from "../Block/Block";
import { BlockType } from "../Block/BlockType";
import { MeshData } from "../MeshData";
import { Mesher } from "../Mesher";

// Each chunk contains an array of blocks
// Position of blocks is calculated by ([x + chunkWidth * (y + ChunkHeight * z)]) Dimension being size of the chunk
// Position is the index of blocks array

export class Chunk {
  private chunkSize: number;
  private position: Vector3; // Position of the chunk in the world
  private mesh?: Mesh;
  private blocks: Block[];
  private dimensions: number[];
  private isVisible: boolean;
  private markForMeshing: boolean;

  constructor(position: Vector3, chunkSize: number) {
    this.chunkSize = chunkSize;
    this.position = position;

    this.mesh = new Mesh("Chunk_" + this.position);

    this.mesh.position = position;

    this.dimensions = [this.chunkSize, this.chunkSize, this.chunkSize];
    this.isVisible = true;
    this.markForMeshing = true;
    this.blocks = [];
  }

  getPosition() {
    return this.position;
  }

  dispose() {
    this.mesh?.dispose();
    delete this.mesh;
  }

  isChunkVisible(camera: Camera) {
    //TODO: if visible set visibility
    // Add later rotation calculatoion
    const chunkPos = this.position;

    if (Vector3.Distance(camera.position, chunkPos) < 25) {
      this.isVisible = true;
    } else {
      this.isVisible = false;
    }
  }

  calculateMeshPosition(): Vector3 {
    return new Vector3(this.position.x * this.chunkSize, this.position.y * this.chunkSize, this.position.z * this.chunkSize);
  }

  getOneBlock(pos: Vector3): Block {
    return this.blocks[this.positionToIndex(pos)];
  }

  positionToIndex(pos: Vector3) {
    return pos.x + this.dimensions[0] * (pos.y + this.dimensions[1] * pos.z);
  }

  /**
   * Fills while chunk with one block
   * @param block
   */
  fillChunk(block: Block) {
    for (let i = 0; i < this.dimensions[0]; i++) {
      for (let j = 0; j < this.dimensions[1]; j++) {
        for (let k = 0; k < this.dimensions[2]; k++) {
          this.blocks[this.positionToIndex(new Vector3(i, j, k))] = block;
        }
      }
    }
  }

  getMarkedForMeshing() {
    return this.markForMeshing;
  }

  getMesh() {
    if (this.mesh == null) return null;
    return this.mesh;
  }

  getIsVisible() {
    return this.isVisible;
  }

  setPosition(position: Vector3) {
    this.position = position;
  }

  setBlocks(blocks: Block[]) {
    this.blocks = blocks;
  }

  UpdateMesh(mesher: Mesher): void {
    if (!this.markForMeshing || this.mesh == null) return;
    const meshData: MeshData = mesher.mesh(this.blocks, this.dimensions);
    const vertexData: VertexData = new VertexData();
    if (meshData.vertices.length > 1) {
      vertexData.positions = meshData.vertices;
      vertexData.indices = meshData.indices;
    }
    vertexData.applyToMesh(this.mesh);

    this.markForMeshing = false;
  }
}
