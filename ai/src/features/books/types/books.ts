export enum BookStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  PUBLISHED = 'published',
}

export enum ChapterStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  COMPLETED = 'completed',
}

export enum ExportFormat {
  PDF = 'pdf',
  EPUB = 'epub',
  DOCX = 'docx',
  MARKDOWN = 'markdown',
  KDP = 'kdp',
}

export enum ExportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface IBook {
  id: string
  tenant_id: string
  user_id: string
  title: string
  genre?: string | null
  description?: string | null
  style?: string | null
  status: BookStatus
  cover_image_url?: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ICreateBookInput {
  title: string
  genre?: string | null
  description?: string | null
  style?: string | null
  status?: BookStatus
  metadata?: Record<string, any>
}

export interface IUpdateBookInput {
  title?: string
  genre?: string | null
  description?: string | null
  style?: string | null
  status?: BookStatus
  cover_image_url?: string | null
  metadata?: Record<string, any>
}

export interface IBookBlueprint {
  id: string
  book_id: string
  summary?: string | null
  structure: Record<string, any>
  characters: any[]
  context: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ICreateBookBlueprintInput {
  book_id: string
  summary?: string | null
  structure?: Record<string, any>
  characters?: any[]
  context?: Record<string, any>
}

export interface IUpdateBookBlueprintInput {
  summary?: string | null
  structure?: Record<string, any>
  characters?: any[]
  context?: Record<string, any>
}

export interface IBookChapter {
  id: string
  book_id: string
  chapter_number: number
  title?: string | null
  content?: string | null
  status: ChapterStatus
  notes?: string | null
  metadata: Record<string, any>
  word_count: number
  created_at: string
  updated_at: string
}

export interface ICreateBookChapterInput {
  book_id: string
  chapter_number: number
  title?: string | null
  content?: string | null
  status?: ChapterStatus
  notes?: string | null
  metadata?: Record<string, any>
}

export interface IUpdateBookChapterInput {
  title?: string | null
  content?: string | null
  status?: ChapterStatus
  notes?: string | null
  metadata?: Record<string, any>
}

export interface IBookCover {
  id: string
  book_id: string
  template_id?: string | null
  design_data: Record<string, any>
  image_url?: string | null
  preview_3d_url?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ICreateBookCoverInput {
  book_id: string
  template_id?: string | null
  design_data?: Record<string, any>
  image_url?: string | null
  preview_3d_url?: string | null
  is_active?: boolean
}

export interface IUpdateBookCoverInput {
  template_id?: string | null
  design_data?: Record<string, any>
  image_url?: string | null
  preview_3d_url?: string | null
  is_active?: boolean
}

export interface IBookHistory {
  id: string
  chapter_id: string
  content_snapshot: string
  version_number: number
  change_summary?: string | null
  created_at: string
  created_by?: string | null
}

export interface ICreateBookHistoryInput {
  chapter_id: string
  content_snapshot: string
  version_number: number
  change_summary?: string | null
}

import { ICharacterDetails } from './character'

export interface IBookCharacter {
  id: string
  book_id: string
  name: string
  description?: string | null
  avatar_url?: string | null
  metadata: Record<string, any> & {
    characterDetails?: ICharacterDetails
  }
  created_at: string
  updated_at: string
}

export interface ICreateBookCharacterInput {
  book_id: string
  name: string
  description?: string | null
  avatar_url?: string | null
  metadata?: Record<string, any>
}

export interface IUpdateBookCharacterInput {
  name?: string
  description?: string | null
  avatar_url?: string | null
  metadata?: Record<string, any>
}

export interface IBookGlossary {
  id: string
  book_id: string
  term: string
  definition: string
  created_at: string
  updated_at: string
}

export interface ICreateBookGlossaryInput {
  book_id: string
  term: string
  definition: string
}

export interface IUpdateBookGlossaryInput {
  term?: string
  definition?: string
}

export interface IBookExport {
  id: string
  book_id: string
  format: ExportFormat
  file_url?: string | null
  metadata: Record<string, any>
  status: ExportStatus
  created_at: string
  completed_at?: string | null
}

export interface ICreateBookExportInput {
  book_id: string
  format: ExportFormat
  file_url?: string | null
  metadata?: Record<string, any>
  status?: ExportStatus
}

export interface IUpdateBookExportInput {
  file_url?: string | null
  metadata?: Record<string, any>
  status?: ExportStatus
  completed_at?: string | null
}

export interface IBookSetting {
  id: string
  book_id: string
  name: string
  description?: string | null
  timeline_summary?: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ICreateBookSettingInput {
  book_id: string
  name: string
  description?: string | null
  timeline_summary?: string | null
  metadata?: Record<string, any>
}

export interface IUpdateBookSettingInput {
  name?: string
  description?: string | null
  timeline_summary?: string | null
  metadata?: Record<string, any>
}

export interface IBookItem {
  id: string
  book_id: string
  name: string
  function?: string | null
  origin?: string | null
  relevance?: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ICreateBookItemInput {
  book_id: string
  name: string
  function?: string | null
  origin?: string | null
  relevance?: string | null
  metadata?: Record<string, any>
}

export interface IUpdateBookItemInput {
  name?: string
  function?: string | null
  origin?: string | null
  relevance?: string | null
  metadata?: Record<string, any>
}

export interface IBookToneStyle {
  id: string
  book_id: string
  narrative_tone?: string | null
  pacing?: string | null
  target_audience?: string | null
  central_themes?: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ICreateBookToneStyleInput {
  book_id: string
  narrative_tone?: string | null
  pacing?: string | null
  target_audience?: string | null
  central_themes?: string | null
  metadata?: Record<string, any>
}

export interface IUpdateBookToneStyleInput {
  narrative_tone?: string | null
  pacing?: string | null
  target_audience?: string | null
  central_themes?: string | null
  metadata?: Record<string, any>
}
