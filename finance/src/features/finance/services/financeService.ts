import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@repo/core/types/database'
import {
  IFinanceTransaction,
  IFinanceCategory,
  IFinanceSubcategory,
  ICreditCard,
  ICreateTransactionInput,
  IUpdateTransactionInput,
  ICreateCategoryInput,
  IUpdateCategoryInput,
  ICreateSubcategoryInput,
  IUpdateSubcategoryInput,
  ICreateCreditCardInput,
  IUpdateCreditCardInput,
  TransactionStatus,
} from '../types/finance'

export class FinanceService {
  constructor(private supabase: SupabaseClient<Database>) { }

  async getTransactions(
    tenantId: string | null,
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<IFinanceTransaction[]> {
    let query = this.supabase
      .from('finance_transactions')
      .select(`
        *,
        category:finance_categories(*),
        subcategory:finance_subcategories(*),
        creditCard:finance_credit_cards(*)
      `)
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false })

    if (tenantId) {
      query = query.eq('tenant_id', tenantId)
    }

    if (startDate) {
      query = query.gte('transaction_date', startDate)
    }

    if (endDate) {
      query = query.lte('transaction_date', endDate)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []) as IFinanceTransaction[]
  }

  async createTransaction(
    tenantId: string | null,
    userId: string,
    input: ICreateTransactionInput
  ): Promise<IFinanceTransaction> {
    const insertData = {
      tenant_id: tenantId || '',
      user_id: userId,
      description: input.description,
      amount: input.amount,
      type: input.type,
      transaction_date: input.transaction_date,
      due_date: input.due_date || null,
      credit_card_id: input.credit_card_id || null,
      category_id: input.category_id || null,
      subcategory_id: input.subcategory_id || null,
      status: input.status || TransactionStatus.A_PAGAR,
      notes: input.notes || null,
      installment_count: input.installment_count || 1,
      installment_current: input.installment_current || 1,
      is_recurring: input.is_recurring || false,
      recurring_type: input.recurring_type || null,
      recurring_day: input.recurring_day || null,
      recurring_months: input.recurring_months || null,
      icon: input.icon || null,
    }

    try {
      const { data, error } = await (this.supabase
        .from('finance_transactions') as any)
        .insert(insertData)
        .select('*')
        .single()

      if (error) throw error
      if (!data) throw new Error('Insert succeeded but no data returned')

      const insertedData = data as any

      const relationsResult = await this.supabase
        .from('finance_transactions')
        .select(`
          *,
          category:finance_categories(*),
          subcategory:finance_subcategories(*),
          creditCard:finance_credit_cards(*)
        `)
        .eq('id', insertedData.id)
        .single()

      if (relationsResult.error) {
        return data as IFinanceTransaction
      }

      return relationsResult.data as IFinanceTransaction
    } catch (err) {
      throw err
    }
  }

  async updateTransaction(
    tenantId: string | null,
    userId: string,
    input: IUpdateTransactionInput
  ): Promise<IFinanceTransaction> {
    const { id, ...updateData } = input

    let query = (this.supabase
      .from('finance_transactions') as any)
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select(`
        *,
        category:finance_categories(*),
        subcategory:finance_subcategories(*),
        creditCard:finance_credit_cards(*)
      `)
      .single()

    if (tenantId) {
      query = query.eq('tenant_id', tenantId)
    }

    const { data, error } = await query

    if (error) throw error
    return data as IFinanceTransaction
  }

  async deleteTransaction(
    tenantId: string | null,
    userId: string,
    transactionId: string
  ): Promise<void> {
    let query = this.supabase
      .from('finance_transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', userId)

    if (tenantId) {
      query = query.eq('tenant_id', tenantId)
    }

    const { error } = await query

    if (error) {
      throw error
    }
  }

  async getCategories(
    tenantId: string | null,
    type?: 'income' | 'expense'
  ): Promise<IFinanceCategory[]> {
    let query = this.supabase
      .from('finance_categories')
      .select('*')
      .order('name', { ascending: true })

    if (tenantId) {
      query = query.eq('tenant_id', tenantId)
    }

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []) as IFinanceCategory[]
  }

  async createCategory(
    tenantId: string | null,
    input: ICreateCategoryInput
  ): Promise<IFinanceCategory> {
    const { data, error } = await (this.supabase
      .from('finance_categories') as any)
      .insert({
        tenant_id: tenantId || '',
        name: input.name,
        type: input.type,
        color: input.color || '#3B82F6',
        icon: input.icon || null,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505' && error.message?.includes('finance_categories_tenant_color_unique')) {
        throw new Error('Esta cor já está sendo usada por outra categoria. Escolha uma cor diferente.')
      }
      throw error
    }
    return data as IFinanceCategory
  }

  async updateCategory(
    tenantId: string | null,
    input: IUpdateCategoryInput
  ): Promise<IFinanceCategory> {
    const { id, ...updateData } = input

    let query = (this.supabase
      .from('finance_categories') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (tenantId) {
      query = query.eq('tenant_id', tenantId)
    }

    const { data, error } = await query

    if (error) {
      if (error.code === '23505' && error.message?.includes('finance_categories_tenant_color_unique')) {
        throw new Error('Esta cor já está sendo usada por outra categoria. Escolha uma cor diferente.')
      }
      throw error
    }
    return data as IFinanceCategory
  }

  async deleteCategory(tenantId: string | null, categoryId: string): Promise<void> {
    let query = this.supabase.from('finance_categories').delete().eq('id', categoryId)

    if (tenantId) {
      query = query.eq('tenant_id', tenantId)
    }

    const { error } = await query
    if (error) throw error
  }

  async getSubcategories(
    tenantId: string | null,
    parentCategoryId: string
  ): Promise<IFinanceSubcategory[]> {
    let query = this.supabase
      .from('finance_subcategories')
      .select('*')
      .eq('parent_category_id', parentCategoryId)
      .order('name', { ascending: true })

    if (tenantId) {
      query = query.eq('tenant_id', tenantId)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []) as IFinanceSubcategory[]
  }

  async createSubcategory(
    tenantId: string | null,
    input: ICreateSubcategoryInput
  ): Promise<IFinanceSubcategory> {
    const parentCategory = await (this.supabase
      .from('finance_categories') as any)
      .select('icon, tenant_id')
      .eq('id', input.parent_category_id)
      .single()

    if (parentCategory.error) throw parentCategory.error

    const parentData = parentCategory.data as { icon: string | null; tenant_id: string }

    const { data, error } = await (this.supabase
      .from('finance_subcategories') as any)
      .insert({
        tenant_id: tenantId || parentData.tenant_id,
        parent_category_id: input.parent_category_id,
        name: input.name,
        icon: input.icon || parentData.icon || null,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505' && error.message?.includes('finance_subcategories_tenant_parent_name_unique')) {
        throw new Error('Esta subcategoria já existe para esta categoria.')
      }
      throw error
    }
    return data as IFinanceSubcategory
  }

  async updateSubcategory(
    tenantId: string | null,
    input: IUpdateSubcategoryInput
  ): Promise<IFinanceSubcategory> {
    const { id, ...updateData } = input

    let query = (this.supabase
      .from('finance_subcategories') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (tenantId) {
      query = query.eq('tenant_id', tenantId)
    }

    const { data, error } = await query

    if (error) {
      if (error.code === '23505' && error.message?.includes('finance_subcategories_tenant_parent_name_unique')) {
        throw new Error('Esta subcategoria já existe para esta categoria.')
      }
      throw error
    }
    return data as IFinanceSubcategory
  }

  async deleteSubcategory(tenantId: string | null, subcategoryId: string): Promise<void> {
    let query = this.supabase.from('finance_subcategories').delete().eq('id', subcategoryId)

    if (tenantId) {
      query = query.eq('tenant_id', tenantId)
    }

    const { error } = await query
    if (error) throw error
  }

  async getCreditCards(
    tenantId: string | null,
    userId: string
  ): Promise<ICreditCard[]> {
    let query = this.supabase
      .from('finance_credit_cards')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (tenantId) {
      query = query.eq('tenant_id', tenantId)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []) as ICreditCard[]
  }

  async createCreditCard(
    tenantId: string | null,
    userId: string,
    input: ICreateCreditCardInput
  ): Promise<ICreditCard> {
    const { data, error } = await (this.supabase
      .from('finance_credit_cards') as any)
      .insert({
        tenant_id: tenantId || '',
        user_id: userId,
        name: input.name,
        last_four_digits: input.last_four_digits,
        card_type: input.card_type,
        bank_name: input.bank_name || null,
        credit_limit: input.credit_limit,
        closing_day: input.closing_day,
        due_day: input.due_day,
        color: input.color || '#3B82F6',
        icon: input.icon || null,
      })
      .select()
      .single()

    if (error) throw error
    return data as ICreditCard
  }

  async updateCreditCard(
    tenantId: string | null,
    userId: string,
    input: IUpdateCreditCardInput
  ): Promise<ICreditCard> {
    const { id, ...updateData } = input

    let query = (this.supabase
      .from('finance_credit_cards') as any)
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (tenantId) {
      query = query.eq('tenant_id', tenantId)
    }

    const { data, error } = await query

    if (error) throw error
    return data as ICreditCard
  }

  async deleteCreditCard(
    tenantId: string | null,
    userId: string,
    creditCardId: string
  ): Promise<void> {
    let query = this.supabase
      .from('finance_credit_cards')
      .delete()
      .eq('id', creditCardId)
      .eq('user_id', userId)

    if (tenantId) {
      query = query.eq('tenant_id', tenantId)
    }

    const { error } = await query
    if (error) throw error
  }

  async getCreditCardSummary(
    tenantId: string | null,
    userId: string,
    creditCardId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{ monthlyValue: number; remainingLimit: number; totalLimit: number }> {
    const { data: card } = await this.supabase
      .from('finance_credit_cards')
      .select('credit_limit')
      .eq('id', creditCardId)
      .eq('user_id', userId)
      .single()

    if (!card) {
      throw new Error('Credit card not found')
    }

    let query = this.supabase
      .from('finance_transactions')
      .select('amount', { count: 'exact' })
      .eq('user_id', userId)
      .eq('credit_card_id', creditCardId)
      .eq('type', 'expense')

    if (tenantId) {
      query = query.eq('tenant_id', tenantId)
    }

    if (startDate) {
      query = query.gte('transaction_date', startDate)
    }

    if (endDate) {
      query = query.lte('transaction_date', endDate)
    }

    const { data, error } = await query

    if (error) throw error

    const transactions = (data || []) as any[]
    const monthlyValue = transactions.reduce((sum, t) => sum + Number(t.amount), 0)
    const totalLimit = Number((card as any).credit_limit)
    const remainingLimit = totalLimit - monthlyValue

    return {
      monthlyValue,
      remainingLimit: Math.max(0, remainingLimit),
      totalLimit,
    }
  }
}

