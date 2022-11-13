import { Block } from "./Block/Block";
import { MeshData } from "./MeshData";

export interface Mesher {
  mesh(volume: Block[], dims: number[]): MeshData;
}
