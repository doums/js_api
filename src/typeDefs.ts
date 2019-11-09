import gql from 'graphql-tag'

const typeDefs = gql`
    scalar DateTime

    type Query {
        post(id: ID!): Post!
        talk(id: ID!): Talk!
        user(id: ID!): User!
        posts: [Post!]!
        postsByTalk(talkId: ID!): [Post!]!
        talks: [Talk!]!
        users: [User!]!
        amIAuth: AuthCheck!
    }
    
    type Mutation {
        signUp(
            email: String!
            password: String!
            username: String!
        ): AuthPayload!
        signIn(email: String!, password: String!): AuthPayload!
        createTalk(name: String!, description: String!): Talk!
        createPost(text: String!, talkId: ID!): Post!
        updatePost(id: ID!, text: String!): Post!
        deletePost(id: ID!): Post!
        updateBio(bio: String!): User!
    }
    
    type Post {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        text: String!
        author: User!
        talk: Talk!
    }

    type AuthPayload {
        token: String!
        user: User!
    }

    type Talk {
        id: ID!
        name: String!
        description: String!
        createdAt: DateTime!
        updatedAt: DateTime!
        posts: [Post!]!
    }

    type User {
        id: ID!
        email: String!
        username: String!
        bio: String
        createdAt: DateTime!
        updatedAt: DateTime!
        posts: [Post!]!
    }
    
    type AuthCheck {
        isAuth: Boolean!
        me: User
    }
`

export default typeDefs
