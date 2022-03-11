import compileShader from "./compileShader";
import frag from "./update.frag";
import vert from "./update.vert";

export default function (gl: WebGLRenderingContext) {
  return compileShader(gl, frag, vert);
}
