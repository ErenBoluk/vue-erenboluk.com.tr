import { test } from 'node:test'
import assert from 'node:assert/strict'
import { videoPlacement } from '../../src/utils/asciiVideo.js'
test('video fit and position preserve cover crop and contain letterboxing',()=>{
 assert.deepEqual(videoPlacement(200,100,100,100,'cover','right center'),{x:-100,y:0,width:200,height:100})
 assert.deepEqual(videoPlacement(200,100,100,100,'contain','center bottom'),{x:0,y:50,width:100,height:50})
 assert.deepEqual(videoPlacement(200,100,100,100,'fill','center'),{x:0,y:0,width:100,height:100})
 assert.deepEqual(videoPlacement(200,100,100,100,'none','-10px 25%'),{x:-10,y:0,width:200,height:100})
})
