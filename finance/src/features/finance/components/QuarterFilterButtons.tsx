'use client'

import { Button } from '@repo/ui/components/ui'

interface IQuarterFilterButtonsProps {
  selectedQuarter: string
  onQuarterChange: (quarter: string) => void
  variant?: 'desktop' | 'mobile'
}

export function QuarterFilterButtons({
  selectedQuarter,
  onQuarterChange,
  variant = 'desktop',
}: IQuarterFilterButtonsProps) {
  const isDesktop = variant === 'desktop'
  const containerClassName = isDesktop
    ? 'hidden md:flex gap-1'
    : 'flex md:hidden gap-1 flex-1'

  const buttonClassName = isDesktop ? '' : 'flex-1 text-xs'
  const allLabel = isDesktop ? 'All Months' : 'All'

  return (
    <div className={containerClassName}>
      <Button
        variant={selectedQuarter === 'all' ? 'default' : 'ghost'}
        size="sm"
        className={buttonClassName}
        onClick={() => onQuarterChange('all')}
      >
        {allLabel}
      </Button>
      <Button
        variant={selectedQuarter === 'q1' ? 'default' : 'ghost'}
        size="sm"
        className={buttonClassName}
        onClick={() => onQuarterChange('q1')}
      >
        Q1
      </Button>
      <Button
        variant={selectedQuarter === 'q2' ? 'default' : 'ghost'}
        size="sm"
        className={buttonClassName}
        onClick={() => onQuarterChange('q2')}
      >
        Q2
      </Button>
      <Button
        variant={selectedQuarter === 'q3' ? 'default' : 'ghost'}
        size="sm"
        className={buttonClassName}
        onClick={() => onQuarterChange('q3')}
      >
        Q3
      </Button>
      <Button
        variant={selectedQuarter === 'q4' ? 'default' : 'ghost'}
        size="sm"
        className={buttonClassName}
        onClick={() => onQuarterChange('q4')}
      >
        Q4
      </Button>
    </div>
  )
}

