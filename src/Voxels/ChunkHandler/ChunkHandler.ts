import { Camera, Mesh, Quaternion, Scene, Vector3, VertexBuffer } from "@babylonjs/core";
import { ChunkHashMap } from "../../utils/ChunkHashMap";
import { Block } from "../Block/Block";
import { BlockType } from "../Block/BlockType";
import { Chunk } from "../Chunk/Chunk";
import { GreedyMesher } from "../GreedyTry";
import { Mesher } from "../Mesher";

export class ChunkHandler {
  private chunkSize: number = 16;
  private chunkDistance: number = 2;
  private scene: Scene;
  private camera: Camera;
  private rootMesh: Mesh;
  private previousCameraPosition: Vector3;
  private previousCameraRotation: Quaternion;

  private mesher: Mesher;

  private chunks: Chunk[];
  //TODO: Split to seperate lists
  private hashesToLoad: number[];
  private hashesToRemove: number[];

  private chunkHashMap: ChunkHashMap;

  private loadListHashes: Uint32Array;
  private setupListHashes: Uint32Array;
  private rebuildListHashes: Uint32Array;
  private unloadListHashes: Uint32Array;
  private visibilityListHashes: Uint32Array;
  private renderListHashes: Uint32Array;

  constructor(scene: Scene, camera: Camera) {
    this.scene = scene;
    this.camera = camera;
    this.rootMesh = new Mesh("Chunks");
    this.mesher = new GreedyMesher();

    const amountToLoad = 10 * 10 * 10;
    this.chunkHashMap = new ChunkHashMap(64, 0.8, this.chunkSize);

    //if (this.chunks.length < amountToLoad) {
    //load new
    const currentPos: Vector3 = this.camera.position;
    for (let i = currentPos.x - this.chunkDistance * this.chunkSize; i < currentPos.x + this.chunkDistance * this.chunkSize; i += this.chunkSize) {
      for (let j = currentPos.y - this.chunkDistance * this.chunkSize; j < currentPos.y + this.chunkDistance * this.chunkSize; j += this.chunkSize) {
        for (let k = currentPos.z - this.chunkDistance * this.chunkSize; k < currentPos.z + this.chunkDistance * this.chunkSize; k += this.chunkSize) {
          const keys: any[] = this.chunkHashMap.getAllKeys();
          const vec = new Vector3(i, j, k);
          const position = vec;

          if (keys.includes(position)) {
            continue;
          }

          const chunk = new Chunk(vec, this.chunkSize);
          if (j > 1) chunk.fillChunk(new Block(BlockType.AIR, false)); //TODO: Change chunk fill
          else chunk.fillChunk(new Block(BlockType.RED, false)); //TODO: Change chunk fill

          this.rootMesh.addChild(chunk.getMesh());
          this.chunkHashMap.set(vec, chunk);
        }
      }
    }
    //}

    this.update();
  }

  update() {
    this.runChunkMesher();
    this.updateLoadList();
    this.updateSetupList();
    this.updateRebuildList();
    //this.updateFlagsList();
    this.updateUnloadList();
    this.updateVisibilityList();

    if (!this.camera.position.equals(this.previousCameraPosition) && !this.camera.absoluteRotation.equals(this.previousCameraRotation)) {
      this.updateRenderList();
    }

    this.previousCameraPosition = this.camera.position.clone();
    this.previousCameraRotation = this.camera.absoluteRotation.clone();
    //Save old camera pos to new one
  }

  getChunkCoordinate(pos: Vector3): Vector3 {
    return pos.divide(new Vector3(this.chunkSize, this.chunkSize, this.chunkSize)).floor();
  }
  getChunkIndexHashForCoordinate(pos: Vector3): number {
    const normalPos = this.getChunkCoordinate(pos);
    return (normalPos.x + this.chunkSize) * (normalPos.y + this.chunkSize * normalPos.z);
    /**
     * |0,0,0|0,1,0|0,2,0|
     * |1,0,0|1,0,1|1,0,2|
     */
  }

  runChunkMesher() {
    // TODO: Mesh certain amount of chunks per tick dependand on time

    for (const key of this.chunkHashMap.getAllKeys()) {
      if (key == null) continue;
      if (this.chunkHashMap.get(key).getMarkedForMeshing()) {
        this.chunkHashMap.get(key).UpdateMesh(this.mesher);
      }
    }
  }

  updateLoadList() {
    // TODO: Check if new chunks need to be loaded to memory
    // Loaded chunks x arround camera position
    // Check if we neeed to load chunks
    // if yes populate a list of chunks here

    if (!this.camera.position.equals(this.previousCameraPosition)) {
      //calculate chunks that should be loaded

      const currentPos: Vector3 = this.camera.position;

      const topRight: Vector3 = currentPos.add(
        new Vector3(this.chunkDistance * this.chunkSize, this.chunkDistance * this.chunkSize, this.chunkDistance * this.chunkSize)
      );
      const bottomLeft: Vector3 = currentPos.add(
        new Vector3(-this.chunkDistance * this.chunkSize, -this.chunkDistance * this.chunkSize, -this.chunkDistance * this.chunkSize)
      );

      const hashTopRight: number = this.getChunkIndexHashForCoordinate(topRight);
      const hashBottomLeft: number = this.getChunkIndexHashForCoordinate(bottomLeft);

      const keys: any[] = this.chunkHashMap.getAllKeys();
      let lowestKey: number = keys[0];
      let maxKey: number = keys[0];
      for (const key of keys) {
        if (key == null) continue;
        if (this.getChunkIndexHashForCoordinate(key) < lowestKey) {
          lowestKey = key;
        }
        if (this.getChunkIndexHashForCoordinate(key) > maxKey) {
          maxKey = key;
        }
      }

      if (maxKey !== hashTopRight || lowestKey !== hashBottomLeft) {
        for (let i = currentPos.x - this.chunkDistance * this.chunkSize; i < currentPos.x + this.chunkDistance * this.chunkSize; i += this.chunkSize) {
          for (let j = currentPos.y - this.chunkDistance * this.chunkSize; j < currentPos.y + this.chunkDistance * this.chunkSize; j += this.chunkSize) {
            for (let k = currentPos.z - this.chunkDistance * this.chunkSize; k < currentPos.z + this.chunkDistance * this.chunkSize; k += this.chunkSize) {
              const vec = new Vector3(i, j, k);
              const currentHash = this.getChunkIndexHashForCoordinate(vec);
              if (!this.chunkHashMap.has(vec)) {
                console.log("new chunk at ", currentHash);
                console.log("new chunk at ", keys);
                //this.hashesToLoad.push(currentHash);

                const chunk = new Chunk(this.getChunkCoordinate(vec), this.chunkSize);
                //this.chunks[this.getChunkIndexHashForCoordinate(vec)].fillChunk(new Block(BlockType.RED, false)); //TODO: Change chunk fill
                if (j > 1) chunk.fillChunk(new Block(BlockType.AIR, false)); //TODO: Change chunk fill
                else chunk.fillChunk(new Block(BlockType.RED, false)); //TODO: Change chunk fill

                this.chunkHashMap.set(vec, chunk);
              }
            }
          }
        }
      }
    }
  }

  updateSetupList() {
    // TODO: List of new chunks that needs meshing
  }

  updateRebuildList() {
    // TODO: List of chunks that need remeshing
    // Check if any data inside chunks changed and put it up for remesh
  }

  updateFlagsList() {
    // TODO: not sure what this will be
  }

  updateUnloadList() {
    // TODO: remove chunks from loaded //not sure if neeeded since gc takes care of it

    if (!this.camera.position.equals(this.previousCameraPosition)) {
      //calculate chunks that should be loaded

      const currentPos: Vector3 = this.camera.position;

      const topRight: Vector3 = currentPos.add(
        new Vector3(this.chunkDistance * this.chunkSize, this.chunkDistance * this.chunkSize, this.chunkDistance * this.chunkSize)
      );
      const bottomLeft: Vector3 = currentPos.add(
        new Vector3(-this.chunkDistance * this.chunkSize, -this.chunkDistance * this.chunkSize, -this.chunkDistance * this.chunkSize)
      );

      const hashTopRight: number = this.getChunkIndexHashForCoordinate(topRight);
      const hashBottomLeft: number = this.getChunkIndexHashForCoordinate(bottomLeft);

      const keys: any[] = this.chunkHashMap.getAllKeys();
      let lowestKey: number = keys[0];
      let maxKey: number = keys[0];
      for (const key of keys) {
        if (key == null) continue;
        if (this.getChunkIndexHashForCoordinate(key) < lowestKey) {
          lowestKey = key;
        }
        if (this.getChunkIndexHashForCoordinate(key) > maxKey) {
          maxKey = key;
        }
      }

      //console.log(maxKey, lowestKey);
      //console.log(hashTopRight, hashBottomLeft);

      if (maxKey !== hashTopRight || lowestKey !== hashBottomLeft) {
        for (const key of keys) {
          if (key == null) continue;
          const pos = this.chunkHashMap.get(key).calculateMeshPosition();
          if (Vector3.Distance(currentPos, pos) > this.chunkDistance * this.chunkSize * this.chunkSize) {
            console.log("Removing: ", pos, Vector3.Distance(currentPos, pos), this.chunkDistance * this.chunkSize * this.chunkSize);

            this.rootMesh.removeChild(this.chunkHashMap.get(key).getMesh());
            this.chunkHashMap.get(key).dispose();
            this.chunkHashMap.delete(key);
          }
        }
        //   for (let i = currentPos.x - this.chunkDistance * this.chunkSize; i < currentPos.x + this.chunkDistance * this.chunkSize; i += this.chunkSize) {
        //     for (let j = currentPos.y - this.chunkDistance * this.chunkSize; j < currentPos.y + this.chunkDistance * this.chunkSize; j += this.chunkSize) {
        //       for (let k = currentPos.z - this.chunkDistance * this.chunkSize; k < currentPos.z + this.chunkDistance * this.chunkSize; k += this.chunkSize) {
        //         const vec = new Vector3(i, j, k);
        //         const currentHash = this.getChunkIndexHashForCoordinate(vec);
        //         if (!keys.includes(currentHash.toString())) {
        //           console.log("new chunk at ", currentHash);
        //           console.log("new chunk at ", keys);
        //           //this.hashesToLoad.push(currentHash);

        //           this.chunks[this.getChunkIndexHashForCoordinate(vec)] = new Chunk(this.getChunkCoordinate(vec), this.chunkSize);
        //           //this.chunks[this.getChunkIndexHashForCoordinate(vec)].fillChunk(new Block(BlockType.RED, false)); //TODO: Change chunk fill
        //           if (j > 1) this.chunks[this.getChunkIndexHashForCoordinate(vec)].fillChunk(new Block(BlockType.AIR, false)); //TODO: Change chunk fill
        //           else this.chunks[this.getChunkIndexHashForCoordinate(vec)].fillChunk(new Block(BlockType.RED, false)); //TODO: Change chunk fill
        //         }
        //       }
        //     }
        //   }
        // }
      }
    }
  }

  updateVisibilityList() {
    // TODO: Check if chunk is visible to camera and mark
    // Visible chunks in front of the camera
    const arrayKeys: any[] = this.chunkHashMap.getAllKeys();
    for (const key of arrayKeys) {
      if (key == null) continue;
      this.chunkHashMap.get(key).isChunkVisible(this.camera);
    }
  }

  updateRenderList() {
    // TODO: add / remove mesh list in scene
    // Chunks in front of the camera
    //this.scene.removeMesh(this.rootMesh, true);

    //this.rootMesh.dispose(false);

    //this.rootMesh = new Mesh("Chunks");

    const arrayKeys: any[] = this.chunkHashMap.getAllKeys();
    for (const key of arrayKeys) {
      if (key == null) continue;
      if (this.chunkHashMap.get(key).getIsVisible()) {
        this.rootMesh.addChild(this.chunkHashMap.get(key).getMesh());
      } else {
        this.rootMesh.removeChild(this.chunkHashMap.get(key).getMesh());
      }
    }
    //this.scene.addMesh(this.rootMesh);
  }
}
