import { Camera, Mesh, Quaternion, Scene, Vector3, VertexBuffer } from "@babylonjs/core";
import { Block } from "../Block/Block";
import { BlockType } from "../Block/BlockType";
import { Chunk } from "../Chunk/Chunk";
import { GreedyMesher } from "../GreedyTry";
import { Mesher } from "../Mesher";

export class ChunkHandler {
  private chunkSize: number = 16;
  private chunkDistance: number = 1;
  private scene: Scene;
  private camera: Camera;
  private rootMesh: Mesh;
  private previousCameraPosition: Vector3;
  private previousCameraRotation: Quaternion;

  private mesher: Mesher;

  private chunks: Chunk[];
  private hashesToLoad: number[];
  private hashesToRemove: number[];

  constructor(scene: Scene, camera: Camera) {
    this.scene = scene;
    this.camera = camera;
    this.rootMesh = new Mesh("Chunks");
    this.mesher = new GreedyMesher();

    const amountToLoad = 10 * 10 * 10;
    this.chunks = [];
    if (this.chunks.length < amountToLoad) {
      //load new
      const currentPos: Vector3 = this.camera.position;
      for (let i = currentPos.x - this.chunkDistance * this.chunkSize; i < currentPos.x + this.chunkDistance * this.chunkSize; i += this.chunkSize) {
        for (let j = currentPos.y - this.chunkDistance * this.chunkSize; j < currentPos.y + this.chunkDistance * this.chunkSize; j += this.chunkSize) {
          for (let k = currentPos.z - this.chunkDistance * this.chunkSize; k < currentPos.z + this.chunkDistance * this.chunkSize; k += this.chunkSize) {
            const vec = new Vector3(i, j, k);
            console.log(vec);
            console.log(this.getChunkCoordinate(vec));
            //this.hashesToLoad.push(this.getChunkIndexHashForCoordinate(vec));
            this.chunks[this.getChunkIndexHashForCoordinate(vec)] = new Chunk(this.getChunkCoordinate(vec), this.chunkSize);
            this.chunks[this.getChunkIndexHashForCoordinate(vec)].fillChunk(new Block(BlockType.RED, false)); //TODO: Change chunk fill
          }
        }
      }
    }
    this.update();

    const keys: any[] = Object.keys(this.chunks);
  }

  update() {
    this.runChunkMesher();
    this.updateLoadList();
    this.updateSetupList();
    this.updateRebuildList();
    this.updateFlagsList();
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

    const arrayKeys: any[] = Object.keys(this.chunks);
    for (const key of arrayKeys) {
      if (this.chunks[key].getMarkedForMeshing()) {
        this.chunks[key].UpdateMesh(this.mesher);
      }
    }
  }

  updateLoadList() {
    // TODO: Check if new chunks need to be loaded to memory
    // Loaded chunks x arround camera position
    // Check if we neeed to load chunks
    // if yes populate a list of chunks here

    if (this.camera.position !== this.previousCameraPosition) {
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

      const keys: any[] = Object.keys(this.chunks);
      let lowestKey: number = keys[0];
      let maxKey: number = keys[0];
      for (const key of keys) {
        if (key < lowestKey) {
          lowestKey = key;
        }
        if (key > maxKey) {
          maxKey = key;
        }
      }

      if (maxKey !== hashTopRight || lowestKey !== hashBottomLeft) {
        for (let i = currentPos.x - this.chunkDistance * this.chunkSize; i < currentPos.x + this.chunkDistance * this.chunkSize; i += this.chunkSize) {
          for (let j = currentPos.y - this.chunkDistance * this.chunkSize; j < currentPos.y + this.chunkDistance * this.chunkSize; j += this.chunkSize) {
            for (let k = currentPos.z - this.chunkDistance * this.chunkSize; k < currentPos.z + this.chunkDistance * this.chunkSize; k += this.chunkSize) {
              const vec = new Vector3(i, j, k);
              const currentHash = this.getChunkIndexHashForCoordinate(vec);
              if (!keys.includes(currentHash)) {
                //this.hashesToLoad.push(currentHash);

                this.chunks[this.getChunkIndexHashForCoordinate(vec)] = new Chunk(this.getChunkCoordinate(vec), this.chunkSize);
                this.chunks[this.getChunkIndexHashForCoordinate(vec)].fillChunk(new Block(BlockType.RED, false)); //TODO: Change chunk fill
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
  }

  updateVisibilityList() {
    // TODO: Check if chunk is visible to camera and mark
    // Visible chunks in front of the camera
    const arrayKeys: any[] = Object.keys(this.chunks);
    for (const key of arrayKeys) {
      this.chunks[key].isChunkVisible(this.camera);
    }
  }

  updateRenderList() {
    // TODO: add / remove mesh list in scene
    // Chunks in front of the camera
    this.scene.removeMesh(this.rootMesh, true);
    this.rootMesh.dispose(true);

    const arrayKeys: any[] = Object.keys(this.chunks);
    for (const key of arrayKeys) {
      if (this.chunks[key].getIsVisible()) {
        this.rootMesh.addChild(this.chunks[key].getMesh());
      }
    }
    this.scene.addMesh(this.rootMesh);
  }
}
