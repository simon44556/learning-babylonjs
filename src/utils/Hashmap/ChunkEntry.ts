import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Chunk } from "../../Voxels/Chunk/Chunk";

export class ChunkEntry implements Entry<Chunk, Vector3> {
  key: Vector3;
  value: Chunk;
  keyIndex: number;
}
