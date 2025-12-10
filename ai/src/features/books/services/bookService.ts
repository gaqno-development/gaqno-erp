import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@repo/core/types/database'
import {
  IBook,
  IBookBlueprint,
  IBookChapter,
  IBookCover,
  IBookHistory,
  IBookCharacter,
  IBookGlossary,
  IBookExport,
  ICreateBookInput,
  IUpdateBookInput,
  ICreateBookBlueprintInput,
  IUpdateBookBlueprintInput,
  ICreateBookChapterInput,
  IUpdateBookChapterInput,
  ICreateBookCoverInput,
  IUpdateBookCoverInput,
  ICreateBookHistoryInput,
  ICreateBookCharacterInput,
  IUpdateBookCharacterInput,
  ICreateBookGlossaryInput,
  IUpdateBookGlossaryInput,
  ICreateBookExportInput,
  IUpdateBookExportInput,
} from '../types/books'

export class BookService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getBooks(tenantId: string | null, userId: string): Promise<IBook[]> {
    let query = this.supabase
      .from('books')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (tenantId) {
      query = query.eq('tenant_id', tenantId)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []) as IBook[]
  }

  async getBookById(bookId: string): Promise<IBook | null> {
    const { data, error } = await this.supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single()

    if (error) throw error
    return data as IBook | null
  }

  async createBook(
    tenantId: string | null,
    userId: string,
    input: ICreateBookInput
  ): Promise<IBook> {
    const insertData = {
      tenant_id: tenantId || '',
      user_id: userId,
      title: input.title,
      genre: input.genre || null,
      description: input.description || null,
      style: input.style || null,
      status: input.status || 'draft',
      metadata: input.metadata || {},
    }

    const { data, error } = await (this.supabase
      .from('books') as any)
      .insert([insertData])
      .select()
      .single()

    if (error) throw error
    return data as IBook
  }

  async updateBook(bookId: string, input: IUpdateBookInput): Promise<IBook> {
    const updateData: any = {}

    if (input.title !== undefined) updateData.title = input.title
    if (input.genre !== undefined) updateData.genre = input.genre
    if (input.description !== undefined) updateData.description = input.description
    if (input.style !== undefined) updateData.style = input.style
    if (input.status !== undefined) updateData.status = input.status
    if (input.cover_image_url !== undefined) updateData.cover_image_url = input.cover_image_url
    if (input.metadata !== undefined) updateData.metadata = input.metadata

    const { data, error } = await (this.supabase
      .from('books') as any)
      .update(updateData)
      .eq('id', bookId)
      .select()
      .single()

    if (error) throw error
    return data as IBook
  }

  async deleteBook(bookId: string): Promise<void> {
    const { error } = await (this.supabase
      .from('books') as any)
      .delete()
      .eq('id', bookId)

    if (error) throw error
  }

  async getBlueprint(bookId: string): Promise<IBookBlueprint | null> {
    const { data, error } = await this.supabase
      .from('book_blueprints')
      .select('*')
      .eq('book_id', bookId)
      .maybeSingle()

    if (error) throw error
    return data as IBookBlueprint | null
  }

  async createBlueprint(input: ICreateBookBlueprintInput): Promise<IBookBlueprint> {
    const insertData = {
      book_id: input.book_id,
      summary: input.summary || null,
      structure: input.structure || {},
      characters: input.characters || [],
      context: input.context || {},
    }

    const { data, error } = await (this.supabase
      .from('book_blueprints') as any)
      .insert([insertData])
      .select()
      .single()

    if (error) throw error
    return data as IBookBlueprint
  }

  async updateBlueprint(
    bookId: string,
    input: IUpdateBookBlueprintInput
  ): Promise<IBookBlueprint> {
    const existing = await this.getBlueprint(bookId)

    if (!existing) {
      return this.createBlueprint({
        book_id: bookId,
        summary: input.summary || null,
        structure: input.structure || {},
        characters: input.characters || [],
        context: input.context || {},
      })
    }

    const updateData: any = {}

    if (input.summary !== undefined) updateData.summary = input.summary
    if (input.structure !== undefined) updateData.structure = input.structure
    if (input.characters !== undefined) updateData.characters = input.characters
    if (input.context !== undefined) updateData.context = input.context

    const { data, error } = await (this.supabase
      .from('book_blueprints') as any)
      .update(updateData)
      .eq('book_id', bookId)
      .select()
      .single()

    if (error) throw error
    return data as IBookBlueprint
  }

  async getChapters(bookId: string): Promise<IBookChapter[]> {
    const { data, error } = await this.supabase
      .from('book_chapters')
      .select('*')
      .eq('book_id', bookId)
      .order('chapter_number', { ascending: true })

    if (error) throw error
    return (data || []) as IBookChapter[]
  }

  async getChapterById(chapterId: string): Promise<IBookChapter | null> {
    const { data, error } = await this.supabase
      .from('book_chapters')
      .select('*')
      .eq('id', chapterId)
      .single()

    if (error) throw error
    return data as IBookChapter | null
  }

  async createChapter(input: ICreateBookChapterInput): Promise<IBookChapter> {
    const insertData = {
      book_id: input.book_id,
      chapter_number: input.chapter_number,
      title: input.title || null,
      content: input.content || null,
      status: input.status || 'draft',
      notes: input.notes || null,
      metadata: input.metadata || {},
    }

    const { data, error } = await (this.supabase
      .from('book_chapters') as any)
      .insert([insertData])
      .select()
      .single()

    if (error) throw error
    return data as IBookChapter
  }

  async updateChapter(
    chapterId: string,
    input: IUpdateBookChapterInput
  ): Promise<IBookChapter> {
    const updateData: any = {}

    if (input.title !== undefined) updateData.title = input.title
    if (input.content !== undefined) updateData.content = input.content
    if (input.status !== undefined) updateData.status = input.status
    if (input.notes !== undefined) updateData.notes = input.notes
    if (input.metadata !== undefined) updateData.metadata = input.metadata

    const { data, error } = await (this.supabase
      .from('book_chapters') as any)
      .update(updateData)
      .eq('id', chapterId)
      .select()
      .single()

    if (error) throw error
    return data as IBookChapter
  }

  async deleteChapter(chapterId: string): Promise<void> {
    const { error } = await (this.supabase
      .from('book_chapters') as any)
      .delete()
      .eq('id', chapterId)

    if (error) throw error
  }

  async getCovers(bookId: string): Promise<IBookCover[]> {
    const { data, error } = await this.supabase
      .from('book_covers')
      .select('*')
      .eq('book_id', bookId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as IBookCover[]
  }

  async getActiveCover(bookId: string): Promise<IBookCover | null> {
    const { data, error } = await this.supabase
      .from('book_covers')
      .select('*')
      .eq('book_id', bookId)
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as IBookCover | null
  }

  async createCover(input: ICreateBookCoverInput): Promise<IBookCover> {
    if (input.is_active) {
      await (this.supabase
        .from('book_covers') as any)
        .update({ is_active: false })
        .eq('book_id', input.book_id)
    }

    const insertData = {
      book_id: input.book_id,
      template_id: input.template_id || null,
      design_data: input.design_data || {},
      image_url: input.image_url || null,
      preview_3d_url: input.preview_3d_url || null,
      is_active: input.is_active || false,
    }

    const { data, error } = await (this.supabase
      .from('book_covers') as any)
      .insert([insertData])
      .select()
      .single()

    if (error) throw error
    return data as IBookCover
  }

  async updateCover(coverId: string, input: IUpdateBookCoverInput): Promise<IBookCover> {
    if (input.is_active) {
      const { data: cover } = await (this.supabase
        .from('book_covers') as any)
        .select('book_id')
        .eq('id', coverId)
        .single()

      if (cover) {
        await (this.supabase
          .from('book_covers') as any)
          .update({ is_active: false })
          .eq('book_id', cover.book_id)
          .neq('id', coverId)
      }
    }

    const updateData: any = {}

    if (input.template_id !== undefined) updateData.template_id = input.template_id
    if (input.design_data !== undefined) updateData.design_data = input.design_data
    if (input.image_url !== undefined) updateData.image_url = input.image_url
    if (input.preview_3d_url !== undefined) updateData.preview_3d_url = input.preview_3d_url
    if (input.is_active !== undefined) updateData.is_active = input.is_active

    const { data, error } = await (this.supabase
      .from('book_covers') as any)
      .update(updateData)
      .eq('id', coverId)
      .select()
      .single()

    if (error) throw error
    return data as IBookCover
  }

  async getHistory(chapterId: string): Promise<IBookHistory[]> {
    const { data, error } = await this.supabase
      .from('book_history')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('version_number', { ascending: false })

    if (error) throw error
    return (data || []) as IBookHistory[]
  }

  async createHistory(input: ICreateBookHistoryInput): Promise<IBookHistory> {
    const insertData = {
      chapter_id: input.chapter_id,
      content_snapshot: input.content_snapshot,
      version_number: input.version_number,
      change_summary: input.change_summary || null,
    }

    const { data, error } = await (this.supabase
      .from('book_history') as any)
      .insert([insertData])
      .select()
      .single()

    if (error) throw error
    return data as IBookHistory
  }

  async getCharacters(bookId: string): Promise<IBookCharacter[]> {
    const { data, error } = await this.supabase
      .from('book_characters')
      .select('*')
      .eq('book_id', bookId)
      .order('name', { ascending: true })

    if (error) throw error
    return (data || []) as IBookCharacter[]
  }

  async createCharacter(input: ICreateBookCharacterInput): Promise<IBookCharacter> {
    const insertData = {
      book_id: input.book_id,
      name: input.name,
      description: input.description || null,
      avatar_url: input.avatar_url || null,
      metadata: input.metadata || {},
    }

    const { data, error } = await (this.supabase
      .from('book_characters') as any)
      .insert([insertData])
      .select()
      .single()

    if (error) throw error
    return data as IBookCharacter
  }

  async updateCharacter(
    characterId: string,
    input: IUpdateBookCharacterInput
  ): Promise<IBookCharacter> {
    const updateData: any = {}

    if (input.name !== undefined) updateData.name = input.name
    if (input.description !== undefined) updateData.description = input.description
    if (input.avatar_url !== undefined) updateData.avatar_url = input.avatar_url
    if (input.metadata !== undefined) updateData.metadata = input.metadata

    const { data, error } = await (this.supabase
      .from('book_characters') as any)
      .update(updateData)
      .eq('id', characterId)
      .select()
      .single()

    if (error) throw error
    return data as IBookCharacter
  }

  async deleteCharacter(characterId: string): Promise<void> {
    const { error } = await (this.supabase
      .from('book_characters') as any)
      .delete()
      .eq('id', characterId)

    if (error) throw error
  }

  async getGlossary(bookId: string): Promise<IBookGlossary[]> {
    const { data, error } = await this.supabase
      .from('book_glossary')
      .select('*')
      .eq('book_id', bookId)
      .order('term', { ascending: true })

    if (error) throw error
    return (data || []) as IBookGlossary[]
  }

  async createGlossaryTerm(input: ICreateBookGlossaryInput): Promise<IBookGlossary> {
    const insertData = {
      book_id: input.book_id,
      term: input.term,
      definition: input.definition,
    }

    const { data, error } = await (this.supabase
      .from('book_glossary') as any)
      .insert([insertData])
      .select()
      .single()

    if (error) throw error
    return data as IBookGlossary
  }

  async updateGlossaryTerm(
    glossaryId: string,
    input: IUpdateBookGlossaryInput
  ): Promise<IBookGlossary> {
    const updateData: any = {}

    if (input.term !== undefined) updateData.term = input.term
    if (input.definition !== undefined) updateData.definition = input.definition

    const { data, error } = await (this.supabase
      .from('book_glossary') as any)
      .update(updateData)
      .eq('id', glossaryId)
      .select()
      .single()

    if (error) throw error
    return data as IBookGlossary
  }

  async deleteGlossaryTerm(glossaryId: string): Promise<void> {
    const { error } = await (this.supabase
      .from('book_glossary') as any)
      .delete()
      .eq('id', glossaryId)

    if (error) throw error
  }

  async getExports(bookId: string): Promise<IBookExport[]> {
    const { data, error } = await this.supabase
      .from('book_exports')
      .select('*')
      .eq('book_id', bookId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as IBookExport[]
  }

  async createExport(input: ICreateBookExportInput): Promise<IBookExport> {
    const insertData = {
      book_id: input.book_id,
      format: input.format,
      file_url: input.file_url || null,
      metadata: input.metadata || {},
      status: input.status || 'pending',
    }

    const { data, error } = await (this.supabase
      .from('book_exports') as any)
      .insert([insertData])
      .select()
      .single()

    if (error) throw error
    return data as IBookExport
  }

  async updateExport(exportId: string, input: IUpdateBookExportInput): Promise<IBookExport> {
    const updateData: any = {}

    if (input.file_url !== undefined) updateData.file_url = input.file_url
    if (input.metadata !== undefined) updateData.metadata = input.metadata
    if (input.status !== undefined) updateData.status = input.status
    if (input.completed_at !== undefined) updateData.completed_at = input.completed_at

    const { data, error } = await (this.supabase
      .from('book_exports') as any)
      .update(updateData)
      .eq('id', exportId)
      .select()
      .single()

    if (error) throw error
    return data as IBookExport
  }
}
