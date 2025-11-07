import { NextRequest, NextResponse } from 'next/server'
import { otpStorage } from '@/lib/otp-storage'

// Debug endpoint to check OTP storage
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Checking OTP storage...')
    
    // Get storage size
    const size = otpStorage.size()
    console.log(`💾 Storage size: ${size}`)
    
    // List all OTPs
    otpStorage.listAll()
    
    return NextResponse.json({
      success: true,
      storageSize: size,
      message: 'Check server console for detailed OTP list'
    })
  } catch (error) {
    console.error('❌ Debug error:', error)
    return NextResponse.json(
      { error: 'Debug failed' },
      { status: 500 }
    )
  }
}
