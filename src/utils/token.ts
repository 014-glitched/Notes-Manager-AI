import * as jwt from 'jsonwebtoken'

if(!process.env.JWT_SECRET){
    throw new Error('JWT_SECRET environment variable is required')
}

const JWT_SEC = process.env.JWT_SECRET!

export function signAccessToken(userId: string) {
    const payload = { sub: userId }
    const expiresIn = process.env.ACCESS_TOKEN_EXPIRES || '15m'
    
    return jwt.sign(payload, JWT_SEC, { expiresIn } as jwt.SignOptions)
}

export function verifyAccessToken(token: string){
  return jwt.verify(token, JWT_SEC) as { sub: string, iat: number, exp: number };
}