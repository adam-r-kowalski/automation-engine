import { Batch } from "../batchGeometry";
import { Size } from "../layout";
import { Mat3 } from "../linear_algebra";

interface Attribute {
    location: number
    buffer: WebGLBuffer
}

interface Attributes {
    vertices: Attribute
    colors: Attribute
    vertexIndices: WebGLBuffer
}

interface Uniforms {
    projection: WebGLUniformLocation
}

interface Program {
    vertexShader: WebGLShader
    fragmentShader: WebGLShader
    program: WebGLProgram
    attributes: Attributes
    uniforms: Uniforms
}

export class WebGL2Renderer {
    _size: Size

    constructor(
        public canvas: HTMLCanvasElement,
        public gl: WebGL2RenderingContext,
        public program: Program
    ) { }

    clear() {
        const { gl } = this
        gl.clear(gl.COLOR_BUFFER_BIT)
    }

    set size(size: Size) {
        const { gl, program } = this
        const { uniforms } = program
        const { canvas } = gl
        gl.uniformMatrix3fv(uniforms.projection, /*transpose*/true, Mat3.projection(size).data)
        canvas.width = size.width * window.devicePixelRatio
        canvas.height = size.height * window.devicePixelRatio
        canvas.style.width = `${size.width}px`
        canvas.style.height = `${size.height}px`
        gl.viewport(0, 0, canvas.width, canvas.height)
        this._size = size
    }

    get size() { return this._size }

    draw({ vertices, colors, vertexIndices }: Batch) {
        const { gl, program } = this
        const { attributes } = program
        gl.bindBuffer(gl.ARRAY_BUFFER, attributes.vertices.buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, attributes.colors.buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, attributes.vertexIndices)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW)
        gl.drawElements(gl.TRIANGLES, /*count*/vertexIndices.length, /*type*/gl.UNSIGNED_SHORT, /*offset*/0)
    }
}


const createVertexShader = (gl: WebGL2RenderingContext, { vertices, colors }: Attributes): WebGLShader => {
    const vertexShaderSource = `#version 300 es
  uniform mat3 u_projection;

  layout(location = ${vertices.location}) in vec2 a_vertex;
  layout(location = ${colors.location}) in vec4 a_color;

  out vec4 v_color;

  void main() {
    gl_Position = vec4((u_projection * vec3(a_vertex, 1)).xy, 0, 1);
    v_color = a_color / 255.0;
  }
  `
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!
    gl.shaderSource(vertexShader, vertexShaderSource)
    gl.compileShader(vertexShader)
    return vertexShader
}

const createFragmentShader = (gl: WebGL2RenderingContext): WebGLShader => {
    const fragmentShaderSource = `#version 300 es
  precision highp float;

  in vec4 v_color;

  out vec4 fragColor;
  
  void main() {
    fragColor = v_color;
  }
  `
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!
    gl.shaderSource(fragmentShader, fragmentShaderSource)
    gl.compileShader(fragmentShader)
    return fragmentShader
}

const bindVertices = (gl: WebGL2RenderingContext, program: WebGLProgram, { location, buffer }: Attribute) => {
    gl.bindAttribLocation(program, location, 'a_vertex')
    gl.enableVertexAttribArray(location)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.vertexAttribPointer(
        location,
        /*size*/2,
        /*type*/gl.FLOAT,
        /*normalize*/false,
        /*stride*/0,
        /*offset*/0
    )
}

const bindColors = (gl: WebGL2RenderingContext, program: WebGLProgram, { location, buffer }: Attribute) => {
    gl.bindAttribLocation(program, location, 'a_color')
    gl.enableVertexAttribArray(location)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.vertexAttribPointer(
        location,
        /*size*/4,
        /*type*/gl.FLOAT,
        /*normalize*/false,
        /*stride*/0,
        /*offset*/0
    )
}


const createProgram = (gl: WebGL2RenderingContext): Program => {
    const attributes: Attributes = {
        vertices: {
            location: 0,
            buffer: gl.createBuffer()!
        },
        colors: {
            location: 1,
            buffer: gl.createBuffer()!
        },
        vertexIndices: gl.createBuffer()!
    }
    const vertexShader = createVertexShader(gl, attributes)
    const fragmentShader = createFragmentShader(gl)
    const program = gl.createProgram()!
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log(gl.getShaderInfoLog(vertexShader))
        console.log(gl.getShaderInfoLog(fragmentShader))
    }
    gl.useProgram(program)
    const vertexArrayObject = gl.createVertexArray()!
    gl.bindVertexArray(vertexArrayObject)
    bindVertices(gl, program, attributes.vertices)
    bindColors(gl, program, attributes.colors)
    const uniforms = {
        projection: gl.getUniformLocation(program, 'u_projection')!
    }
    return {
        vertexShader,
        fragmentShader,
        program,
        attributes,
        uniforms
    }
}

export const webGL2Renderer = (size: Size) => {
    const canvas = document.createElement('canvas')
    canvas.style.touchAction = 'none'
    const gl = canvas.getContext('webgl2')!
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.depthMask(false)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
    gl.clearColor(0, 0, 0, 1)
    const program = createProgram(gl)
    const renderer = new WebGL2Renderer(canvas, gl, program)
    renderer.size = size
    return renderer
}