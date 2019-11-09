import gql from 'graphql-tag'

const typeDefs = gql`
    scalar DateTime

    type Query {
        post(id: ID!): Post!
        talk(id: ID!): Talk!
        user(id: ID!): User!
        posts: [Post!]!
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
        joinTalk(id: ID!): Talk!
        leaveTalk(id: ID!): Talk!
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
        activeUsers: [User!]!
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
        activeTalks: [Talk!]!
    }
    
    type AuthCheck {
        isAuth: Boolean!
        me: User
    }
`

export default typeDefs
