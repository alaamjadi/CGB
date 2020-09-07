// The code should be executed in "strict mode"
// Cannot use undeclared variables
var baseDir, shaderDir



//////////////////////////////////////////////////////////////////
//////////////////////// Initialization  ////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////
////////////////

async function main() {
	// Get A WebGL context
	var canvas = document.querySelector("#canvas") 

	var gl = canvas.getContext("webgl") 
	if (!gl) {
		// No WebGL for you!
		return
	}

	// Loading the GLSL shader files 
	await utils.loadFiles([shaderDir + "shader1-vs.glsl", shaderDir + "shader1-fs.glsl"], function (shaderText) {
		// create GLSL shaders, upload the GLSL source, compile the shaders
		var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]) 
		var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]) 
		// Link the two shaders into a program
		program = utils.createProgram(gl, vertexShader, fragmentShader) 
	  }) 
	
	// Setting up state to supply data to GLSL
	// Look up the location of the attribute (input of GLSL program) for the created program
	// look up where the vertex data needs to go.
	var positionAttributeLocation = gl.getAttribLocation(program, "a_position") 

	// Initialization (not render loop)
	// Looking up attribute locations (and unifrom locations)
	// Creating a buffer so attributes can get their data from buffers (put three 2D clip space points in it)
	var positionBuffer = gl.createBuffer() 

	// Global variables inside WebGL are called bind points
	// Bind a resource to a bind point
	// Refer the functions to the resource throught the bind point
	// Binding position buffer to "ARRAY_BUFFER" (ARRAY_BUFFER = positionBuffer)
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer) 

	// Puting data in the buffer by referencing it through the bind point
	// three 2d points
	// Creating a new array of 32bit floating point numbers and copying the values from "positions"
	// "gl.bufferData" copies data to the "positionBuffer" (it's bined with "ARRAY_BUFFER") on GPU
	// Giving hint with "gl.STATIC_DRAW" to WebGL that we are not changing this data much
	var positions = [
		0, 0,
		0, 0.5,
		0.7, 0,
	] 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW) 




//////////////////////////////////////////////////////////////////
//////////////////////////// Rendering  /////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////
////////////////

webglUtils.resizeCanvasToDisplaySize(gl.canvas) 

// Converting clip space ("gl_Position") values into pixels or screen space by passing the current canvas size to gl.viewport
// Affine transformation of x and y from normalized device coordinates to window coordinates
// x: horizontal coordinate for the lower left corner of the viewport origin
// y: vertical coordinate for the lower left corner of the viewport origin
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height) 

// Clear (Transparent) canvas
gl.clearColor(0, 0, 0, 0) 
gl.clear(gl.COLOR_BUFFER_BIT) 

// Telling WebGL to use our shader program
gl.useProgram(program) 

// Turn on the attribute so WebGL can take data from the buffer that we setup
gl.enableVertexAttribArray(positionAttributeLocation) 

// Pull data out from the buffer
// Bind the position buffer.
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer) 

// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
// in vertex shader we have defined "a_position" attirbute as vec4
// example: a_position = {x:0, y:0, z:0, w:0}
// Size = 2  =>  attibute will get its first 2 values (x and y) from buffer. z=0 and w=1
var size = 2           // 2 components per iteration
var type = gl.FLOAT    // the data is 32bit floats
var normalize = false  // don't normalize the data
var stride = 0         // 0 = move forward size * sizeof(type) each iteration to get the next position
var offset = 0         // start at the beginning of the buffer

// Binding the "ARRAY_BUFFER" to the attribute
// The attribute is bound to "positionBuffer"
// It means we can bind something else to the "ARRAY_BUFFER" bind point
// The attribute continue to use "positionBuffer"
gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

// Execute our GLSL program
// count = 3  =>  execute vertex shader 3 times
// First time: "a_position.x" and "a_position.y" in vertex shader attribute will be set to the first 2 values from the positionBuffer.
// Second time: "a_position.x" and "a_position.y" will be set to the second 2 values.
// Third time: They will be set to the last 2 values
// Since we set "primitiveType" to gl.TRIANGLES, each time our vertex shader runs (3 times),  WebGL will draw a triangle based on the 3 values we set to "gl_Position"
var primitiveType = gl.TRIANGLES 
var offset = 0 
var count = 3 
gl.drawArrays(primitiveType, offset, count) 

}

//////////////////////////////////////////////////////////////////
/////////////////////////// Functions ///////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////
////////////////

// create a shader, upload the GLSL source, and compile the shader
function createShader(gl, type, source) {
	var shader = gl.createShader(type) 
	gl.shaderSource(shader, source) 
	gl.compileShader(shader) 
	var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS) 
	if (success) {
		return shader 
	}

	console.log(gl.getShaderInfoLog(shader)) 
	gl.deleteShader(shader) 
}

// Linking the two shaders into a program
function createProgram(gl, [vertexShader, fragmentShader]) {
	var program = gl.createProgram() 
	gl.attachShader(program, vertexShader) 
	gl.attachShader(program, fragmentShader) 
	gl.linkProgram(program) 
	var success = gl.getProgramParameter(program, gl.LINK_STATUS) 
	if (success) {
		return program 
	}

	console.log(gl.getProgramInfoLog(program)) 
	gl.deleteProgram(program) 
}

////////////////////////Shaders File Loader to memory ////////////////////////
async function loadShaderVFS(vs_path, fs_path) {
	await utils.loadFiles([vs_path, fs_path], function (shaderText) {
		return [shaderText[0], shaderText[1]]
	})
}



////////////////////////////////Browser Init ////////////////////////////////
function browserInit() {
	var path = window.location.pathname 
	var page = path.split("/").pop() 
	baseDir = window.location.href.replace(page, '')
	shaderDir = baseDir+"glsl/"
}
function autoResizeCanvas(canvas) {
	const expandFullScreen = () => {
		canvas.width = $("#canvas").parent().width() 
		canvas.height = $("#canvas").parent().height() 
	} 

	expandFullScreen() 
	//Resize screen when the browser has triggered the resize event
	window.addEventListener('resize', expandFullScreen) 
}



////////////////////// Test and run \\\\\\\\\\\\\\\\\\\\
async function init() {
	browserInit()
	/* await utils.get_json(baseDir + "dataset/data.json", function (jsonFile) {
	  myDataset = jsonFile.values
	})  */
	/* await loadObject("1") */
	main()
}

window.onload = init