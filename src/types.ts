import { Prisma, User } from './generated/prisma-client'

export interface Context {
  prisma: Prisma;
  req: any;
  user: User | null;
}

export interface Token {
  userId: string;
}

export interface AuthCheck {
  me: User | null;
  isAuth: boolean;
}

export interface AuthPayload {
  token: string;
  user: User;
}