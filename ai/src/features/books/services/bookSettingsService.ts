import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@repo/core/types/database'
import {
  IBookSetting,
  ICreateBookSettingInput,
  IUpdateBookSettingInput,
} from '../types/books'

export class BookSettingsService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getSettings(bookId: string): Promise<IBookSetting[]> {
    const { data, error } = await this.supabase
      .from('book_settings')
      .select('*')
      .eq('book_id', bookId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return (data || []) as IBookSetting[]
  }

  async getSettingById(settingId: string): Promise<IBookSetting | null> {
    const { data, error } = await this.supabase
      .from('book_settings')
      .select('*')
      .eq('id', settingId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as IBookSetting | null
  }

  async createSetting(input: ICreateBookSettingInput): Promise<IBookSetting> {
    const insertData = {
      book_id: input.book_id,
      name: input.name,
      description: input.description || null,
      timeline_summary: input.timeline_summary || null,
      metadata: input.metadata || {},
    }

    const { data, error } = await (this.supabase
      .from('book_settings') as any)
      .insert([insertData])
      .select()
      .single()

    if (error) throw error
    return data as IBookSetting
  }

  async updateSetting(
    settingId: string,
    input: IUpdateBookSettingInput
  ): Promise<IBookSetting> {
    const updateData: any = {}

    if (input.name !== undefined) updateData.name = input.name
    if (input.description !== undefined) updateData.description = input.description
    if (input.timeline_summary !== undefined) updateData.timeline_summary = input.timeline_summary
    if (input.metadata !== undefined) updateData.metadata = input.metadata

    const { data, error } = await (this.supabase
      .from('book_settings') as any)
      .update(updateData)
      .eq('id', settingId)
      .select()
      .single()

    if (error) throw error
    return data as IBookSetting
  }

  async deleteSetting(settingId: string): Promise<void> {
    const { error } = await (this.supabase
      .from('book_settings') as any)
      .delete()
      .eq('id', settingId)

    if (error) throw error
  }
}

