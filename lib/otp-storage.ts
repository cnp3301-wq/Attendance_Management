// Shared in-memory OTP storage
// This allows both send-otp and verify-otp to access the same Map

interface OTPRecord {
  otp: string
  expiresAt: Date
}

class OTPStorage {
  private storage: Map<string, OTPRecord>

  constructor() {
    this.storage = new Map()
  }

  set(email: string, otp: string, expiresAt: Date): void {
    this.storage.set(email.toLowerCase(), { otp, expiresAt })
    console.log(`💾 [OTP Storage] Stored OTP for ${email}`)
    console.log(`💾 [OTP Storage] Total entries: ${this.storage.size}`)
  }

  get(email: string): OTPRecord | undefined {
    const record = this.storage.get(email.toLowerCase())
    console.log(`🔍 [OTP Storage] Lookup for ${email}: ${record ? 'Found' : 'Not found'}`)
    return record
  }

  delete(email: string): boolean {
    const result = this.storage.delete(email.toLowerCase())
    console.log(`🗑️ [OTP Storage] Deleted ${email}: ${result}`)
    console.log(`💾 [OTP Storage] Remaining entries: ${this.storage.size}`)
    return result
  }

  clear(): void {
    this.storage.clear()
    console.log(`🗑️ [OTP Storage] Cleared all entries`)
  }

  size(): number {
    return this.storage.size
  }

  // For debugging
  listAll(): void {
    console.log(`📋 [OTP Storage] All entries (${this.storage.size}):`)
    this.storage.forEach((value, key) => {
      const isExpired = new Date() > value.expiresAt
      console.log(`  - ${key}: ${value.otp} (${isExpired ? 'EXPIRED' : 'VALID'})`)
    })
  }
}

// Export a single instance to be shared across the app
export const otpStorage = new OTPStorage()
