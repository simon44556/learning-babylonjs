/**
 * Simple hashmap def assuming collisions are not possible
 */
interface HashMap<T, K, V> {
  buckets: T[];
  size: number;
  keys: K[];
  loadFactor: number;

  get(key: K): V;
  set(key: K, value: V): any;
  delete(key: K): boolean;
  hash(key: K): number;
  has(key: K): boolean;

  expand(newSize: number): void;
  getLoadFactor(): number;

  _getBucketIndex(key: K): number;
}
