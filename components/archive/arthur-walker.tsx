import Image from "next/image"

const FRAME_COUNT = 15

export function ArthurWalker() {
  return (
    <div className="timeline-walker-frames" aria-hidden="true">
      {Array.from({ length: FRAME_COUNT }, (_, index) => (
        <Image
          key={index}
          className="timeline-walker-frame"
          data-walk-frame={index}
          src={`/brand/gei-walk/frame-${String(index + 1).padStart(2, "0")}.png`}
          alt=""
          width={82}
          height={82}
          draggable={false}
          priority={index === 0}
          style={{ opacity: index === 0 ? 1 : 0 }}
        />
      ))}
    </div>
  )
}

export const ARTHUR_WALK_FRAME_COUNT = FRAME_COUNT
