precision highp float;

#pragma glslify: snoise2 = require("glsl-noise/simplex/2d")
#pragma glslify: snoise3 = require("glsl-noise/simplex/3d")

uniform vec4 color;
uniform vec2 dimension;
varying vec2 vPos;

uniform sampler2D tex;

void main() {

  float pixelWidth = 1.0 / dimension.x;
  float pixelHeight = 1.0 / dimension.y;

  vec4 col = texture2D(tex, vPos);

  vec2 posPos = vPos * 7.0;
  if (length(col) == 0.0) {
    float r = snoise2(posPos*200.0) > 0.9 ? 1.0:0.0;
    col = vec4(r, snoise2(posPos+2000.0)/2.0+0.5, snoise2(posPos+4000.0)/2.0+0.5, 1.0);
  } else {

    vec4 cp = texture2D(tex, vPos);

    vec4 ca = texture2D(tex, vec2(vPos.x, vPos.y + pixelHeight));
    vec4 cbr = texture2D(tex, vec2(vPos.x - pixelWidth, vPos.y +pixelHeight));
    vec4 cbl = texture2D(tex, vec2(vPos.x + pixelWidth, vPos.y +pixelHeight));
    vec4 cb = texture2D(tex, vec2(vPos.x, vPos.y - pixelHeight));

    // Sample pixel below
    if (cb.r < 0.5) {
      col.r = 0.0;
    }

    // Sample Pixel Above
    if (ca.r > 0.5) {
      col.r = 1.0;
    }


    if(vPos.y - pixelHeight < 0.0){
      /* col.r = 0.0; */
    }

  }

  gl_FragColor = col;
}
