"use strict";

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var eye;
const at = vec3( 0.0, 0.0, 0.0 );
const up = vec3( 0.0, 1.0, 0.0 );

var radius = 40.0;
var theta_p = 0.25;
var phi = 69.7;
var dr = 5.0 * Math.PI / 180.0;

var fovy = 60.0;
var aspect = 1;
var near = 3;
var far = 90;

var vertices = [
	vec4( -0.5, -0.5,  0.5, 1.0 ),
	vec4( -0.5,  0.5,  0.5, 1.0 ),
	vec4( 0.5,  0.5,  0.5, 1.0 ),
	vec4( 0.5, -0.5,  0.5, 1.0 ),
	vec4( -0.5, -0.5, -0.5, 1.0 ),
	vec4( -0.5,  0.5, -0.5, 1.0 ),
	vec4( 0.5,  0.5, -0.5, 1.0 ),
	vec4( 0.5, -0.5, -0.5, 1.0 )
];

var texCoord = [
	vec2(0, 0),
	vec2(0, 1),
	vec2(1, 1),
	vec2(1, 0)
];

var torsoId = 0;
var torso1Id = 1
var headId  = 2;
var head1Id = 2;
var head2Id = 11;
var leftUpperArmId = 3;
var leftLowerArmId = 4;
var rightUpperArmId = 5;
var rightLowerArmId = 6;
var leftUpperLegId = 7;
var leftLowerLegId = 8;
var rightUpperLegId = 9;
var rightLowerLegId = 10;
var tailId = 12;
var trunkId = 13;
var leavesId = 14;
var floorId = 15;

var position_x = -10;
var position_y = 0;
var position_z = 0;
var head_y_step = 0;
var head_z_step = 0.5;

var torsoHeight = 8.0/3;
var torsoWidth = 4.0/3;
var upperArmHeight = 3.0/3;
var lowerArmHeight = 2.0/3;
var upperArmWidth  = 1.5/3;
var lowerArmWidth  = 1.2/3;
var upperLegWidth  = 1.5/3;
var lowerLegWidth  = 1.1/3;
var lowerLegHeight = 2.0/3;
var upperLegHeight = 3.0/3;
var headHeight = 2.0/3;
var headWidth = 3.0/3;
var tailHeigh = 0.5/3;
var tailWidth = 1/3;
var trunkHeight = 18/3;
var trunkWidth = 4.5/3;
var leavesHeight = 15/3;
var leavesWidth = 20/3;
var floorHeight = 3/3;
var floorWidth = 90/3;

var numNodes = 16;
var numAngles = 11;
var angle = 0;

var theta = [90, 90, 70, 110, -15, 60, 15, 110, -15, 60, 15, 0, 60, 0, 0, 0];

var numVertices = 24;

var stack = [];

var figure = [];

for(var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];
var texCoordsArray = [];

//-------------------------------------------
function scale4(a, b, c) {
    var result = mat4();
    result[0] = a;
    result[5] = b;
    result[10] = c;
    return result;
}
//-------------------------------------------

function createNode(transform, render, sibling, child){
	var node = {
	transform: transform,
	render: render,
	sibling: sibling,
	child: child,
	}
	return node;
}

function initNodes(Id) {
	var m = mat4();

	switch(Id) {

		case torsoId:
		m = translate(position_x, position_y, position_z)
		m = mult(m, rotate(theta[torsoId], vec3(0, 1, 0)));
		m = mult(m, rotate(theta[torso1Id], vec3(1, 0, 0)));
		figure[torsoId] = createNode( m, torso, null, headId );
		break;

		case headId:
		case head1Id:
		case head2Id:
		m = translate(0.0, torsoHeight+2*headHeight-head_y_step, head_z_step);
		m = mult(m, rotate(theta[head1Id], vec3(1, 0, 0)));
		m = mult(m, rotate(theta[head2Id], vec3(0, 1, 0)));
		m = mult(m, translate(0.0, -1.2*headHeight, -0.90));
		figure[headId] = createNode( m, head, leftUpperArmId, null);
		break;

		case leftUpperArmId:
		m = translate(-(torsoWidth-1.1+upperArmWidth), 0.9*torsoHeight, 0.0);
		m = mult(m, rotate(theta[leftUpperArmId], vec3(1, 0, 0)));
		figure[leftUpperArmId] = createNode( m, leftUpperArm, rightUpperArmId, leftLowerArmId );
		break;

		case rightUpperArmId:
		m = translate(torsoWidth-1.1+upperArmWidth, 0.9*torsoHeight, 0.0);
		m = mult(m, rotate(theta[rightUpperArmId], vec3(1, 0, 0)));
		figure[rightUpperArmId] = createNode( m, rightUpperArm, leftUpperLegId, rightLowerArmId );
		break;

		case leftUpperLegId:
		m = translate(-(torsoWidth-1.1+upperLegWidth), 0.2*upperLegHeight, 0.0);
		m = mult(m , rotate(theta[leftUpperLegId], vec3(1, 0, 0)));
		figure[leftUpperLegId] = createNode( m, leftUpperLeg, rightUpperLegId, leftLowerLegId );
		break;

		case rightUpperLegId:
		m = translate(torsoWidth-1.1+upperLegWidth, 0.2*upperLegHeight, 0.0);
		m = mult(m, rotate(theta[rightUpperLegId], vec3(1, 0, 0)));
		figure[rightUpperLegId] = createNode( m, rightUpperLeg, tailId, rightLowerLegId );
		break;

		case tailId:
		m = translate(0, -(torsoHeight-2.7+tailHeigh), 0.5);
		m = mult(m, rotate(theta[tailId], vec3(1, 0, 0)));
		figure[tailId] = createNode(m, tail, null, null);
		break;

		case leftLowerArmId:
		m = translate(0.0, upperArmHeight, 0.0);
		m = mult(m, rotate(theta[leftLowerArmId], vec3(1, 0, 0)));
		figure[leftLowerArmId] = createNode( m, leftLowerArm, null, null );
		break;

		case rightLowerArmId:
		m = translate(0.0, upperArmHeight, 0.0);
		m = mult(m, rotate(theta[rightLowerArmId], vec3(1, 0, 0)));
		figure[rightLowerArmId] = createNode( m, rightLowerArm, null, null );
		break;

		case leftLowerLegId:
		m = translate(0.0, upperLegHeight, 0.0);
		m = mult(m, rotate(theta[leftLowerLegId],vec3(1, 0, 0)));
		figure[leftLowerLegId] = createNode( m, leftLowerLeg, null, null );
		break;

		case rightLowerLegId:
		m = translate(0.0, upperLegHeight, 0.0);
		m = mult(m, rotate(theta[rightLowerLegId], vec3(1, 0, 0)));
		figure[rightLowerLegId] = createNode( m, rightLowerLeg, null, null );
		break;

		case trunkId:
		m = translate(2.0, -2.0, 0.0)
		m = mult(m, rotate(theta[trunkId], vec3(0, 1, 0)));
		figure[trunkId] = createNode( m, trunk, null, leavesId);
		break;
		
		case leavesId:
		m = translate(0.0, trunkHeight+0.01*leavesHeight, 0.0);
		m = mult(m, rotate(theta[leavesId], vec3(0, 1, 0)));
		figure[leavesId] = createNode( m, leaves, null, null);
		break;

		case floorId:
		m = translate(0.0, -floorHeight*2.6, 0.0);
		m = mult(m, rotate(theta[floorId], vec3(1,0,0)));
		figure[floorId] = createNode(m, floor, null, null);
		break;

	}
}

function traverse(Id) {
	if(Id == null) return;
	stack.push(modelViewMatrix);
	modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
	figure[Id].render();
	if(figure[Id].child != null) traverse(figure[Id].child);
	modelViewMatrix = stack.pop();
	if(figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function torso() {
	flagBody = true;
	gl.uniform1i(gl.getUniformLocation(program, "flagBody"), flagBody);

	instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale( torsoWidth, torsoHeight, torsoWidth));
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
	for(var i =0; i<6; i++) {
		gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, texture2);
	}

	flagBody = false;
	gl.uniform1i(gl.getUniformLocation(program, "flagBody"), flagBody);
}

function head() {
	flagHead = true;
	gl.uniform1i(gl.getUniformLocation(program, "flagHead"), flagHead);

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale(headWidth, headHeight, headWidth) );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
  for(var i =0; i<6; i++) { 
		gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture1);
	}

	flagHead = false;
	gl.uniform1i(gl.getUniformLocation(program, "flagHead"), flagHead);
}

function leftUpperArm() {
	flagBody = true;
	gl.uniform1i(gl.getUniformLocation(program, "flagBody"), flagBody);

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmWidth) );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
	for(var i =0; i<6; i++) {
		gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, texture2);
	}

	flagBody = false;
	gl.uniform1i(gl.getUniformLocation(program, "flagBody"), flagBody);
}

function leftLowerArm() {
	flagBody = true;
	gl.uniform1i(gl.getUniformLocation(program, "flagBody"), flagBody);

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
	for(var i =0; i<6; i++) {
		gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, texture2);
	}
	
	flagBody = false;
	gl.uniform1i(gl.getUniformLocation(program, "flagBody"), flagBody);
}

function rightUpperArm() {
	flagBody = true;
	gl.uniform1i(gl.getUniformLocation(program, "flagBody"), flagBody);

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmWidth) );
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
	for(var i =0; i<6; i++) {
		gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, texture2);
	}
	
	flagBody = false;
	gl.uniform1i(gl.getUniformLocation(program, "flagBody"), flagBody);
}

function rightLowerArm() {
	flagBody = true;
	gl.uniform1i(gl.getUniformLocation(program, "flagBody"), flagBody);

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
	for(var i =0; i<6; i++) {
		gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, texture2);
	}
	
	flagBody = false;
	gl.uniform1i(gl.getUniformLocation(program, "flagBody"), flagBody);
}

function leftUpperLeg() {
	flagBody = true;
	gl.uniform1i(gl.getUniformLocation(program, "flagBody"), flagBody);

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth) );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
	for(var i =0; i<6; i++) {
		gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, texture2);
	}
	
	flagBody = false;
	gl.uniform1i(gl.getUniformLocation(program, "flagBody"), flagBody);
}

function leftLowerLeg() {
	flagBody = true;
	gl.uniform1i(gl.getUniformLocation(program, "flagBody"), flagBody);

	instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth) );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
	for(var i =0; i<6; i++) {
		gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, texture2);
	}
	
	flagBody = false;
	gl.uniform1i(gl.getUniformLocation(program, "flagBody"), flagBody);
}

function rightUpperLeg() {
	flagBody = true;
	gl.uniform1i(gl.getUniformLocation(program, "flagBody"), flagBody);

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth) );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
	for(var i =0; i<6; i++) {
		gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, texture2);
	}
	
	flagBody = false;
	gl.uniform1i(gl.getUniformLocation(program, "flagBody"), flagBody);
}

function rightLowerLeg() {
	flagBody = true;
	gl.uniform1i(gl.getUniformLocation(program, "flagBody"), flagBody);

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth) )
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
	for(var i =0; i<6; i++) {
		gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, texture2);
	}
	
	flagBody = false;
	gl.uniform1i(gl.getUniformLocation(program, "flagBody"), flagBody);
}

function tail() {
	flagBody = true;
	gl.uniform1i(gl.getUniformLocation(program, "flagBody"), flagBody);

	instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * tailHeigh, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(tailWidth, tailHeigh, tailWidth) )
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
	for(var i =0; i<6; i++) {
		gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, texture2);
	}
	
	flagBody = false;
	gl.uniform1i(gl.getUniformLocation(program, "flagBody"), flagBody);
}

function trunk() {
	flagTrunk = true;
	gl.uniform1i(gl.getUniformLocation(program, "flagTrunk"), flagTrunk);

	instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * trunkHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(trunkWidth, trunkHeight, trunkWidth));
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);

	flagTrunk = false;
	gl.uniform1i(gl.getUniformLocation(program, "flagTrunk"), flagTrunk);
}

function leaves() {
	flagLeaves = true;
	gl.uniform1i(gl.getUniformLocation(program, "flagLeaves"), flagLeaves);

	instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * leavesHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(leavesWidth, leavesHeight, leavesWidth));
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);

	flagLeaves = false;
	gl.uniform1i(gl.getUniformLocation(program, "flagLeaves"), flagLeaves);
}

function floor(){
	instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * floorHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(floorWidth, floorHeight, floorWidth));
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function quad(a, b, c, d) {
	pointsArray.push(vertices[a]);
	texCoordsArray.push(texCoord[0]);
	pointsArray.push(vertices[b]);
	texCoordsArray.push(texCoord[1]);
	pointsArray.push(vertices[c]);
	texCoordsArray.push(texCoord[2]);
	pointsArray.push(vertices[d]);
	texCoordsArray.push(texCoord[3]);
}

function cube()
{
	quad( 1, 0, 3, 2 );
	quad( 2, 3, 7, 6 );
	quad( 3, 0, 4, 7 );
	quad( 6, 5, 1, 2 );
	quad( 4, 5, 6, 7 );
	quad( 5, 4, 0, 1 );
}

//TEXTURE
var texture1, texture2;
var flagHead = false;
var flagBody = false;
var flagTrunk = false;
var flagLeaves = false;
var texSize = 150;
function configureTexture(image1, image2) {
	// head
  texture1 = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture1);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image1);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	
	// body
	texture2 = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture2);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image2);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

//ANIMATION
var flagAnimation = false;
var walkLeftUp = false;		// 3,4
var walkRightUp = false;		// 5,6
var walkLeftBack = false;	// 7,8
var walkRightBack = false;	// 9,10
function walking_legs(id_upper, id_lower, flag){
	switch(flag){
		case 'leftUp':
			if(theta[id_upper] == 110) walkLeftUp = true;
			else if (theta[id_upper] == 60) walkLeftUp = false;
			if(walkLeftUp) {
				theta[id_upper] -= 0.5;
				theta[id_lower] += 0.5;
			} else {
				theta[id_upper] += 0.5;
				theta[id_lower] -= 0.5;
			}
			break;
		
		case 'rightUp':
			if(theta[id_upper] == 110) walkRightUp = true;
			else if (theta[id_upper] == 60) walkRightUp = false;
			if(walkRightUp) {
				theta[id_upper] -= 0.5;
				theta[id_lower] += 0.5;
			} else {
				theta[id_upper] += 0.5;
				theta[id_lower] -= 0.5;
			}
			break;

		case 'leftBack':
			if(theta[id_upper] == 110) walkLeftBack = true;
			else if (theta[id_upper] == 60) walkLeftBack = false;
			if(walkLeftBack) {
				theta[id_upper] -= 0.5;
				theta[id_lower] += 0.5;
			} else {
				theta[id_upper] += 0.5;
				theta[id_lower] -= 0.5;
			}
			break;

		case 'rightBack':
			if(theta[id_upper] == 110) walkRightBack = true;
			else if (theta[id_upper] == 60) walkRightBack = false;
			if(walkRightBack) {
				theta[id_upper] -= 0.5;
				theta[id_lower] += 0.5;
			} else {
				theta[id_upper] += 0.5;
				theta[id_lower] -= 0.5;
			}
			break;
	}
}

function walking_to_the_tree(){
	if(position_x > -5){
		theta[torsoId] += 0.3;
		position_z += 0.0068;
	} else if (position_x > -2){
		theta[torsoId] += 0.3;
	}
	position_x += 0.03;
	walking_legs(leftUpperArmId, leftLowerArmId, 'leftUp');
	walking_legs(rightUpperArmId, rightLowerArmId, 'rightUp');
	walking_legs(leftUpperLegId, leftLowerLegId, 'leftBack');
	walking_legs(rightUpperLegId, rightLowerLegId, 'rightBack');
}

var straightLeftBack = false;
var straightRightBack = false;
function straight_legs(id_upper, id_lower, flag){
	switch(flag){
		case 'leftBack':
			if(theta[id_upper] < 170) straightLeftBack = true;
			else if (theta[id_upper] >= 170) straightLeftBack = false;
			if(straightLeftBack) {
				theta[id_upper] += 0.15;
				if(theta[id_lower] < 20) theta[id_lower] += 0.4;
			}
			break;
		case 'rightBack':
			if(theta[id_upper] < 170) straightRightBack = true;
			else if (theta[id_upper] >= 170) straightRightBack = false;
			if(straightRightBack) {
				theta[id_upper] += 0.4;
				if(theta[id_lower] < 20) theta[id_lower] += 0.6;
			}
			break;
	}
}

var stand_up_flag = false;
function stand_up(){
	if(theta[torsoId] < 180){
		theta[torsoId] += 0.3;
		walking_legs(leftUpperArmId, leftLowerArmId, 'leftUp');
		walking_legs(rightUpperArmId, rightLowerArmId, 'rightUp');
	} else if(theta[torsoId] >= 180 && theta[torso1Id] > 0){
		theta[torso1Id] -= 0.3;
		theta[head1Id] += 0.20;
		head_y_step += 0.002;
		head_z_step -= 0.004;
		position_y -= 0.0009;
		straight_legs(leftUpperLegId, leftLowerLegId, 'leftBack');
		straight_legs(rightUpperLegId, rightLowerLegId, 'rightBack');
	} else if(theta[torsoId] >= 180 && theta[torso1Id] <= 0) {
		stand_up_flag = true;
	}
}


var scratchLeftBack = false;
var scratchRightBack = false;
function scratching_legs(id_upper, id_lower, flag){
	switch(flag){
		case 'leftBack':
			if(theta[id_upper]%180 < 1) scratchLeftBack = true;
			else if(theta[id_upper]%150 < 1) scratchLeftBack = false;
			if(scratchLeftBack){
				position_y -= 0.0015;
				theta[id_upper] -= 0.2;
				theta[id_lower] += 0.2;
			} else {
				position_y += 0.0015;
				theta[id_upper] += 0.2;
				theta[id_lower] -= 0.2;
			}
			break;
		case 'rightBack':
			if(theta[id_upper]%180 < 1) scratchRightBack = true;
			else if(theta[id_upper]%150 < 1) scratchRightBack = false;
			if(scratchRightBack){
				theta[id_upper] -= 0.2;
				theta[id_lower] += 0.2;
			} else {
				theta[id_upper] += 0.2;
				theta[id_lower] -= 0.2;
			}
			break;
	}
}

function reach_common_value(id_upper, id_lower, side){
	if(theta[id_upper] > 150){
		theta[id_upper] -= 0.2;
	} else if (theta[id_upper] < 150){
		theta[id_upper] += 0.2;
	}
	if(theta[id_lower] > 20){
		theta[id_lower] -= 0.2;
	} else if (theta[id_lower] < 20){
		theta[id_lower] += 0.2;
	}
	if(theta[id_upper]%150 < 1 && theta[id_lower]%20 < 1) {
		switch(side){
			case 'left':
				scratch_go1 = false;
				break;
			case 'right':
				scratch_go2 = false;
				break;
		}
	}
}

var scratch_go1 = true;
var scratch_go2 = true;
function scratching(){
	if(scratch_go1 == true)
		reach_common_value(leftUpperLegId, leftLowerLegId, 'left');
	if (scratch_go2 == true)
		reach_common_value(rightUpperLegId, rightLowerLegId, 'right');
	if(!scratch_go1 && !scratch_go2){
		scratching_legs(leftUpperLegId, leftLowerLegId, 'leftBack');
		scratching_legs(rightUpperLegId, rightLowerLegId, 'rightBack');
	}
}

window.onload = function init() {

	canvas = document.getElementById( "gl-canvas" );

	gl = canvas.getContext('webgl2');
	if (!gl) { alert( "WebGL 2.0 isn't available" ); }

	gl.viewport( 0, 0, canvas.width, canvas.height );
	aspect =  canvas.width/canvas.height;
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
	gl.enable(gl.DEPTH_TEST);

	//
	//  Load shaders and initialize attribute buffers
	//
	program = initShaders( gl, "vertex-shader", "fragment-shader");

	gl.useProgram( program);

	instanceMatrix = mat4();

	modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

	cube();

	vBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
	gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

	var positionLoc = gl.getAttribLocation( program, "aPosition" );
	gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( positionLoc );

	//texCoordArray
  var tBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

  var aTextCoord = gl.getAttribLocation(program, "aTexCoord");
  gl.vertexAttribPointer(aTextCoord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aTextCoord);

	var image1 = document.getElementById("texImage1");
	var image2 = document.getElementById("texImage2");
	configureTexture(image1, image2);	//texture1, texture2
	gl.uniform1i( gl.getUniformLocation(program, "uTextureMap1"), 0);
	gl.uniform1i( gl.getUniformLocation(program, "uTextureMap2"), 1);
	
	document.getElementById("Button1").onclick = function(){flagAnimation = !flagAnimation;};
	document.getElementById("Button2").onclick = function(){theta_p += dr;};
  document.getElementById("Button3").onclick = function(){theta_p -= dr;};
  document.getElementById("Button4").onclick = function(){phi += dr;};
  document.getElementById("Button5").onclick = function(){phi -= dr;};
	
	render();
}

var render = function() {
	for(i=0; i<numNodes; i++) initNodes(i);

	gl.clear( gl.COLOR_BUFFER_BIT );

	if(flagAnimation==true){
		if(position_x < 2) walking_to_the_tree();
		else if(position_x >= 2 && !stand_up_flag) stand_up();
		else if(stand_up_flag) scratching();
	}

	var eye = vec3(radius*Math.sin(theta_p)*Math.cos(phi),radius*Math.sin(theta_p)*Math.sin(phi),radius*Math.cos(theta_p));
	modelViewMatrix = lookAt(eye, at, up);
	projectionMatrix = perspective(fovy, aspect, near, far);

	gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix));
	gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix) );

	traverse(torsoId);
	traverse(trunkId);
	traverse(floorId);

	requestAnimationFrame(render);
}
