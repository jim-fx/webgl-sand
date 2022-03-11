export default function (
  gl: WebGLRenderingContext,
  frag: string,
  vert: string
) {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  if (!vertexShader) throw new Error("Cant create Vertex Shader");
  gl.shaderSource(vertexShader, vert);
  gl.compileShader(vertexShader);

  // Check the compile status
  const compiledVertex = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
  if (!compiledVertex) {
    // Something went wrong during compilation; get the error
    console.error(gl.getShaderInfoLog(vertexShader));
  }

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  if (!fragmentShader) throw new Error("Cant create Vertex Shader");
  gl.shaderSource(fragmentShader, frag);
  gl.compileShader(fragmentShader);

  // Check the compile status
  const compiledFragment = gl.getShaderParameter(
    fragmentShader,
    gl.COMPILE_STATUS
  );
  if (!compiledFragment) {
    // Something went wrong during compilation; get the error
    console.error(gl.getShaderInfoLog(fragmentShader));
  }

  const program = gl.createProgram() as WebGLProgram;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  // Check the link status
  const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    // something went wrong with the link
    console.error(gl.getProgramInfoLog(program));
  }

  gl.useProgram(program);

  return program;
}
