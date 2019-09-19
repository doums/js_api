import { objectType } from 'nexus'

export const AuthCheck = objectType({
  name: 'AuthCheck',
  definition (t) {
    t.boolean('isAuth')
    t.field('me', { type: 'User', nullable: true })
  }
})