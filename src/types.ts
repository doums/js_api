import { Prisma, User } from './generated/prisma-client'
import SocketIO from 'socket.io'

export interface Context {
  prisma: Prisma;
  req: any;
  user: User | null;
  io: SocketIO.Server;
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