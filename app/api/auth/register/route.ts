import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'El registro manual está desactivado. Usa Google para crear tu cuenta.' },
    { status: 403 }
  )
}
