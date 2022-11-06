import { Color3, Engine, Light, Mesh, MeshBuilder, Scene, TargetCamera, Vector3 } from "@babylonjs/core";
import "@babylonjs/inspector";

import { KeyboardEvents } from "./Input/KeyboardEvents";
import { LightBuilder } from "./Lighting/LightBuilder";
import { SampleMaterial } from "./Materials/SampleMaterial";
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

  constructor() {
    this._canvas = new Canvas(this._canvasElement);
    this._engine = new EngineBuilder().setCanvas(this._canvas).setAntiAlias(true).build();
    this._scene = new Scene(this._engine);

    //Scene debug mode
    this._scene.debugLayer.show();

    this._lightBuilder = new LightBuilder(this._scene);
    this._camera = new TargetCameraHandler(this._scene).buildArcCamera("cam", Math.PI / 2, Math.PI / 3, 10, new Vector3(0, 5, 10)).attachControls(this._canvas);
    this._keyboardEvents = new KeyboardEvents(this._scene);

    //TODO: Move this out of main
    this.addLight();
    this.addBox();
    this.addGround();

    this.renderLoop();
  }

  addLight() {
    const light: Light = this._lightBuilder.buildHemisphericLight("MainLight", new Vector3(0, 10, 10));
    light.diffuse = new Color3(0.01, 0.0, 0.5);
  }

  addBox() {
    const mesh: Mesh = MeshBuilder.CreateBox("MyBox", { size: 1 }, this._scene);
    mesh.material = new SampleMaterial("otherMat", this._scene);
    mesh.isVisible = false;

    const meshArray: Mesh[] = [];

    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        for (let z = 0; z < 5; z++) {
          meshArray.push(mesh.clone("anotherCube" + x + y + z));
          meshArray[meshArray.length - 1].isVisible = true;
          meshArray[meshArray.length - 1].position = new Vector3(x, y, z);
        }
      }
    }
  }

  addGround() {
    const material: SampleMaterial = new SampleMaterial("groundMat", this._scene);
    const ground: Mesh = MeshBuilder.CreateGround("ground", { width: 20, height: 20 }, this._scene);
    ground.material = material;
    ground.position.y = -4;
  }

  async renderLoop() {
    this._engine.runRenderLoop(() => {
      this._scene.render();
    });
  }
}

const app = new App();
