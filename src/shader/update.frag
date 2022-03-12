precision highp float;

#pragma glslify: snoise2 = require("glsl-noise/simplex/2d")
#pragma glslify: snoise3 = require("glsl-noise/simplex/3d")

uniform vec2 dimension;
uniform float time;
uniform float alternate;
uniform vec4 seed;
varying vec2 vPos;

uniform sampler2D tex;

float random(vec2 pos){
  return snoise3(vec3(pos.x*200.0, pos.y*200.0,time*20.0))/2.0+0.5;
}

float noise(vec2 pos){
  return snoise2(vec2(pos.x*10.0, pos.y*20.0))/2.0+0.5*snoise2(vec2(pos.x*40.0, pos.y*80.0))/2.0+0.5* snoise2(vec2(pos.x*80.0, pos.y*160.0))/2.0+0.5;
}

float noiser(vec2 pos){
  return noise(pos+vec2(noise(pos),noise(pos+10.0))/100.0);
}
float noiserr(vec2 pos){
  return noiser(pos)*noise(pos);
}

float modI(float a,float b) {
    float m = a-floor((a+0.5)/b)*b;
    return floor(m+0.5);
}

const float trsh = 0.05;

float sample(float x, float y){
  float pixelWidth = 1.0 / dimension.x;
  float pixelHeight = 1.0 / dimension.y;

  if(vPos.x - x * 2.0 * pixelWidth < 0.0 || vPos.x + x * 2.0 * pixelWidth > 1.0){
    return -1.0;
  }

  if(vPos.y - y * 2.0 * pixelHeight < 0.0 || vPos.y + y * 2.0 * pixelHeight > 1.0){
    return -1.0;
  }

  return texture2D(tex, vPos - vec2(x*pixelWidth,y*pixelHeight)).r;

}

void main() {

  vec2 pos = vPos;

  vec4 col = texture2D(tex, pos);
  float r = sample(0.0,0.0);

  if (col.a == 0.0) {
    float xScale = 2.0;
    float yScale = 20.0;
    col = vec4(r, noiserr(pos/5.0+seed.y), random(pos+seed.z), 1.0);
    r = 0.2+snoise2(vec2(pos.x*xScale+seed.x*xScale, pos.y*yScale+seed.y*yScale))/2.0+0.5;
    if(pos.y > 0.5){
      r = 0.0;
    }
  } else {

    float rng  = random(pos);
    float ca   = sample( 0.0, -1.0);
    float car  = sample( 1.0, -1.0);
    float cal  = sample(-1.0, -1.0);
    float rnga = random(vec2(0.0, -1.0));
 
    float  cb   = sample( 0.0, 1.0);
    float  cbr  = sample( 1.0, 1.0);
    float  cbl  = sample(-1.0, 1.0);
    float rngb  = random(vec2(0.0, 1.0));

    float m = modI(pos.y*dimension.y+pos.x*dimension.x+time,2.0001) ;
    float t = modI(time*10000.0, 2.001);
    if(alternate > 0.5){
      m = 1.0 - m;
    }

    if(m > 0.1){
      if (cb < trsh && cb > -0.2) {
        r = 0.0;
      }else {
        if(cbr < 0.1 && cbr > -0.2){
          r = 0.0;
        }else if(cbl < trsh && cbl > -0.2){
          r = 0.0;
        }
      }
    }else{
      if(r < trsh){
        if (ca > trsh && ca > -0.5) {
          r = ca;
        }else{
          if(cal > trsh && cal > -0.2){
            r = cal;
          }else if (car > trsh && cal > -0.2){
            r = car;
          }
        }
      }
    }

  }


  col.r = r;

  gl_FragColor = col;
}
