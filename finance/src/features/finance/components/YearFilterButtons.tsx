'use client'

import { Button } from '@repo/ui/components/ui'

interface IYearFilterButtonsProps {
  availableYears: number[]
  selectedYear: number
  onYearChange: (year: number) => void
  variant?: 'desktop' | 'mobile'
}

export function YearFilterButtons({
  availableYears,
  selectedYear,
  onYearChange,
  variant = 'desktop',
}: IYearFilterButtonsProps) {
  const isDesktop = variant === 'desktop'
  const containerClassName = isDesktop
    ? 'hidden md:flex gap-1 border-l pl-2 ml-2'
    : 'flex md:hidden gap-1'

  const buttonClassName = isDesktop ? '' : 'text-xs'

  return (
    <div className={containerClassName}>
      {availableYears.map((year) => (
        <Button
          key={year}
          variant={selectedYear === year ? 'default' : 'ghost'}
          size="sm"
          className={buttonClassName}
          onClick={() => onYearChange(year)}
        >
          {year}
        </Button>
      ))}
    </div>
  )
}

