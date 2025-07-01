import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { AuthResponse } from '@/types/auth'

export async function POST(request: NextRequest) {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout error:', error)
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: 'Logout failed',
          error: error.message,
        },
        { status: 400 }
      )
    }

    return NextResponse.json<AuthResponse>(
      {
        success: true,
        message: 'Logout successful',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Logout error:', error)
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
