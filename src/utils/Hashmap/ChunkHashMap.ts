import { Vector3 } from "@babylonjs/core";
import { Chunk } from "../../Voxels/Chunk/Chunk";
import { ChunkEntry } from "./ChunkEntry";

/**
 * Simple hashmap implementation assuming collisions are not possible
 */
export class ChunkHashMap implements HashMap<ChunkEntry, Vector3> {
  buckets: ChunkEntry[][];
  size: number;
  keys: Vector3[];
  loadFactor: number;

  chunkSize: number;
  collisions: number;

  constructor(initialCapacity: number, loadFactor: number = 0.75, chunkSize: number = 16) {
    this.buckets = new Array(initialCapacity);

    this.loadFactor = loadFactor;
    this.size = 0;

    this.chunkSize = chunkSize;

    this.keys = new Array();
    this.collisions = 0;
  }

  getAllKeys(): Vector3[] {
    return this.keys;
  }

  get(key: Vector3): any | null {
    const { bucketIndex, entryIndex } = this._getIndexes(key);

    if (entryIndex === -1) {
      return null;
    }

    return this.buckets[bucketIndex][entryIndex].value;
  }

  has(key: Vector3): boolean {
    return !!this.get(key);
  }

  set(key: Vector3, value: any): ChunkHashMap {
    const { bucketIndex, entryIndex } = this._getIndexes(key);

    if (entryIndex === -1) {
      //console.log("Setting key:", key);
      const keyIndex = this.keys.push(key) - 1;
      this.buckets[bucketIndex] = this.buckets[bucketIndex] || [];

      this.buckets[bucketIndex].push({ key, value, keyIndex });

      this.size++;

      if (this.buckets[bucketIndex].length > 1) {
        this.collisions++;
        //console.log("Collisions", this.collisions);
      }
    } else {
      console.error("Overriding key: ", key);
      this.buckets[bucketIndex][entryIndex].value = value;
    }

    if (this.loadFactor > 0 && this.getLoadFactor() > this.loadFactor) {
      this.expand(this.buckets.length * 2);
    }

    return this;
  }

  delete(key: Vector3): boolean {
    const { bucketIndex, entryIndex, keyIndex } = this._getIndexes(key);

    this.buckets[bucketIndex].splice(entryIndex, 1);
    //delete this.keys[keyIndex];

    this.keys[keyIndex] = Vector3.Zero();

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
        const chunk = this.get(key);
        if (chunk == null) {
          return;
        } else {
          newMap.set(key, chunk);
        }
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

  _getIndexes(key: Vector3): { bucketIndex: number; entryIndex: number; keyIndex: number } {
    const bucketIndex = this._getBucketIndex(key);
    const values = this.buckets[bucketIndex] || [];

    for (let entryIndex = 0; entryIndex < values.length; entryIndex++) {
      const entry = values[entryIndex];
      if (entry.key.equals(key)) {
        return { bucketIndex: bucketIndex, entryIndex: entryIndex, keyIndex: entry.keyIndex };
      }
    }

    return { bucketIndex: bucketIndex, entryIndex: -1, keyIndex: -1 };
  }
}
