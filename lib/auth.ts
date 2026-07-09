import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  debug: true,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const nurse = await prisma.nurse.findUnique({
          where: { email: credentials.email },
        })

        if (nurse) {
          const isValid = await bcrypt.compare(credentials.password, nurse.password)
          if (isValid) {
            return { id: nurse.id, email: nurse.email, name: nurse.name, role: 'nurse' }
          }
        }

        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email },
        })

        if (admin) {
          const isValid = await bcrypt.compare(credentials.password, admin.password)
          if (isValid) {
            return { id: admin.id, email: admin.email, name: admin.name, role: 'admin' }
          }
        }

        return null
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as { role?: string; id?: string }
        token.role = authUser.role as string
        token.id = authUser.id as string
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as typeof session.user & { role: string; id: string }).role = token.role as string
        ;(session.user as typeof session.user & { role: string; id: string }).id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
}