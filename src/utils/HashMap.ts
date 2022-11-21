/**
 * Simple hashmap def assuming collisions are not possible
 */
interface HashMap<T, K, V> {
  buckets: T[][];
  size: number;
  keys: K[];
  loadFactor: number;
  collisions: number;

  get(key: K): V | null;
  set(key: K, value: V): any;
  delete(key: K): boolean;
  hash(key: K): number;
  has(key: K): boolean;

  expand(newSize: number): void;
  getLoadFactor(): number;

  _getBucketIndex(key: K): number;

  _getIndexes(key: K): { bucketIndex: number; entryIndex: number; keyIndex: number };
}
