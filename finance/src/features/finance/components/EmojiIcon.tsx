import * as React from 'react'

interface IEmojiIconProps {
  emoji: string
  className?: string
}

export const EmojiIcon = React.forwardRef<HTMLSpanElement, IEmojiIconProps>(
  ({ emoji, className }, ref) => {
    return (
      <span ref={ref} className={className} role="img" aria-label={emoji}>
        {emoji}
      </span>
    )
  }
)

EmojiIcon.displayName = 'EmojiIcon'

