"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SampleMaterial = void 0;
const shaderMaterial_1 = require("@babylonjs/core/Materials/shaderMaterial");
const effect_1 = require("@babylonjs/core/Materials/effect");
const sampleVertexShader = require("./Shaders/Sample/sample.vertex.glsl");
const sampleFragmentShader = require("./Shaders/Sample/sample.fragment.glsl");
effect_1.Effect.ShadersStore["sampleVertexShader"] = sampleVertexShader;
effect_1.Effect.ShadersStore["sampleFragmentShader"] = sampleFragmentShader;
class SampleMaterial extends shaderMaterial_1.ShaderMaterial {
    constructor(name, scene) {
        super(name, scene, { vertex: "sample", fragment: "sample" }, {
            uniforms: ["worldViewProjection", "time"],
            attributes: ["position", "normal", "uv"],
        });
        const startTime = Date.now();
        scene.registerBeforeRender(() => {
            const currentTime = Date.now();
            const time = currentTime - startTime;
            this.time = time / 1000;
        });
    }
    set time(value) {
        this.setFloat("time", value);
    }
}
exports.SampleMaterial = SampleMaterial;
//# sourceMappingURL=SampleMaterial.js.map