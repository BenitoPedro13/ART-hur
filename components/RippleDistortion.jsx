"use client"

import { useEffect, useRef } from "react"
import {
  Geometry,
  Mesh,
  Program,
  RenderTarget,
  Renderer,
  Texture,
  Triangle,
} from "ogl"

import "./RippleDistortion.css"

const MAX_WAVES = 72
const QUALITY_SCALE = { low: 0.4, medium: 0.7, high: 1 }
const START_SCALE = 1.5
const LIFE_CONSTANT = Math.log(500)

const waveVertex = `
precision highp float;
attribute vec2 position;
attribute vec2 uv;
attribute vec2 iOffset;
attribute vec2 iScale;
attribute float iOpacity;
varying vec2 vUv;
varying float vOpacity;
void main() {
  vUv = uv;
  vOpacity = iOpacity;
  gl_Position = vec4(iOffset + position * iScale, 0.0, 1.0);
}`

const waveFragment = `
precision highp float;
varying vec2 vUv;
varying float vOpacity;
uniform float uRings;
const float PI = 3.141592653589793;
const float EDGE = 0.006737947;
void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float r = dot(p, p);
  if (r > 1.0) discard;
  float brush = (exp(-r * 5.0) - EDGE) / (1.0 - EDGE);
  brush *= 0.55 + 0.45 * cos(sqrt(r) * PI * 2.0 * uRings);
  gl_FragColor = vec4(vec3(brush * vOpacity * vOpacity), 1.0);
}`

const screenVertex = `
precision highp float;
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}`

const compositeFragment = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform sampler2D uDisplacement;
uniform vec2 uResolution;
uniform vec2 uTextureSize;
uniform vec2 uTexel;
uniform vec3 uTint;
uniform vec3 uHighlight;
uniform float uStrength;
uniform float uSwirl;
uniform float uDispersion;
uniform float uGlint;
uniform float uTintAmount;
uniform float uGrayscale;
uniform float uTime;
uniform float uJiggle;
uniform float uJiggleScale;
uniform float uJiggleSpeed;
const float TAU = 6.283185307179586;
vec2 coverUV(vec2 uv) {
  vec2 safe = max(uTextureSize, vec2(1.0));
  vec2 s = uResolution / safe;
  vec2 scaledSize = safe * max(s.x, s.y);
  vec2 offset = (uResolution - scaledSize) * 0.5;
  return (uv * uResolution - offset) / scaledSize;
}
void main() {
  float amount = texture2D(uDisplacement, vUv).r;
  vec2 base = coverUV(vUv);
  // Two crossed sine pairs at slightly detuned rates. They beat against each
  // other, so the whole image drifts like a slack water surface instead of
  // repeating on a visible loop.
  if (uJiggle > 0.0001) {
    vec2 q = vUv * uJiggleScale;
    float t = uTime * uJiggleSpeed;
    vec2 wobble = vec2(
      sin(q.y * 3.1 + t) * 0.6 + sin(q.y * 1.7 - q.x * 0.9 + t * 0.71) * 0.4,
      sin(q.x * 2.7 - t * 0.83) * 0.6 + sin(q.x * 1.3 + q.y * 1.1 + t * 0.57) * 0.4
    );
    base += wobble * uJiggle;
  }
  float theta = amount * uSwirl * TAU;
  vec2 dir = vec2(sin(theta), cos(theta));
  vec2 push = dir * amount * uStrength;
  vec3 color;
  if (uDispersion > 0.001) {
    float split = uDispersion * 0.25;
    color.r = texture2D(uTexture, base + push * (1.0 + split)).r;
    color.g = texture2D(uTexture, base + push).g;
    color.b = texture2D(uTexture, base + push * (1.0 - split)).b;
  } else {
    color = texture2D(uTexture, base + push).rgb;
  }
  if (uGrayscale > 0.001) {
    color = mix(color, vec3(dot(color, vec3(0.2126, 0.7152, 0.0722))), uGrayscale);
  }
  if (uTintAmount > 0.001) {
    color = mix(color, color * uTint * 1.9, clamp(amount * 1.6, 0.0, 1.0) * uTintAmount);
  }
  if (uGlint > 0.001) {
    float ex = texture2D(uDisplacement, vUv + vec2(uTexel.x, 0.0)).r - texture2D(uDisplacement, vUv - vec2(uTexel.x, 0.0)).r;
    float ey = texture2D(uDisplacement, vUv + vec2(0.0, uTexel.y)).r - texture2D(uDisplacement, vUv - vec2(0.0, uTexel.y)).r;
    vec3 normal = normalize(vec3(-ex * 26.0, -ey * 26.0, 1.0));
    vec3 light = normalize(vec3(-0.35, 0.55, 1.0));
    float raw = pow(max(dot(normal, light), 0.0), 22.0);
    float flatSpec = pow(max(light.z, 0.0), 22.0);
    color += uHighlight * clamp((raw - flatSpec) / max(1.0 - flatSpec, 0.0001), 0.0, 1.0) * uGlint;
  }
  gl_FragColor = vec4(color, 1.0);
}`

const hexToRGB = (hex) => {
  const clean = hex.replace("#", "")
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((character) => character + character)
          .join("")
      : clean
  const value = Number.parseInt(full, 16)
  if (Number.isNaN(value)) return [1, 1, 1]
  return [
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255,
  ]
}

// Adapted from the open-source React Bits RippleDistortion component. ART'hur
// suspends its render loop whenever the hover layer is inactive or hidden.
const RippleDistortion = ({
  src,
  jiggle = 0,
  jiggleScale = 2.6,
  jiggleSpeed = 1,
  brushSize = 150,
  strength = 0.2,
  swirl = 1,
  rings = 4,
  spread = 5,
  fade = 3,
  spacing = 15,
  dispersion = 0,
  glint = 0,
  tint = "#a855f7",
  tintAmount = 0.1,
  grayscale = true,
  highlightColor = "#ffffff",
  trigger = "hover",
  clickStrength = 2,
  quality = "low",
  enabled = true,
  className = "",
  style = undefined,
}) => {
  const mountRef = useRef(null)
  const configRef = useRef({
    brushSize,
    clickStrength,
    enabled,
    fade,
    jiggle,
    spacing,
    spread,
    trigger,
  })
  const uniformsRef = useRef(null)
  const loopRef = useRef(null)

  useEffect(() => {
    configRef.current = {
      brushSize,
      clickStrength,
      enabled,
      fade,
      jiggle,
      spacing,
      spread,
      trigger,
    }
  }, [
    brushSize,
    clickStrength,
    enabled,
    fade,
    jiggle,
    spacing,
    spread,
    trigger,
  ])

  // The render loop is otherwise driven by input waves alone, so the standing
  // field needs an explicit nudge when a hover turns it on.
  useEffect(() => {
    if (enabled && jiggle > 0) loopRef.current?.()
  }, [enabled, jiggle])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount || !src) return

    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches
    let renderer

    try {
      renderer = new Renderer({
        alpha: true,
        antialias: false,
        dpr: Math.min(window.devicePixelRatio || 1, 1.5),
      })
    } catch {
      mount.dataset.failed = "true"
      return
    }

    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    const canvas = gl.canvas
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    canvas.style.display = "block"
    mount.appendChild(canvas)

    const imageTexture = new Texture(gl, {
      generateMipmaps: false,
      magFilter: gl.LINEAR,
      minFilter: gl.LINEAR,
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE,
    })

    let disposed = false
    const image = new window.Image()
    image.crossOrigin = "anonymous"
    image.decoding = "async"

    const offsets = new Float32Array(MAX_WAVES * 2)
    const scales = new Float32Array(MAX_WAVES * 2)
    const opacities = new Float32Array(MAX_WAVES)
    const waves = Array.from({ length: MAX_WAVES }, () => ({
      opacity: 0,
      scale: START_SCALE,
      size: 1,
      target: START_SCALE,
      x: 0,
      y: 0,
    }))
    let current = 0

    const geometry = new Geometry(gl, {
      iOffset: { data: offsets, instanced: 1, size: 2 },
      iOpacity: { data: opacities, instanced: 1, size: 1 },
      iScale: { data: scales, instanced: 1, size: 2 },
      position: {
        data: new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        size: 2,
      },
      uv: {
        data: new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]),
        size: 2,
      },
    })
    const waveUniforms = { uRings: { value: rings } }
    const waveProgram = new Program(gl, {
      cullFace: false,
      depthTest: false,
      depthWrite: false,
      fragment: waveFragment,
      transparent: true,
      uniforms: waveUniforms,
      vertex: waveVertex,
    })
    waveProgram.setBlendFunc(gl.ONE, gl.ONE)
    const waveMesh = new Mesh(gl, {
      frustumCulled: false,
      geometry,
      program: waveProgram,
    })
    const displacementTarget = new RenderTarget(gl, {
      depth: false,
      height: 2,
      magFilter: gl.LINEAR,
      minFilter: gl.LINEAR,
      width: 2,
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE,
    })
    const compositeUniforms = {
      uDispersion: { value: dispersion },
      uDisplacement: { value: displacementTarget.texture },
      uGlint: { value: glint },
      uGrayscale: { value: grayscale ? 1 : 0 },
      uHighlight: { value: hexToRGB(highlightColor) },
      // Neutral at construction so changing the field never tears down the
      // GL context; the loop and the sync effect below own these.
      uJiggle: { value: 0 },
      uJiggleScale: { value: 1 },
      uJiggleSpeed: { value: 1 },
      uTime: { value: 0 },
      uResolution: { value: [1, 1] },
      uStrength: { value: strength },
      uSwirl: { value: swirl },
      uTexel: { value: [1, 1] },
      uTexture: { value: imageTexture },
      uTextureSize: { value: [1, 1] },
      uTint: { value: hexToRGB(tint) },
      uTintAmount: { value: tintAmount },
    }
    const compositeMesh = new Mesh(gl, {
      geometry: new Triangle(gl),
      program: new Program(gl, {
        depthTest: false,
        depthWrite: false,
        fragment: compositeFragment,
        uniforms: compositeUniforms,
        vertex: screenVertex,
      }),
    })
    uniformsRef.current = { composite: compositeUniforms, wave: waveUniforms }

    let width = 1
    let height = 1
    let raf = 0
    let previousTime = 0
    let elapsed = 0
    // setNewWave asks for a frame, and the loop calls it. This flag keeps that
    // from queueing a second one.
    let running = false

    const renderComposite = () => {
      renderer.render({
        clear: true,
        scene: waveMesh,
        target: displacementTarget,
      })
      renderer.render({ scene: compositeMesh })
    }

    const resize = () => {
      width = Math.max(1, mount.clientWidth)
      height = Math.max(1, mount.clientHeight)
      renderer.setSize(width, height)
      compositeUniforms.uResolution.value = [width, height]
      const qualityScale = QUALITY_SCALE[quality] || QUALITY_SCALE.low
      const fieldWidth = Math.max(2, Math.round(width * qualityScale))
      const fieldHeight = Math.max(2, Math.round(height * qualityScale))
      displacementTarget.setSize(fieldWidth, fieldHeight)
      compositeUniforms.uTexel.value = [1 / fieldWidth, 1 / fieldHeight]
      renderComposite()
    }

    const observer = new ResizeObserver(resize)
    observer.observe(mount)
    resize()

    const stopLoop = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      previousTime = 0
    }

    const loop = (now) => {
      raf = 0
      running = true
      const config = configRef.current
      if (reduceMotion || document.hidden) {
        for (let index = 0; index < MAX_WAVES; index += 1) {
          waves[index].opacity = 0
          opacities[index] = 0
        }
        geometry.attributes.iOpacity.needsUpdate = true
        renderComposite()
        previousTime = 0
        running = false
        return
      }

      const delta = previousTime
        ? Math.min(0.05, (now - previousTime) / 1000)
        : 0
      previousTime = now
      // Leaving the frame stops the field and any new waves, but lets the
      // standing ones decay, so the image settles instead of snapping flat.
      const fieldActive = config.enabled && config.jiggle > 0
      compositeUniforms.uJiggle.value = fieldActive ? config.jiggle : 0
      if (fieldActive) {
        elapsed += delta
        compositeUniforms.uTime.value = elapsed
      }
      const growth = 1 - Math.exp(-delta * 1.09)
      const decay = Math.exp(
        (-delta * LIFE_CONSTANT) / Math.max(0.15, config.fade)
      )
      let hasVisibleWave = false

      for (let index = 0; index < MAX_WAVES; index += 1) {
        const wave = waves[index]
        if (wave.opacity <= 0) {
          opacities[index] = 0
          continue
        }

        wave.opacity *= decay
        wave.scale += (wave.target - wave.scale) * growth
        if (wave.opacity < 0.002) {
          wave.opacity = 0
          opacities[index] = 0
          continue
        }

        hasVisibleWave = true
        const half = (wave.scale * wave.size) / 2
        offsets[index * 2] = (wave.x / width) * 2 - 1
        offsets[index * 2 + 1] = (wave.y / height) * 2 - 1
        scales[index * 2] = (half / width) * 2
        scales[index * 2 + 1] = (half / height) * 2
        opacities[index] = wave.opacity
      }

      geometry.attributes.iOffset.needsUpdate = true
      geometry.attributes.iScale.needsUpdate = true
      geometry.attributes.iOpacity.needsUpdate = true
      renderComposite()
      running = false
      if (hasVisibleWave || fieldActive) raf = requestAnimationFrame(loop)
      else previousTime = 0
    }

    const startLoop = () => {
      if (
        !raf &&
        !running &&
        !reduceMotion &&
        configRef.current.enabled &&
        !document.hidden
      )
        raf = requestAnimationFrame(loop)
    }
    loopRef.current = startLoop

    function setNewWave(x, y, power) {
      const config = configRef.current
      const wave = waves[current]
      current = (current + 1) % MAX_WAVES
      wave.x = x
      wave.y = y
      wave.scale = START_SCALE * power
      wave.target = START_SCALE * Math.max(1, config.spread) * power
      wave.size = Math.max(1, config.brushSize)
      wave.opacity = 1
      startLoop()
    }

    const localPoint = (clientX, clientY) => {
      const bounds = mount.getBoundingClientRect()
      if (bounds.width === 0 || bounds.height === 0) return null
      if (
        clientX < bounds.left ||
        clientX > bounds.right ||
        clientY < bounds.top ||
        clientY > bounds.bottom
      )
        return null
      return [clientX - bounds.left, bounds.height - (clientY - bounds.top)]
    }

    let previousX = 0
    let previousY = 0
    const onMove = (event) => {
      const config = configRef.current
      if (!config.enabled || reduceMotion || config.trigger === "click") return
      const point = localPoint(event.clientX, event.clientY)
      if (!point) return
      const step = Math.max(1, config.spacing)
      if (
        Math.abs(point[0] - previousX) > step ||
        Math.abs(point[1] - previousY) > step
      ) {
        setNewWave(point[0], point[1], 1)
        previousX = point[0]
        previousY = point[1]
      }
    }

    const onDown = (event) => {
      const config = configRef.current
      if (!config.enabled || reduceMotion || config.trigger === "hover") return
      const point = localPoint(event.clientX, event.clientY)
      if (!point) return
      setNewWave(point[0], point[1], Math.max(1, config.clickStrength))
    }

    const onVisibilityChange = () => {
      if (document.hidden) stopLoop()
      else renderComposite()
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("pointerdown", onDown, { passive: true })
    document.addEventListener("visibilitychange", onVisibilityChange)

    image.onload = () => {
      if (disposed) return
      imageTexture.image = image
      compositeUniforms.uTextureSize.value = [
        image.naturalWidth || 1,
        image.naturalHeight || 1,
      ]
      renderComposite()
    }
    image.src = src

    if (configRef.current.jiggle > 0) startLoop()

    return () => {
      disposed = true
      stopLoop()
      observer.disconnect()
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerdown", onDown)
      document.removeEventListener("visibilitychange", onVisibilityChange)
      uniformsRef.current = null
      loopRef.current = null
      if (canvas.parentNode === mount) mount.removeChild(canvas)
      gl.getExtension("WEBGL_lose_context")?.loseContext()
    }
  }, [
    dispersion,
    glint,
    grayscale,
    highlightColor,
    quality,
    rings,
    src,
    strength,
    swirl,
    tint,
    tintAmount,
  ])

  useEffect(() => {
    const uniforms = uniformsRef.current
    if (!uniforms) return
    uniforms.wave.uRings.value = rings
    uniforms.composite.uStrength.value = strength
    uniforms.composite.uSwirl.value = swirl
    uniforms.composite.uDispersion.value = dispersion
    uniforms.composite.uGlint.value = glint
    uniforms.composite.uTintAmount.value = tintAmount
    uniforms.composite.uGrayscale.value = grayscale ? 1 : 0
    uniforms.composite.uHighlight.value = hexToRGB(highlightColor)
    uniforms.composite.uTint.value = hexToRGB(tint)
    uniforms.composite.uJiggleScale.value = jiggleScale
    uniforms.composite.uJiggleSpeed.value = jiggleSpeed
  }, [
    dispersion,
    glint,
    grayscale,
    highlightColor,
    jiggleScale,
    jiggleSpeed,
    rings,
    strength,
    swirl,
    tint,
    tintAmount,
  ])

  return (
    <div
      ref={mountRef}
      className={`ripple-distortion ${className}`.trim()}
      data-enabled={enabled ? "true" : "false"}
      style={style}
    />
  )
}

export default RippleDistortion
