"use client"

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import { Mesh, Program, Renderer, Texture, Triangle } from "ogl"

import "./MorphSlider.css"

export type MorphItem = {
  focalX?: number
  focalY?: number
  image: string
}

export type MorphSliderHandle = {
  setTransition: (
    fromIndex: number,
    toIndex: number,
    progress: number,
    direction: number
  ) => void
}

type MorphSliderProps = {
  aberration?: number
  className?: string
  darkness?: number
  dprCap?: number
  intensity?: number
  items: MorphItem[]
  reducedMotion?: boolean
  scale?: number
}

type GL = Renderer["gl"]

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

// Adapted from React Bits MorphSlider's "melt" shader. Scroll progress is the
// only clock. The dark bridge is authored into the displacement envelope.
const fragmentShader = `
precision highp float;

uniform sampler2D tCurrent;
uniform sampler2D tNext;
uniform vec2 uResolution;
uniform vec2 uCurrentSize;
uniform vec2 uNextSize;
uniform vec2 uCurrentFocal;
uniform vec2 uNextFocal;
uniform float uProgress;
uniform float uDir;
uniform float uIntensity;
uniform float uScale;
uniform float uAberration;
uniform float uDarkness;
uniform float uReduce;

varying vec2 vUv;

const float PI = 3.14159265359;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

vec2 coverUV(vec2 uv, vec2 resolution, vec2 imageSize, vec2 focal) {
  float viewportAspect = resolution.x / max(resolution.y, 1.0);
  float imageAspect = imageSize.x / max(imageSize.y, 1.0);
  vec2 scale = vec2(1.0);
  float ratio = viewportAspect / max(imageAspect, 0.0001);
  if (ratio > 1.0) {
    scale.y = 1.0 / ratio;
  } else {
    scale.x = ratio;
  }
  vec2 sampleUv = (uv - 0.5) * scale + 0.5;
  vec2 available = (1.0 - scale) * 0.5;
  return sampleUv + (focal - 0.5) * available * 1.6;
}

void main() {
  float progress = clamp(uProgress, 0.0, 1.0);
  float envelope = sin(progress * PI);
  float directionBias = uDir < 0.0 ? -1.0 : 1.0;
  vec2 uv = vUv;
  vec2 currentUv = uv;
  vec2 nextUv = uv;
  float mixMask = progress;

  if (uReduce < 0.5) {
    float primaryNoise = fbm(uv * uScale + vec2(progress * 0.22 * directionBias, progress * -0.13));
    float secondaryNoise = fbm(uv * uScale * 1.72 - vec2(progress * 0.11, progress * 0.19 * directionBias));
    vec2 displacement = vec2(primaryNoise, secondaryNoise) - 0.5;
    currentUv = uv + displacement * uIntensity * 0.42 * progress;
    nextUv = uv - displacement * uIntensity * 0.42 * (1.0 - progress);
    mixMask = smoothstep(primaryNoise - 0.18, primaryNoise + 0.18, progress);
  }

  vec2 currentSample = coverUV(currentUv, uResolution, uCurrentSize, uCurrentFocal);
  vec2 nextSample = coverUV(nextUv, uResolution, uNextSize, uNextFocal);
  float chroma = uReduce < 0.5 ? uAberration * envelope * 0.018 : 0.0;

  vec3 currentColor = vec3(
    texture2D(tCurrent, currentSample + vec2(chroma, 0.0)).r,
    texture2D(tCurrent, currentSample).g,
    texture2D(tCurrent, currentSample - vec2(chroma, 0.0)).b
  );
  vec3 nextColor = vec3(
    texture2D(tNext, nextSample + vec2(chroma, 0.0)).r,
    texture2D(tNext, nextSample).g,
    texture2D(tNext, nextSample - vec2(chroma, 0.0)).b
  );

  vec3 color = mix(currentColor, nextColor, mixMask);
  color *= 1.0 - envelope * uDarkness;
  gl_FragColor = vec4(color, 1.0);
}
`

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value))
}

function fallbackTexture(gl: GL) {
  const size = 4
  const data = new Uint8Array(size * size * 4)
  for (let index = 0; index < size * size; index += 1) {
    data[index * 4] = 12
    data[index * 4 + 1] = 11
    data[index * 4 + 2] = 9
    data[index * 4 + 3] = 255
  }
  return new Texture(gl, {
    image: data,
    width: size,
    height: size,
    generateMipmaps: false,
  })
}

class ControlledMorphEngine {
  private canvas: HTMLCanvasElement
  private container: HTMLElement
  private currentState = { direction: 1, from: 0, progress: 0, to: 0 }
  private geometry: Triangle
  private gl: GL
  private items: MorphItem[]
  private mesh: Mesh
  private program: Program
  private renderer: Renderer
  private resizeObserver: ResizeObserver
  private sizes: [number, number][]
  private textures: Texture[]

  constructor(
    container: HTMLElement,
    items: MorphItem[],
    options: Required<
      Pick<
        MorphSliderProps,
        | "aberration"
        | "darkness"
        | "dprCap"
        | "intensity"
        | "reducedMotion"
        | "scale"
      >
    >,
    onContextLost: () => void
  ) {
    this.container = container
    this.items = items
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, options.dprCap),
    })
    this.gl = this.renderer.gl
    this.gl.clearColor(0, 0, 0, 0)
    this.canvas = this.gl.canvas as HTMLCanvasElement
    this.canvas.className = "morph-slider-canvas"
    this.canvas.setAttribute("aria-hidden", "true")
    this.container.appendChild(this.canvas)
    this.geometry = new Triangle(this.gl)
    this.textures = items.map(() => fallbackTexture(this.gl))
    this.sizes = items.map(() => [1, 1])

    this.program = new Program(this.gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      transparent: true,
      uniforms: {
        tCurrent: { value: this.textures[0] },
        tNext: { value: this.textures[0] },
        uResolution: { value: [1, 1] },
        uCurrentSize: { value: this.sizes[0] },
        uNextSize: { value: this.sizes[0] },
        uCurrentFocal: { value: [0.5, 0.5] },
        uNextFocal: { value: [0.5, 0.5] },
        uProgress: { value: 0 },
        uDir: { value: 1 },
        uIntensity: { value: options.intensity },
        uScale: { value: options.scale },
        uAberration: { value: options.aberration },
        uDarkness: { value: options.darkness },
        uReduce: { value: options.reducedMotion ? 1 : 0 },
      },
    })
    this.mesh = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    })

    this.canvas.addEventListener(
      "webglcontextlost",
      (event) => {
        event.preventDefault()
        onContextLost()
      },
      { once: true }
    )

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(container)
    this.resize()
    this.loadTextures()
    this.render()
  }

  private focal(index: number) {
    const item = this.items[index]
    return [
      clamp((item?.focalX ?? 50) / 100),
      clamp((item?.focalY ?? 50) / 100),
    ]
  }

  private loadTextures() {
    this.items.forEach((item, index) => {
      const image = new Image()
      image.crossOrigin = "anonymous"
      image.src = item.image
      image.onload = () => {
        const texture = new Texture(this.gl, { generateMipmaps: false })
        texture.image = image
        this.textures[index] = texture
        this.sizes[index] = [image.naturalWidth || 1, image.naturalHeight || 1]
        this.syncTextures()
        this.render()
      }
    })
  }

  private resize() {
    const bounds = this.container.getBoundingClientRect()
    this.renderer.setSize(Math.max(bounds.width, 1), Math.max(bounds.height, 1))
    this.program.uniforms.uResolution.value = [
      this.gl.canvas.width,
      this.gl.canvas.height,
    ]
    this.render()
  }

  private syncTextures() {
    const { from, to } = this.currentState
    this.program.uniforms.tCurrent.value = this.textures[from]
    this.program.uniforms.tNext.value = this.textures[to]
    this.program.uniforms.uCurrentSize.value = this.sizes[from]
    this.program.uniforms.uNextSize.value = this.sizes[to]
    this.program.uniforms.uCurrentFocal.value = this.focal(from)
    this.program.uniforms.uNextFocal.value = this.focal(to)
  }

  private render() {
    this.renderer.render({ scene: this.mesh })
  }

  setTransition(from: number, to: number, progress: number, direction: number) {
    this.currentState = {
      from: clamp(Math.round(from), 0, this.items.length - 1),
      to: clamp(Math.round(to), 0, this.items.length - 1),
      progress: clamp(progress),
      direction: direction < 0 ? -1 : 1,
    }
    this.syncTextures()
    this.program.uniforms.uProgress.value = this.currentState.progress
    this.program.uniforms.uDir.value = this.currentState.direction
    this.render()
  }

  destroy() {
    this.resizeObserver.disconnect()
    this.textures.forEach((texture) => {
      if (texture.texture) this.gl.deleteTexture(texture.texture)
    })
    if (this.program.program) this.gl.deleteProgram(this.program.program)
    this.canvas.remove()
    this.gl.getExtension("WEBGL_lose_context")?.loseContext()
  }
}

const MorphSlider = forwardRef<MorphSliderHandle, MorphSliderProps>(
  function MorphSlider(
    {
      aberration = 0.08,
      className = "",
      darkness = 0.5,
      dprCap = 1.5,
      intensity = 0.5,
      items,
      reducedMotion = false,
      scale = 2.8,
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null)
    const engineRef = useRef<ControlledMorphEngine | null>(null)
    const fallbackRefs = useRef<(HTMLDivElement | null)[]>([])
    const transitionRef = useRef({ direction: 1, from: 0, progress: 0, to: 0 })
    const [webglReady, setWebglReady] = useState(false)

    useImperativeHandle(ref, () => ({
      setTransition(fromIndex, toIndex, progress, direction) {
        transitionRef.current = {
          from: fromIndex,
          to: toIndex,
          progress,
          direction,
        }
        engineRef.current?.setTransition(
          fromIndex,
          toIndex,
          progress,
          direction
        )

        const nearest = progress < 0.5 ? fromIndex : toIndex
        fallbackRefs.current.forEach((layer, index) => {
          if (!layer) return
          if (reducedMotion || !webglReady) {
            layer.style.opacity = index === nearest ? "1" : "0"
          } else {
            layer.style.opacity = "0"
          }
        })
      },
    }))

    useEffect(() => {
      const container = containerRef.current
      if (!container || reducedMotion || items.length === 0) return

      let engine: ControlledMorphEngine | null = null
      try {
        engine = new ControlledMorphEngine(
          container,
          items,
          {
            aberration,
            darkness,
            dprCap,
            intensity,
            reducedMotion,
            scale,
          },
          () => setWebglReady(false)
        )
        engineRef.current = engine
        const state = transitionRef.current
        engine.setTransition(
          state.from,
          state.to,
          state.progress,
          state.direction
        )
        setWebglReady(true)
      } catch {
        setWebglReady(false)
      }

      return () => {
        engine?.destroy()
        engineRef.current = null
      }
    }, [aberration, darkness, dprCap, intensity, items, reducedMotion, scale])

    return (
      <div className={`morph-slider ${className}`.trim()} aria-hidden="true">
        <div className="morph-slider-fallbacks">
          {items.map((item, index) => (
            <div
              key={`${item.image}-${index}`}
              ref={(element) => {
                fallbackRefs.current[index] = element
              }}
              className="morph-slider-fallback"
              style={{
                backgroundImage: `url(${JSON.stringify(item.image)})`,
                backgroundPosition: `${item.focalX ?? 50}% ${item.focalY ?? 50}%`,
                opacity: index === 0 ? 1 : 0,
              }}
            />
          ))}
        </div>
        <div
          ref={containerRef}
          className="morph-slider-stage"
          data-webgl-ready={webglReady || undefined}
        />
      </div>
    )
  }
)

export default MorphSlider
