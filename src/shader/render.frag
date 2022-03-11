precision highp float;

#pragma glslify: snoise2 = require("glsl-noise/simplex/2d")

varying vec2 vPos;

uniform sampler2D tex;
uniform vec2 dimension;

void main(){
  vec4 col = texture2D(tex, vPos);

  float pixelWidth = 1.0 / dimension.x;
  float pixelHeight = 1.0 / dimension.y;

 if(col.r < 0.1){
    float sum = 0.0;
    for(int x = -1; x < 1; x++){
      for(int y = -1; y < 1; y++){
        if(x+y != 0){

        float fx = float(x);
        float fy = float(y);
        vec4 c = texture2D(tex, vec2(vPos.x+pixelWidth*fx, vPos.y+pixelHeight*fy));
        sum += c.r;
        }
      }
    }
    if(sum > 0.1){
      col.r = sum / 8.0;
    }
  }

  gl_FragColor = vec4(col.r,0.0,0.0,1.0);
}
