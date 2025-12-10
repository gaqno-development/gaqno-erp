import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { validateTenantInRequest } from '@repo/core/utils/api/tenant-middleware'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()

        const supabaseClient = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options)
                        })
                    },
                },
            }
        )

        const { data: { user } } = await supabaseClient.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Não autenticado' },
                { status: 401 }
            )
        }

        const { data: userProfile } = await supabaseClient
            .from('profiles')
            .select('role, tenant_id')
            .eq('user_id', user.id)
            .single()

        if (!userProfile || userProfile.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Acesso negado. Apenas administradores podem criar usuários.' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { email, password, name, role, tenant_id, department, avatar_url } = body

        if (!email || !password || !name || !role || !tenant_id) {
            return NextResponse.json(
                { error: 'Campos obrigatórios faltando' },
                { status: 400 }
            )
        }

        const tenantValidation = await validateTenantInRequest(request, tenant_id)
        if (!tenantValidation.isValid) {
            return tenantValidation.response || NextResponse.json(
                { error: 'Acesso negado ao tenant especificado' },
                { status: 403 }
            )
        }

        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                name,
                role,
                tenant_id,
            },
        })

        if (authError) {
            return NextResponse.json(
                { error: authError.message },
                { status: 400 }
            )
        }

        if (!authData.user) {
            return NextResponse.json(
                { error: 'Erro ao criar usuário' },
                { status: 500 }
            )
        }

        // Wait for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Get the profile created by the trigger
        const { data: newProfile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('user_id', authData.user.id)
            .single()

        if (profileError) {
            console.error('Profile not found after user creation:', profileError)
            // Don't fail the request, the trigger should have created it
            // The profile can be created manually later if needed
        }

        const { error: tenantError } = await supabaseAdmin.rpc('increment_tenant_user_count', {
            p_tenant_id: tenant_id,
        })

        if (tenantError) {
            console.error('Erro ao incrementar contador:', tenantError)
        }

        return NextResponse.json({ data: newProfile }, { status: 201 })
    } catch (error) {
        console.error('Erro ao criar usuário:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

