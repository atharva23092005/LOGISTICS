import { Router } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const router = Router()

// Demo users (in production: use MongoDB)
const USERS = [
  { id: 'u1', name: 'Rajesh Kumar',   email: 'rajesh@ner-logistics.in', password: '$2a$10$rGbQ8hj3JbXk5ZhvV.qfUuIXQ3K8dXP1GjE6wCR1PtDz5NeC7gMDu', role: 'admin',         district: 'Guwahati' },
  { id: 'u2', name: 'Priya Das',      email: 'priya@ner-logistics.in',  password: '$2a$10$rGbQ8hj3JbXk5ZhvV.qfUuIXQ3K8dXP1GjE6wCR1PtDz5NeC7gMDu', role: 'field_officer', district: 'East Siang' },
  { id: 'u3', name: 'Amit Sharma',    email: 'amit@ner-logistics.in',   password: '$2a$10$rGbQ8hj3JbXk5ZhvV.qfUuIXQ3K8dXP1GjE6wCR1PtDz5NeC7gMDu', role: 'analyst',       district: 'Guwahati' },
]
// All passwords hashed from 'demo'

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = USERS.find((u) => u.email === email)
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    const { password: _, ...userSafe } = user
    res.json({ token, user: userSafe })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/refresh', (req, res) => {
  // In production: validate refresh token from HttpOnly cookie
  res.json({ message: 'Token refreshed' })
})

export default router
