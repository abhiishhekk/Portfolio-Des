import ScrollReveal from './ScrollReveal'

export default function FadeContent({
  children,
  className = '',
  style = {},
  blur = false,
  blurStrength = 4,
  baseOpacity = 0.2,
  start = 'top 92%',
  end = 'bottom 68%',
  scrub = 0.8,
  tag = 'div',
}) {
  return (
    <ScrollReveal
      tag={tag}
      containerClassName={className}
      style={style}
      enableBlur={blur}
      blurStrength={blurStrength}
      baseOpacity={baseOpacity}
      baseRotation={0}
      start={start}
      end={end}
      scrub={scrub}
    >
      {children}
    </ScrollReveal>
  )
}
