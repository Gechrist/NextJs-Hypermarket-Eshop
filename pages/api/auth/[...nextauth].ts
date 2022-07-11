import type { NextApiRequest, NextApiResponse } from 'next';
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbUtils from '../../../utils/db';
import User from '../../../models/User';
import bcrypt from 'bcrypt';

const authOptions = {
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Credentials',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        try {
          await dbUtils.connect();
          const user = await User.findOne({ email: credentials!.email });
          if (!user) {
            await dbUtils.disconnect();
            return false;
          }
          await dbUtils.disconnect();
          if (bcrypt.compareSync(credentials!.password, user.password)) {
            return user;
          } else {
            return false;
          }
        } catch (e) {
          console.log({ error: (e as Error).message });
        }
      },
    }),
  ],
  session: {
    maxAge: 3600,
  },
  callbacks: {
    async signIn({ user }) {
      if (user) {
        return true;
      } else {
        // Return false to display a default error message
        return false;
        // Or you can return a URL to redirect to:
        // return '/unauthorized'
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.userID = user.id;
        token.isAdmin = user.isAdmin;
        token.address = user.address;
        token.city = user.city;
        token.postalCode = user.postalCode;
        token.country = user.country;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.userID = token.userID;
        session.isAdmin = token.isAdmin;
        session.address = token.address;
        session.city = token.city;
        session.postalCode = token.postalCode;
        session.country = token.country;
      }
      return session;
    },
  },
};
const Auth = async (req: NextApiRequest, res: NextApiResponse) => {
  return await NextAuth(req, res, authOptions as NextAuthOptions);
};

export { authOptions };
export default Auth;
