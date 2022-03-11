import "./style.css";

import createUpdateProgram from "./shader/update";
import createRenderProgram from "./shader/render";
import createFramebuffer from "./createFramebuffer";

const canvas = document.createElement("canvas");

const width = window.innerWidth / 5;
const height = window.innerHeight / 5;

canvas.width = width;
canvas.height = height;
document.body.append(canvas);

const gl = canvas.getContext("webgl") as WebGLRenderingContext;

gl.clearColor(1, 0, 1, 1);
gl.clear(gl.COLOR_BUFFER_BIT);

const renderProgram = createRenderProgram(gl);

const dimLocR = gl.getUniformLocation(renderProgram, "dimension");
gl.uniform2fv(dimLocR, [width, height]);

const updateProgram = createUpdateProgram(gl);

const vertices = new Float32Array([-1, -1, -1, 1, 1, 1, -1, -1, 1, -1, 1, 1]);

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// Create and bind the framebuffer
let fbA = createFramebuffer(gl, width, height);
let fbB = createFramebuffer(gl, width, height);

const positionLocU = gl.getAttribLocation(updateProgram, "position");
gl.enableVertexAttribArray(positionLocU);
gl.vertexAttribPointer(positionLocU, 2, gl.FLOAT, false, 0, 0);

const positionLocR = gl.getAttribLocation(updateProgram, "position");
gl.enableVertexAttribArray(positionLocR);
gl.vertexAttribPointer(positionLocR, 2, gl.FLOAT, false, 0, 0);

const texLocU = gl.getUniformLocation(updateProgram, "tex");
const texLocR = gl.getUniformLocation(renderProgram, "tex");

const dimLocU = gl.getUniformLocation(updateProgram, "dimension");
gl.uniform2fv(dimLocU, [width, height]);

function render() {
  gl.useProgram(updateProgram);

  gl.bindFramebuffer(gl.FRAMEBUFFER, fbA.fb);
  gl.uniform1i(texLocU, 0);
  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, fbB.tex);

  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);

  // Activate the render program
  gl.useProgram(renderProgram);

  gl.uniform1i(texLocR, 0);
  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, fbA.tex);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);

  const _a = fbA;
  fbA = fbB;
  fbB = _a;
  requestAnimationFrame(render);
}
// setInterval(render, 50);

render();
