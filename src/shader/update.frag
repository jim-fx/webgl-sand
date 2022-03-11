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

float modI(float a,float b) {
    float m=a-floor((a+0.5)/b)*b;
    return floor(m+0.5);
}

void main() {

  float pixelWidth = 1.0 / dimension.x;
  float pixelHeight = 1.0 / dimension.y;

  vec2 pos = vPos;

  vec4 col = texture2D(tex, pos);

  bool isOnFloor = pos.y - pixelHeight <= 0.0;
  bool isTopRow = pos.y + pixelHeight*2.0 >= 1.0;

  if (length(col) == 0.0) {
    col = vec4(0.0, snoise2(pos+20.0*seed.y)/2.0+0.5, snoise2(pos+40.0*seed.z)/2.0+0.5, 1.0);
    float xScale = 2.0;
    float yScale = 20.0;
    col.r = 0.11+snoise2(vec2(pos.x*xScale+seed.x*xScale, pos.y*yScale+seed.y*yScale))/2.0+0.5;
  } else {

    float rng = random(pos);
    vec2  cap  =                vec2(pos.x,              pos.y + pixelHeight); 
    vec4  ca   = texture2D(tex, cap);
    vec4  car  = texture2D(tex, vec2(pos.x - pixelWidth, pos.y + pixelHeight));
    vec4  cal  = texture2D(tex, vec2(pos.x + pixelWidth, pos.y + pixelHeight));
    float rnga = random(cap);
 
    vec2  cbp  =                vec2(pos.x,              pos.y - pixelHeight);
    vec4  cb   = texture2D(tex, cbp);
    vec4  cbr  = texture2D(tex, vec2(pos.x - pixelWidth, pos.y - pixelHeight));
    vec4  cbl  = texture2D(tex, vec2(pos.x + pixelWidth, pos.y - pixelHeight));
    float rngb = random(cbp);


    float m = modI(pos.y*dimension.y, 2.001+random(pos));
    float t = modI(time*2000.0, 2.001);
    if(t > 0.1){
      m = 1.0 -m;
    }

    if(m > 0.0002){
     if (cb.r < 0.1) {
        col.r = 0.0;
      }else if(rng > 0.5){
        if (rnga > 0.5){
          if(cbl.r < 0.1){
            col.r = 0.0;
          }
        }else{
          if(cbr.r < 0.1){
            col.r = 0.0;
          }
        }
      }
    }else if(col.r < 0.1){
     if (ca.r > 0.1) {
        col.r = ca.r;
      }else {
        if(rngb > 0.5){
          if(cal.r > 0.1){
            col.r = cal.r;
          }
        }else{
          if(car.r > 0.1){
            col.r = car.r;
          }
        }
      }
    }

    if(isTopRow){
      col.r = 0.0;
    }else if(isOnFloor){
      col.r = ca.r;
    }

  }

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

  if(col.r < 0.2){
    col.r = 0.0;
  }else if(col.r < 0.4){
    col.r = 0.2;
  }else if(col.r < 0.6){
    col.r = 0.4;
  }else if(col.r < 0.8){
    col.r = 0.6;
  }else if(col.r < 1.0){
    col.r = 0.8;
  }else{
    col.r = 1.0;
  }


  gl_FragColor = col;
}
