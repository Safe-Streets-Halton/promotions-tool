import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { loginSchema } from '@/lib/validations'
import { AuthResponse } from '@/types/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input data
    const validationResult = loginSchema.safeParse(body)
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

    // Sign in user with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Login error:', error)
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: 'Login failed',
          error: error.message,
        },
        { status: 401 }
      )
    }

    if (!data.user) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: 'Login failed',
          error: 'Invalid credentials',
        },
        { status: 401 }
      )
    }

    return NextResponse.json<AuthResponse>(
      {
        success: true,
        message: 'Login successful',
        user: {
          id: data.user.id,
          email: data.user.email!,
          created_at: data.user.created_at,
          email_confirmed_at: data.user.email_confirmed_at,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Login error:', error)
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
