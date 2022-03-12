precision highp float;

varying vec2 vPos;

uniform sampler2D tex;
uniform vec2 dimension;

const float rectSize = 2.0;

void main(){
  vec4 col = texture2D(tex, vPos);

  float pixelWidth = 1.0 / dimension.x;
  float pixelHeight = 1.0 / dimension.y;

  /* if(col.r < 0.1){ */
  /*   float sum = 0.0; */
  /*   float amount = 0.0; */
  /*   for(float x = 0.0; x < rectSize*2.0; x+=1.0){ */
  /*     for(float y = 0.0; y < rectSize*2.0; y+=1.0){ */
  /*       vec4 c = texture2D(tex, vec2(vPos.x-pixelWidth*(rectSize-x), vPos.y-pixelHeight*(rectSize-y))); */
  /*       amount += 1.0; */
  /*       sum += c.r; */ 
  /*     } */
  /*   } */
  /*   col.r = sum / amount; */
  /* } */

  if(col.r < 0.1){
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

  gl_FragColor = vec4(col.r,0.0,0.0,1.0);
}
