import crypto from 'crypto'

export function generateRefreshTokenPlain() {
     return crypto.randomBytes(128).toString('hex')
}

export function hashToken256(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex')
}

export function refreshExpiresAt(expiresIn: string) {
    const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30)
    return new Date(Date.now() + days *24 * 60 * 60 * 1000)
}