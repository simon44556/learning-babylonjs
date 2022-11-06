import { Scene } from "@babylonjs/core";

export class KeyboardEvents {
  private _scene: Scene;

  constructor(scene: Scene) {
    this._scene = scene;
    this.registerInspectorListener();
  }

  registerInspectorListener() {
    window.addEventListener("keydown", (ev) => {
      // Shift+Ctrl+Alt+I
      if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.code === "KeyI") {
        console.log(this._scene);
        console.log(this);
        if (this._scene.debugLayer.isVisible()) {
          this._scene.debugLayer.hide();
        } else {
          this._scene.debugLayer.show();
        }
      }
    });
  }
}
