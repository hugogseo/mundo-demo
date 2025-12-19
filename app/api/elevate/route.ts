import { createClient } from '@supabase/supabase-js'
import { NextResponse, NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
        return NextResponse.json({ error: 'Email is required.' })
    }

    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        // 1. Find user by email
        const { data: users, error: listError } = await supabase.auth.admin.listUsers()

        if (listError) throw listError

        let user = users.users.find(u => u.email === email)

        // 2. If user doesn't exist, create them
        if (!user) {
            const { data: newData, error: createError } = await supabase.auth.admin.createUser({
                email: email,
                password: 'Password123!',
                email_confirm: true
            })
            if (createError) throw createError
            user = newData.user
        }

        if (!user) throw new Error('Failed to create/find user')

        // 3. Elevate to enterprise
        const { error: updateError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                email: email,
                membership_tier: 'enterprise',
                full_name: 'Admin Demo'
            } as any)

        if (updateError) throw updateError

        return NextResponse.json({
            success: true,
            message: `User ${email} is now an Enterprise/Admin user.`,
            email: email,
            password: 'Password123! (if newly created)',
            id: user.id
        })

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message })
    }
}
