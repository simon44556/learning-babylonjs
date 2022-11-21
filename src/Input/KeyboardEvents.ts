import { Scene } from "@babylonjs/core";
import { App } from "../App";
import { IKeyPressed } from "./IKeyPressed";

export class KeyboardEvents {
  private _scene: Scene;
  private _app: App;

  constructor(app: App) {
    this._scene = app.getScene();
    this._app = app;

    this.registerInspectorListener();
  }

  registerInspectorListener() {
    window.addEventListener("keydown", (ev) => {
      this._app.keyPressed(ev.key);

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
