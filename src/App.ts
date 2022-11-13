import { Color3, Engine, Light, Mesh, MeshBuilder, Scene, TargetCamera, Vector3, VertexData } from "@babylonjs/core";
import "@babylonjs/inspector";

import { KeyboardEvents } from "./Input/KeyboardEvents";
import { LightBuilder } from "./Lighting/LightBuilder";
import { SampleMaterial } from "./Materials/SampleMaterial";
import { ChunkHandler } from "./Voxels/ChunkHandler/ChunkHandler";
import { GreedyMesher } from "./Voxels/GreedyTry";
import { MeshData } from "./Voxels/MeshData";
import { Voxel } from "./Voxels/Voxel";
import { Canvas } from "./Window/Canvas";
import { EngineBuilder } from "./Window/EngineBuilder";
import { TargetCameraHandler } from "./Window/TargetCameraHandler";

class App {
  private _canvasElement: string = "view";
  private _canvas: Canvas;
  private _engine: Engine;
  private _scene: Scene;
  private _camera: TargetCameraHandler;

  private _keyboardEvents: KeyboardEvents;

  private _lightBuilder: LightBuilder;

  private _chunkHandler: ChunkHandler;

  constructor() {
    this._canvas = new Canvas(this._canvasElement);
    this._engine = new EngineBuilder().setCanvas(this._canvas).setAntiAlias(true).build();
    this._scene = new Scene(this._engine);

    //Scene debug mode
    this._scene.debugLayer.show();

    this._lightBuilder = new LightBuilder(this._scene);
    this._camera = new TargetCameraHandler(this._scene).buildFreeCamera("cam", new Vector3(10, 5, -30)).attachControls(this._canvas);
    this._keyboardEvents = new KeyboardEvents(this._scene);

    this._chunkHandler = new ChunkHandler(this._scene, this._camera.getCamera());

    //TODO: Move this out of main
    this.addLight();
    //this.addBox();
    //this.addGround();

    this.renderLoop();
  }

  addLight() {
    const light: Light = this._lightBuilder.buildHemisphericLight("MainLight", new Vector3(0, 10, 10));
    light.diffuse = new Color3(0.01, 0.0, 0.5);
  }

  positionToIndex(pos: number[], dimensions: number[]) {
    return pos[0] + pos[1] * dimensions[0] + pos[2] * dimensions[0] * dimensions[1];
  }

  addBox() {
    const mesh: Mesh = MeshBuilder.CreateBox("MyBox", { size: 1 }, this._scene);
    //mesh.material = new SampleMaterial("otherMat", this._scene);
    mesh.isVisible = true;

    const meshArray: Mesh[] = [];

    const _x = 16,
      _y = 16,
      _z = 16;
    const voxel: Voxel = { voxels: [], dimensions: [_x, _y, _z] };

    for (let x = 0; x < _x; x++) {
      for (let y = 0; y < _y; y++) {
        for (let z = 0; z < _z; z++) {
          voxel.voxels.push(this.positionToIndex([x, y, z], voxel.dimensions));
        }
      }
    }

    const mesher: GreedyMesher = new GreedyMesher();
    //const data: MeshData = mesher.mesh(voxel.voxels, voxel.dimensions);

    const indices = [];
    const colors = [];

    // for (let i = 0; i < data.faces.length; ++i) {
    //   const q = data.faces[i];
    //   indices.push(q[2], q[1], q[0]);

    //   //Get the color for this voxel
    //   // var color = this.coloringFunction(q[3], q[4]);
    //   // if(color == null || color.length < 3) {
    //   // 	color = [300,75,300,255];
    //   // } else if (color.length === 3) {
    //   // 	color.push(255);
    //   // }

    //   // for(var i2 = 0; i2 < 3; i2++) {
    //   // 	colors[q[i2]*4] = color[0]/255;
    //   // 	colors[(q[i2]*4)+1] = color[1]/255;
    //   // 	colors[(q[i2]*4)+2] = color[2]/255;
    //   // 	colors[(q[i2]*4)+3] = color[3]/255;
    //   // 	continue;
    //   // }
    // }

    const vertexData: VertexData = new VertexData();
    //vertexData.positions = data.vertices;
    //vertexData.indices = indices;
    console.log(vertexData);
    //console.log(indices);
    //console.log(data);
    console.log(voxel);
    //mesh.material.wireframe = true;
    vertexData.applyToMesh(mesh);
  }

  addGround() {
    const material: SampleMaterial = new SampleMaterial("groundMat", this._scene);
    const ground: Mesh = MeshBuilder.CreateGround("ground", { width: 20, height: 20 }, this._scene);
    ground.material = material;
    ground.position.y = -4;
  }

  async renderLoop() {
    this._engine.runRenderLoop(() => {
      this._chunkHandler.update();
      this._scene.render();
    });
  }
}

const app = new App();
