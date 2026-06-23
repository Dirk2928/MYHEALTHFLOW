import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
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
        token.role = (user as any).role
        token.id = (user as any).id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = (token as any).role
        (session.user as any).id = token.id
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
}