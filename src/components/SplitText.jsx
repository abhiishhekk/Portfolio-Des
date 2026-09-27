import ScrollReveal from './ScrollReveal'

export default function SplitText({
  text = '',
  children,
  className = '',
  style = {},
  tag = 'span',
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
