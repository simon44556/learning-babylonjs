import { Camera, Mesh, Quaternion, Scene, Vector3 } from "@babylonjs/core";
import { ChunkHashMap } from "../../utils/ChunkHashMap";
import { Block } from "../Block/Block";
import { BlockType } from "../Block/BlockType";
import { Chunk } from "../Chunk/Chunk";
import { GreedyMesher } from "../GreedyTry";
import { Mesher } from "../Mesher";

export class ChunkHandler {
  private chunkSize: number = 16;
  private chunkDistance: number = 5;
  private scene: Scene;
  private camera: Camera;
  private rootMesh: Mesh;
  private previousCameraPosition: Vector3;
  private previousCameraRotation: Quaternion;
  private previousCameraChunkPosition: Vector3;

  private mesher: Mesher;

  private chunkHashMap: ChunkHashMap;

  private loadListHashes: Uint32Array;
  private setupListHashes: Uint32Array;
  private rebuildListHashes: Uint32Array;
  private unloadListHashes: Uint32Array;
  private visibilityListHashes: Uint32Array;
  private renderListHashes: Uint32Array;

  private updateRuns: number;

  private pause: boolean = false;

  constructor(scene: Scene, camera: Camera) {
    this.scene = scene;
    this.camera = camera;
    this.rootMesh = new Mesh("Chunks");
    this.mesher = new GreedyMesher();

    this.chunkHashMap = new ChunkHashMap(512, 0.75, this.chunkSize);
    this.updateRuns = 0;

    this.update();
  }

  public togglePause() {
    this.pause = !this.pause;
  }

  update() {
    this.runChunkMesher();
    if (!this.pause || this.updateRuns < 1) {
      this.updateLoadList();
      this.updateSetupList();
      this.updateRebuildList();
      //this.updateFlagsList();
      this.updateUnloadList();
      this.updateVisibilityList();
    }

    if (!this.camera.position.equals(this.previousCameraPosition) && !this.camera.absoluteRotation.equals(this.previousCameraRotation)) {
      this.updateRenderList();

      //console.log(this.chunkHashMap.getAllKeys());
    }

    this.previousCameraPosition = this.camera.position.clone();
    this.previousCameraRotation = this.camera.absoluteRotation.clone();
    this.previousCameraChunkPosition = this.getChunkCoordinate(this.previousCameraPosition);
    this.updateRuns++;
    //Save old camera pos to new one
  }

  getChunkCoordinate(pos: Vector3): Vector3 {
    return pos
      .divide(new Vector3(this.chunkSize, this.chunkSize, this.chunkSize))
      .floor()
      .multiply(new Vector3(this.chunkSize, this.chunkSize, this.chunkSize));
  }
  getChunkIndexHashForCoordinate(pos: Vector3): number {
    const normalPos = this.getChunkCoordinate(pos);
    return (normalPos.x + this.chunkSize) * (normalPos.y + this.chunkSize * normalPos.z);
    /**
     * |0,0,0|0,1,0|0,2,0|
     * |1,0,0|1,0,1|1,0,2|
     */
  }

  async runChunkMesher() {
    // TODO: Mesh certain amount of chunks per tick dependand on time

    for (const key of this.chunkHashMap.getAllKeys()) {
      if (key == null) continue;
      if (this.chunkHashMap.get(key)?.getMarkedForMeshing()) {
        this.chunkHashMap.get(key)?.UpdateMesh(this.mesher);
      }
    }
  }

  updateLoadList() {
    // TODO: Check if new chunks need to be loaded to memory
    // Loaded chunks x arround camera position
    // Check if we neeed to load chunks
    // if yes populate a list of chunks here
    const currentPos: Vector3 = this.camera.position.floor();

    if (!this.getChunkCoordinate(currentPos).equals(this.previousCameraChunkPosition)) {
      //calculate chunks that should be loaded

      const posToChunk: Vector3 = this.getChunkCoordinate(currentPos);

      console.log("Pos To Chunk", posToChunk, currentPos);

      const topRight: Vector3 = posToChunk.add(
        new Vector3(this.chunkDistance * this.chunkSize, this.chunkDistance * this.chunkSize, this.chunkDistance * this.chunkSize)
      );
      const bottomLeft: Vector3 = posToChunk.add(
        new Vector3(-this.chunkDistance * this.chunkSize, -this.chunkDistance * this.chunkSize, -this.chunkDistance * this.chunkSize)
      );

      const hashTopRight: Vector3 = this.getChunkCoordinate(topRight);
      const hashBottomLeft: Vector3 = this.getChunkCoordinate(bottomLeft);

      const keys: Vector3[] = this.chunkHashMap.getAllKeys();

      if (!keys.includes(hashTopRight) || !keys.includes(hashBottomLeft)) {
        for (let i = posToChunk.x - this.chunkDistance * this.chunkSize; i < posToChunk.x + this.chunkDistance * this.chunkSize; i += this.chunkSize) {
          for (let j = posToChunk.y - this.chunkDistance * this.chunkSize; j < posToChunk.y + this.chunkDistance * this.chunkSize; j += this.chunkSize) {
            for (let k = posToChunk.z - this.chunkDistance * this.chunkSize; k < posToChunk.z + this.chunkDistance * this.chunkSize; k += this.chunkSize) {
              const vec = new Vector3(i, j, k);
              if (!this.chunkHashMap.has(vec)) {
                //console.log("New chunk at:", vec), Vector3.Distance(currentPos, vec);

                const chunk = new Chunk(vec, this.chunkSize);
                if (j > -1) chunk.fillChunk(new Block(BlockType.AIR, false)); //TODO: Change chunk fill
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

    const currentPos: Vector3 = this.camera.position.floor();

    if (!this.getChunkCoordinate(currentPos).equals(this.previousCameraChunkPosition)) {
      //calculate chunks that should be loaded

      const posToChunk: Vector3 = this.getChunkCoordinate(currentPos);
      //calculate chunks that should be loaded

      const topRight: Vector3 = posToChunk.add(
        new Vector3(this.chunkDistance * this.chunkSize, this.chunkDistance * this.chunkSize, this.chunkDistance * this.chunkSize)
      );
      const bottomLeft: Vector3 = posToChunk.add(
        new Vector3(-this.chunkDistance * this.chunkSize, -this.chunkDistance * this.chunkSize, -this.chunkDistance * this.chunkSize)
      );

      const hashTopRight: Vector3 = this.getChunkCoordinate(topRight);
      const hashBottomLeft: Vector3 = this.getChunkCoordinate(bottomLeft);

      const keys: Vector3[] = this.chunkHashMap.getAllKeys();

      if (!keys.includes(hashTopRight) || !keys.includes(hashBottomLeft)) {
        for (const key of keys) {
          if (key == null) continue;
          const pos = this.chunkHashMap.get(key)?.calculateMeshPosition();
          const distance = this.chunkDistance * this.chunkSize + 2 * this.chunkSize * this.chunkDistance;
          if (pos && Vector3.Distance(currentPos, key) > distance) {
            //console.log("removing at:", key, Vector3.Distance(currentPos, key), distance);

            const currentMesh = this.chunkHashMap.get(key)?.getMesh();
            if (currentMesh != null) this.rootMesh.removeChild(currentMesh);
            this.chunkHashMap.get(key)?.dispose();
            this.chunkHashMap.delete(key);
          }
        }
      }
    }
  }

  updateVisibilityList() {
    // TODO: Check if chunk is visible to camera and mark
    // Visible chunks in front of the camera
    const arrayKeys: any[] = this.chunkHashMap.getAllKeys();
    for (const key of arrayKeys) {
      if (key == null) continue;
      this.chunkHashMap.get(key)?.isChunkVisible(this.camera);
    }
  }

  updateRenderList() {
    // TODO: add / remove mesh list in scene
    // Chunks in front of the camera
    //this.scene.removeMesh(this.rootMesh, true);
    //this.rootMesh.dispose(false);
    //this.rootMesh = new Mesh("Chunks");
    /*const arrayKeys: any[] = this.chunkHashMap.getAllKeys();
    for (const key of arrayKeys) {
      if (key == null) continue;
      const currenntChunk = this.chunkHashMap.get(key);
      if (currenntChunk == null) {
        return;
      }
      const mesh = currenntChunk.getMesh();
      if (mesh == null) return;
      if (currenntChunk.getIsVisible()) {
        this.rootMesh.addChild(mesh);
      }
    }*/
    // this.scene.meshes.forEach((mesh) => {
    //   if (mesh.name.includes("Chunk_")) {
    //     setTimeout(() => {
    //       mesh.dispose();
    //     });
    //   }
    // });
    //this.scene.addMesh(this.rootMesh);
  }
}
