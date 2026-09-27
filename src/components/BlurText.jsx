import ScrollReveal from './ScrollReveal'

export default function BlurText({
  text = '',
  children,
  className = '',
  style = {},
  tag = 'h2',
  ...props
}) {
  return (
    <ScrollReveal
      tag={tag}
      containerClassName={className}
      textClassName={className}
      style={style}
      {...props}
    >
      {text || children}
    </ScrollReveal>
  )
}
