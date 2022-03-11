import compileShader from "./compileShader";
import frag from "./render.frag";
import vert from "./update.vert";

export default function (gl: WebGLRenderingContext) {
  return compileShader(gl, frag, vert);
}
