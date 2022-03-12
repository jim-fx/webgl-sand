import "./style.css";

import createFramebuffer from "./createFramebuffer";
import createRenderProgram from "./shader/render";
import createUpdateProgram from "./shader/update";

const canvas = document.createElement("canvas");

const scale = 0.4;
const width = Math.floor(window.innerWidth * scale);
const height = Math.floor(window.innerHeight * scale);

canvas.width = width;
canvas.height = height;
document.body.append(canvas);

const gl = canvas.getContext("webgl") as WebGLRenderingContext;

gl.clearColor(0, 0, 0, 0.001);
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

const dimLocU = gl.getUniformLocation(updateProgram, "dimension");
gl.uniform2fv(dimLocU, [width, height]);

const timeLoc = gl.getUniformLocation(updateProgram, "time");
const alternateLoc = gl.getUniformLocation(updateProgram, "alternate");

const seedLoc = gl.getUniformLocation(updateProgram, "seed");
gl.uniform4f(
  seedLoc,
  Math.random(),
  Math.random(),
  Math.random(),
  Math.random()
);

let shouldReadTexture:
  | { x: number; y: number; singlePixel: boolean }
  | undefined = undefined;

function xyToIndex(x: number, y: number) {
  return x + width * y;
}

function indexToXY(index: number) {
  return [index % width, (index / width) % height];
}

function fastDistance([x1, y1, x2, y2]: [number, number, number, number]) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function readTexture() {
  if (!shouldReadTexture) return;
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
    var sTextureSize = width * height * 4; // r, g, b, a
    var pixels = new Uint8Array(sTextureSize);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    const { x: mx, y: my, singlePixel } = shouldReadTexture;

    let removePixels = pixels[xyToIndex(mx, my) * 4] > 1;

    const paintSize = Math.floor(width * 0.1);

    if (singlePixel) {
      pixels[xyToIndex(mx, my) * 4] = removePixels ? 0 : 255;
    } else {
      for (var i = 0; i < sTextureSize; i += 4) {
        const [x, y] = indexToXY(i / 4);
        const distance = fastDistance([x, y, mx, my]);
        if (false) {
          if (
            distance < Math.random() * paintSize ||
            distance < Math.random() * paintSize
          ) {
            // pixels[i] = pixels[i] || Math.random() > 0.99 ? 255 : 0; // set half alpha
            pixels[i] = removePixels ? 0 : 255; // set half alpha
          }
        } else {
          if (distance < paintSize) {
            pixels[i] = removePixels ? 0 : 255;
          }
        }
      }
    }

    // upload changes
    gl.bindTexture(gl.TEXTURE_2D, fbA.tex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      pixels
    );
  }

  shouldReadTexture = undefined;
}

function countPixels() {
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
    var sTextureSize = width * height * 4; // r, g, b, a
    var pixels = new Uint8Array(sTextureSize);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    let total = 0;
    for (var i = 0; i < sTextureSize; i += 4) {
      total += pixels[i] > 1 ? 1 : 0;
    }

    console.log(total);
  }
}

function swapBuffers() {
  const _a = fbA;
  fbA = fbB;
  fbB = _a;
}

let alternate = false;

function update(time: number) {
  alternate = !alternate;

  gl.useProgram(updateProgram);

  gl.uniform1f(alternateLoc, alternate ? 1 : 0);

  gl.bindFramebuffer(gl.FRAMEBUFFER, fbA.fb);
  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, fbB.tex);
  gl.uniform1f(timeLoc, time);
  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);

  if (shouldReadTexture) readTexture();
}

function draw() {
  // Activate the render program
  gl.useProgram(renderProgram);

  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, fbA.tex);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
}

let cancelRender = false;
function render(time: number) {
  update(time);
  swapBuffers();

  draw();

  countPixels();

  if (!cancelRender) {
    requestAnimationFrame(render);
  }
}

function pauseResume() {
  cancelRender = !cancelRender;
  if (cancelRender == false) {
    render(0);
  }
}
// setInterval(() => render(performance.now()), 500);

render(0);

window.addEventListener("click", ({ x, y, ctrlKey }) => {
  shouldReadTexture = {
    singlePixel: ctrlKey,
    x: Math.floor((x / window.innerWidth) * width),
    y: Math.floor((1 - y / window.innerHeight) * height),
  };

  setTimeout(() => {
    // cancelRender = true;
  }, 2000);

  //   shouldReadTexture = {
  //     x,
  //     y,
  //   };
});

window.addEventListener("keydown", ({ key }) => {
  if (key === " ") {
    pauseResume();
  }
});
