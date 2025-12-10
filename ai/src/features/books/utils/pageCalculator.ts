export interface IPageRange {
  min: number
  max: number
  average: number
}

export const WORDS_PER_PAGE_BY_GENRE: Record<string, IPageRange> = {
  'romance': { min: 70000, max: 120000, average: 95000 },
  'romance-adulto': { min: 70000, max: 120000, average: 95000 },
  'adult-romance': { min: 70000, max: 120000, average: 95000 },
  'non-fiction': { min: 50000, max: 90000, average: 70000 },
  'não-ficção': { min: 50000, max: 90000, average: 70000 },
  'nao-ficcao': { min: 50000, max: 90000, average: 70000 },
  'fiction': { min: 50000, max: 90000, average: 70000 },
  'ficção': { min: 50000, max: 90000, average: 70000 },
  'ficcao': { min: 50000, max: 90000, average: 70000 },
  'ya': { min: 40000, max: 80000, average: 60000 },
  'young-adult': { min: 40000, max: 80000, average: 60000 },
  'jovens-adultos': { min: 40000, max: 80000, average: 60000 },
  'novella': { min: 18000, max: 40000, average: 29000 },
  'novela': { min: 18000, max: 40000, average: 29000 },
  'novelette': { min: 7500, max: 17500, average: 12500 },
  'noveleta': { min: 7500, max: 17500, average: 12500 },
  'short-story': { min: 0, max: 7500, average: 3750 },
  'conto': { min: 0, max: 7500, average: 3750 },
  'children': { min: 0, max: 1000, average: 500 },
  'infantil': { min: 0, max: 1000, average: 500 },
  'livro-infantil': { min: 0, max: 1000, average: 500 },
  'ebook-non-fiction': { min: 8000, max: 16000, average: 12000 },
  'ebook': { min: 8000, max: 16000, average: 12000 },
}

const DEFAULT_WORDS_PER_PAGE = 250
const DEFAULT_GENRE_RANGE = { min: 50000, max: 90000, average: 70000 }

export function calculatePages(wordCount: number, genre?: string | null): number {
  const wordsPerPage = DEFAULT_WORDS_PER_PAGE
  return Math.ceil(wordCount / wordsPerPage)
}

export function getGenrePageRange(genre?: string | null): IPageRange {
  if (!genre) return DEFAULT_GENRE_RANGE

  const genreKey = genre.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
  
  for (const [key, range] of Object.entries(WORDS_PER_PAGE_BY_GENRE)) {
    if (genreKey === key || genreKey.includes(key) || key.includes(genreKey)) {
      return range
    }
  }

  if (genreKey.includes('romance') && !genreKey.includes('young')) {
    return WORDS_PER_PAGE_BY_GENRE['romance']
  }

  if (genreKey.includes('ficção') || genreKey.includes('ficcao') || genreKey.includes('fiction')) {
    if (!genreKey.includes('não') && !genreKey.includes('nao') && !genreKey.includes('non')) {
      return WORDS_PER_PAGE_BY_GENRE['fiction']
    }
  }

  return DEFAULT_GENRE_RANGE
}

export function calculateTotalPages(wordCount: number, genre?: string | null): {
  pages: number
  range: IPageRange
  isWithinRange: boolean
} {
  const pages = calculatePages(wordCount, genre)
  const range = getGenrePageRange(genre)
  const totalWords = wordCount
  const isWithinRange = totalWords >= range.min && totalWords <= range.max

  return {
    pages,
    range,
    isWithinRange,
  }
}

export function formatPageInfo(wordCount: number, genre?: string | null): string {
  const { pages, range, isWithinRange } = calculateTotalPages(wordCount, genre)
  
  if (isWithinRange) {
    return `${pages} páginas (${wordCount.toLocaleString()} palavras)`
  }
  
  if (wordCount < range.min) {
    const missing = range.min - wordCount
    return `${pages} páginas (${wordCount.toLocaleString()} palavras) • Faltam ~${missing.toLocaleString()} palavras para o mínimo do gênero`
  }
  
  const excess = wordCount - range.max
  return `${pages} páginas (${wordCount.toLocaleString()} palavras) • ${excess.toLocaleString()} palavras acima do máximo do gênero`
}

