import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { registerSchema } from '@/lib/validations'
import { AuthResponse } from '@/types/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input data
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: 'Validation failed',
          error: validationResult.error.errors[0].message,
        },
        { status: 400 }
      )
    }

    const { email, password } = validationResult.data

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('auth.users')
      .select('email')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: 'Registration failed',
          error: 'An account with this email already exists',
        },
        { status: 409 }
      )
    }

    // Register user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (error) {
      console.error('Registration error:', error)
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: 'Registration failed',
          error: error.message,
        },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: 'Registration failed',
          error: 'Failed to create user account',
        },
        { status: 500 }
      )
    }

    return NextResponse.json<AuthResponse>(
      {
        success: true,
        message: 'Registration successful! Please check your email to confirm your account.',
        user: {
          id: data.user.id,
          email: data.user.email!,
          created_at: data.user.created_at,
          email_confirmed_at: data.user.email_confirmed_at,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: 'Internal server error',
        error: 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}
