import { Vector3 } from "@babylonjs/core";
import { Chunk } from "../Voxels/Chunk/Chunk";
import { ChunkEntry } from "./ChunkEntry";

/**
 * Simple hashmap implementation assuming collisions are not possible
 */
export class ChunkHashMap implements HashMap<ChunkEntry, Vector3, Chunk> {
  buckets: ChunkEntry[];
  size: number;
  keys: Vector3[];
  loadFactor: number;

  chunkSize: number;

  constructor(initialCapacity: number, loadFactor: number = 0.75, chunkSize: number = 16) {
    this.buckets = new Array(initialCapacity);

    this.loadFactor = loadFactor;
    this.size = 0;

    this.chunkSize = chunkSize;

    this.keys = new Array();
  }

  getAllKeys(): Vector3[] {
    return this.keys;
  }

  get(key: Vector3): Chunk {
    const bucketIndex = this._getBucketIndex(key);
    return this.buckets[bucketIndex].value;
  }

  has(key: Vector3): boolean {
    const bucketIndex = this._getBucketIndex(key);
    return this.buckets[bucketIndex] != null;
  }

  set(key: Vector3, value: Chunk): ChunkHashMap {
    const bucketIndex = this._getBucketIndex(key);

    if (this.buckets[bucketIndex] == null) {
      const keyIndex = this.keys.push(key) - 1;
      this.buckets[bucketIndex] = new ChunkEntry();
      this.buckets[bucketIndex].keyIndex = keyIndex;
      this.size++;
    } else {
      console.error("Overriding key: ", key);
    }

    this.buckets[bucketIndex].key = key;
    this.buckets[bucketIndex].value = value;

    if (this.loadFactor > 0 && this.getLoadFactor() > this.loadFactor) {
      this.expand(this.buckets.length * 2);
    }

    return this;
  }

  delete(key: Vector3): boolean {
    const bucketIndex = this._getBucketIndex(key);

    delete this.keys[this.buckets[bucketIndex].keyIndex];

    this.size--;

    return true;
  }

  hash(key: Vector3): number {
    const normalPos = key.divide(new Vector3(this.chunkSize, this.chunkSize, this.chunkSize)).floor();
    return (normalPos.x + this.chunkSize) * (normalPos.y + this.chunkSize * normalPos.z);
  }

  expand(newSize: number): void {
    console.log("Expanding to ", newSize);
    const newMap = new ChunkHashMap(newSize, this.loadFactor, this.chunkSize);

    this.keys.forEach((key) => {
      if (key) {
        newMap.set(key, this.get(key));
      }
    });

    this.buckets = newMap.buckets;
    this.keys = newMap.keys;
  }

  getLoadFactor(): number {
    return this.size / this.buckets.length;
  }

  _getBucketIndex(key: Vector3): number {
    return this.hash(key) % this.buckets.length;
  }
}
