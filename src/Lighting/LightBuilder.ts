import { DirectionalLight, HemisphericLight, PointLight, Scene, SpotLight, Vector3 } from "@babylonjs/core";

export class LightBuilder {
  private _scene: Scene;

  constructor(scene: Scene) {
    this._scene = scene;
  }

  buildHemisphericLight(name: string, position: Vector3): HemisphericLight {
    return new HemisphericLight(name, position, this._scene);
  }

  buildDirectionalLight(name: string, direction: Vector3): DirectionalLight {
    return new DirectionalLight(name, direction, this._scene);
  }

  buildPointLight(name: string, position: Vector3): PointLight {
    return new PointLight(name, position, this._scene);
  }

  buildSpotLight(name: string, position: Vector3, direction: Vector3, angle: number, exponent: number): SpotLight {
    return new SpotLight(name, position, direction, angle, exponent, this._scene);
  }
}
