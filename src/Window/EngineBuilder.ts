import { Engine, EngineOptions } from "@babylonjs/core";
import { Canvas } from "./Canvas";

export class EngineBuilder {
  private _engine: Engine;
  private _canvas: Canvas;
  private _alias: boolean;
  private _options: EngineOptions;
  private _adaptToDeviceRation: boolean;

  constructor() {}

  setCanvas(canvas: Canvas): EngineBuilder {
    this._canvas = canvas;
    return this;
  }

  setAntiAlias(doAlias: boolean) {
    this._alias = doAlias;
    return this;
  }

  //TODO: Check options and make fluent builder.
  setOptions(options: EngineOptions) {
    this._options = options;
    return this;
  }

  setAdaptToDeviceRatio(adapt: boolean) {
    this._adaptToDeviceRation = adapt;
    return this;
  }

  build(): Engine {
    if (this._canvas == null) {
      throw new Error("Failed to build engine. Canvas is missing!");
    }

    this._engine = new Engine(this._canvas.getCanvas(), this._alias, this._options, this._adaptToDeviceRation);
    return this._engine;
  }
}
