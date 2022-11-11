import { MeshData } from "./MeshData";

export interface Mesher {
  mesh(volume: number[], dims: number[]): MeshData;
}
