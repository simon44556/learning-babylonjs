export class Canvas {
  // TODO: Support other canvas types
  private _canvas: HTMLCanvasElement;

  constructor(elementId: string) {
    this._canvas = document.getElementById(elementId) as HTMLCanvasElement;

    if (!this._canvas) {
      throw new Error("Failed to initialize canvas!");
    }
  }

  getCanvas(): HTMLCanvasElement {
    return this._canvas;
  }
}
