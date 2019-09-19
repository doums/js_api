import { Prisma, User } from './generated/prisma-client'

export interface Context {
  prisma: Prisma;
  req: any;
  user: User;
}

export interface Token {
  userId: string;
}