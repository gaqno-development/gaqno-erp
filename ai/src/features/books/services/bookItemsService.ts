import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@repo/core/types/database'
import {
  IBookItem,
  ICreateBookItemInput,
  IUpdateBookItemInput,
} from '../types/books'

export class BookItemsService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getItems(bookId: string): Promise<IBookItem[]> {
    const { data, error } = await this.supabase
      .from('book_items')
      .select('*')
      .eq('book_id', bookId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return (data || []) as IBookItem[]
  }

  async getItemById(itemId: string): Promise<IBookItem | null> {
    const { data, error } = await this.supabase
      .from('book_items')
      .select('*')
      .eq('id', itemId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as IBookItem | null
  }

  async createItem(input: ICreateBookItemInput): Promise<IBookItem> {
    const insertData = {
      book_id: input.book_id,
      name: input.name,
      function: input.function || null,
      origin: input.origin || null,
      relevance: input.relevance || null,
      metadata: input.metadata || {},
    }

    const { data, error } = await (this.supabase
      .from('book_items') as any)
      .insert([insertData])
      .select()
      .single()

    if (error) throw error
    return data as IBookItem
  }

  async updateItem(
    itemId: string,
    input: IUpdateBookItemInput
  ): Promise<IBookItem> {
    const updateData: any = {}

    if (input.name !== undefined) updateData.name = input.name
    if (input.function !== undefined) updateData.function = input.function
    if (input.origin !== undefined) updateData.origin = input.origin
    if (input.relevance !== undefined) updateData.relevance = input.relevance
    if (input.metadata !== undefined) updateData.metadata = input.metadata

    const { data, error } = await (this.supabase
      .from('book_items') as any)
      .update(updateData)
      .eq('id', itemId)
      .select()
      .single()

    if (error) throw error
    return data as IBookItem
  }

  async deleteItem(itemId: string): Promise<void> {
    const { error } = await this.supabase
      .from('book_items')
      .delete()
      .eq('id', itemId)

    if (error) throw error
  }
}

