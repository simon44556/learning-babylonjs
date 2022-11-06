import { Engine, Light, Mesh, MeshBuilder, Scene, TargetCamera, Vector3 } from "@babylonjs/core";
import "@babylonjs/inspector";

import { KeyboardEvents } from "./Input/KeyboardEvents";
import { LightBuilder } from "./Lighting/LightBuilder";
import { Canvas } from "./Window/Canvas";
import { EngineBuilder } from "./Window/EngineBuilder";
import { TargetCameraHandler } from "./Window/TargetCameraHandler";

class App {
  private _canvasElement: string = "view";
  private _canvas: Canvas;
  private _engine: Engine;
  private _scene: Scene;
  private _camera: TargetCamera;

  private _keyboardEvents: KeyboardEvents;

  private _lightBuilder: LightBuilder;

  constructor() {
    this._canvas = new Canvas(this._canvasElement);
    this._engine = new EngineBuilder().setCanvas(this._canvas).setAntiAlias(true).build();
    this._scene = new Scene(this._engine);

    //Scene debug mode
    this._scene.debugLayer.show();

    this._lightBuilder = new LightBuilder(this._scene);

    const light: Light = this._lightBuilder.buildHemisphericLight("MainLight", new Vector3(1, 20, 10));

    const mesh: Mesh = MeshBuilder.CreateBox("MyBox", { size: 5 }, this._scene);

    this._camera = new TargetCameraHandler(this._scene).buildArcCamera("cam", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero());
    this._camera.attachControl(this._canvas.getCanvas());

    this._keyboardEvents = new KeyboardEvents(this._scene);

    this.renderLoop();
  }

  async renderLoop() {
    this._engine.runRenderLoop(() => {
      this._scene.render();
    });
  }
}

const app = new App();
