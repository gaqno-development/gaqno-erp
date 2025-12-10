import { IFinanceCategory } from '../types/finance'

const FALLBACK_COLOR = '#3B82F6'

export function getCategoryNameFromIcon(
  iconName: string | null | undefined,
  categories?: IFinanceCategory[]
): string | null {
  if (!iconName) return null

  if (categories && categories.length > 0) {
    const category = categories.find((cat) => cat.icon === iconName)
    if (category) return category.name
  }

  return null
}

export function getDefaultColorForCategory(
  categoryName: string,
  categories?: IFinanceCategory[]
): string {
  if (categories && categories.length > 0) {
    const category = categories.find((cat) => cat.name === categoryName)
    if (category?.color) return category.color
  }

  return FALLBACK_COLOR
}

export function getCategoryNameFromLegacyIcon(
  iconName: string | null | undefined,
  categories?: IFinanceCategory[]
): string | null {
  if (!iconName) return null

  if (categories && categories.length > 0) {
    const category = categories.find((cat) => cat.icon === iconName)
    if (category) return category.name
  }

  return 'Outros'
}

