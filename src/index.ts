import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { Engine } from "@babylonjs/core/Engines/engine";

import { SampleMaterial } from "./Materials/SampleMaterial";

const canvas: HTMLCanvasElement = document.getElementById("view") as HTMLCanvasElement;

const engine: Engine = new Engine(canvas);

const scene: any = new Scene(engine);

const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 3.2, 2, Vector3.Zero(), scene);

camera.attachControl(canvas);

const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

const mesh = MeshBuilder.CreateGround("mesh", {}, scene);

const material = new SampleMaterial("material", scene);
mesh.material = material;

engine.runRenderLoop(() => {
  scene.render(true, true);
});
