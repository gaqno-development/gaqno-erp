import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@repo/core/types/database'
import {
  IBookToneStyle,
  ICreateBookToneStyleInput,
  IUpdateBookToneStyleInput,
} from '../types/books'

export class BookToneStyleService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getToneStyle(bookId: string): Promise<IBookToneStyle | null> {
    const { data, error } = await this.supabase
      .from('book_tone_style')
      .select('*')
      .eq('book_id', bookId)
      .maybeSingle()

    if (error) throw error
    return data as IBookToneStyle | null
  }

  async createToneStyle(input: ICreateBookToneStyleInput): Promise<IBookToneStyle> {
    const insertData = {
      book_id: input.book_id,
      narrative_tone: input.narrative_tone || null,
      pacing: input.pacing || null,
      target_audience: input.target_audience || null,
      central_themes: input.central_themes || null,
      metadata: input.metadata || {},
    }

    const { data, error } = await (this.supabase
      .from('book_tone_style') as any)
      .insert([insertData])
      .select()
      .single()

    if (error) throw error
    return data as IBookToneStyle
  }

  async updateToneStyle(
    bookId: string,
    input: IUpdateBookToneStyleInput
  ): Promise<IBookToneStyle> {
    const updateData: any = {}

    if (input.narrative_tone !== undefined) updateData.narrative_tone = input.narrative_tone
    if (input.pacing !== undefined) updateData.pacing = input.pacing
    if (input.target_audience !== undefined) updateData.target_audience = input.target_audience
    if (input.central_themes !== undefined) updateData.central_themes = input.central_themes
    if (input.metadata !== undefined) updateData.metadata = input.metadata

    const existing = await this.getToneStyle(bookId)

    if (existing) {
      const { data, error } = await (this.supabase
        .from('book_tone_style') as any)
        .update(updateData)
        .eq('book_id', bookId)
        .select()
        .single()

      if (error) throw error
      return data as IBookToneStyle
    } else {
      return this.createToneStyle({
        book_id: bookId,
        ...input,
      })
    }
  }

  async deleteToneStyle(bookId: string): Promise<void> {
    const { error } = await (this.supabase
      .from('book_tone_style') as any)
      .delete()
      .eq('book_id', bookId)

    if (error) throw error
  }
}

