precision highp float;

#pragma glslify: snoise2 = require("glsl-noise/simplex/2d")
#pragma glslify: snoise3 = require("glsl-noise/simplex/3d")

uniform vec4 color;
uniform vec2 dimension;
uniform float time;
uniform vec4 seed;
varying vec2 vPos;

uniform sampler2D tex;

float random(vec2 pos){
  return snoise3(vec3(pos.x*200.0, pos.y*200.0,time*20.0))/2.0+0.5;
}

const float leftRightChance = 0.5;

void main() {

  float pixelWidth = 1.0 / dimension.x;
  float pixelHeight = 1.0 / dimension.y;

  vec2 pos = vPos;

  vec4 col = texture2D(tex, pos);
  /* pos += vec2(snoise2(vec2(seed.x*100.0,seed.y*20.0))*20.0,snoise2(vec2(seed.z*20.0,seed.w*10.0))*20.0)/100000.0; */ 

  if(col.r < 0.1){
    col.r = 0.0;
  }

  bool  isOnFloor = pos.y - pixelHeight <= 0.0;
  bool  isTopRow = pos.y + pixelHeight >= 1.0;

  if (length(col) == 0.0) {
    float xScale = 20000.0;
    float yScale = 20000.0;
    float seedStrength = 200.0;
    float r = snoise2(vec2(pos.x*xScale+seed.x*xScale, pos.y*yScale+seed.y*yScale)) > 2.0 ? 1.0:0.0;
    /* r = 1.0; */
    col = vec4(r, snoise2(pos+200.0*seed.y)/2.0+0.5, snoise2(pos+400.0*seed.z)/2.0+0.5, 1.0);
  } else if(isTopRow == false){

    /* pos += snoise2(vec2(col.g,col.b)/10000.0)/10.0; */

    vec2  cap  =                vec2(pos.x,              pos.y + pixelHeight); 
    vec4  ca   = texture2D(tex, cap);
    vec4  car  = texture2D(tex, vec2(pos.x - pixelWidth, pos.y + pixelHeight));
    vec4  cal  = texture2D(tex, vec2(pos.x + pixelWidth, pos.y + pixelHeight));
    float rnga = random(cap);
 
    vec2  cbp  =                vec2(pos.x,              pos.y - pixelHeight*1.5);
    vec4  cb   = texture2D(tex, cbp);
    vec4  cbr  = texture2D(tex, vec2(pos.x - pixelWidth, pos.y - pixelHeight));
    vec4  cbl  = texture2D(tex, vec2(pos.x + pixelWidth, pos.y - pixelHeight));
    vec4  cbl2  = texture2D(tex, vec2(pos.x + pixelWidth, pos.y - pixelHeight*2.0));
    float rngb = random(cbp);

    float rng = random(pos);

    col.g = rng;
    

    // Unset if the pixel can move to
    // a new location
    if(col.r > 0.1){
      if (cb.r < 0.1) {
        col.r = 0.0;
      }else if(rng < leftRightChance){
        if (rngb > 0.5){
          if(cbl.r < 0.1){
            col.r = 0.0;
          }
        }else{
          if(cbr.r < 0.1){
            col.r = 0.0;
          }
        }
      }
    }

   
    

    // Set 
    else if(col.r < 0.1){
      if (ca.r > 0.1) {
        col.r = 1.0;
      }else if(rng < leftRightChance) {
        if(rnga > 0.5){
          if(cal.r > 0.1){
            col.r = 1.0;
          }
        }else{
          if(car.r > 0.1){
            col.r = 1.0;
          }
        }
      }
    }

   if(cbl2.r < 0.1){
      /* col.r = 0.0; */
    }


  }else{
    col.r = 0.0;
  }

  col.r = col.r > 0.1 ? 1.0:0.0;

  gl_FragColor = col;
}
