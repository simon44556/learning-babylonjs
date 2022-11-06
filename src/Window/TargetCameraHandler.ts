import { ArcRotateCamera, FlyCamera, FreeCamera, Scene, TargetCamera, Vector3 } from "@babylonjs/core";
import { Canvas } from "./Canvas";

export class TargetCameraHandler {
  private _scene: Scene;
  private _camera: TargetCamera;

  constructor(scene: Scene) {
    this._scene = scene;
  }

  buildArcCamera(name: string, alpha: number, beta: number, radius: number, target: Vector3) {
    this._camera = new ArcRotateCamera(name, alpha, beta, radius, target, this._scene);

    if (!this._camera) {
      throw new Error("Error creating a camera");
    }

    return this._camera;
  }

  buildFlyCamera(name: string, position: Vector3) {
    this._camera = new FlyCamera(name, position, this._scene);

    if (!this._camera) {
      throw new Error("Error creating a camera");
    }

    return this._camera;
  }

  buildFreeCamera(name: string, position: Vector3) {
    this._camera = new FreeCamera(name, position, this._scene);

    if (!this._camera) {
      throw new Error("Error creating a camera");
    }

    return this._camera;
  }

  attachControls(canvas: Canvas) {
    if (!this._camera) {
      throw new Error("Attaching controls");
    }

    this._camera.attachControl(canvas.getCanvas());
  }
}
