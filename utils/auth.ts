import { NextApiResponse as res } from 'next';
import { NextApiRequest as req } from 'next';
import { NextAuthOptions } from 'next-auth';
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import jwt from 'jsonwebtoken';

const signResetPasswordToken = (email: string): string => {
  return jwt.sign(
    {
      email: email,
    },
    process.env.NEXT_PUBLIC_JWT_SECRET as string,
    { expiresIn: '1h' }
  );
};

const getSessionServer = async (req: req, res: res) => {
  const session = await unstable_getServerSession(
    req,
    res,
    authOptions as NextAuthOptions
  );
  return session;
};

const authUtils = { signResetPasswordToken, getSessionServer };
export default authUtils;
