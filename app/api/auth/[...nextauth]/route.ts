import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { loginSchema } from '@/schemas/auth/loginSchema';

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  session: { strategy: 'jwt' },

  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        // Validate form data
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Connect to DB
        await connectToDatabase();

        // Find user
        const user = (await User.findOne({ email }).lean()) as {
          _id: string;
          name: string;
          email: string;
          password: string;
        } | null;
        if (!user || !user.password) return null;

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return null;

        // Return user object (password excluded)
        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],

  pages: {
    signIn: '/login',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).id = token.id;
      return session;
    },
  },
});
