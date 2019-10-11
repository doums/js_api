import gql from 'graphql-tag'

const typeDefs = gql`
    scalar DateTime

    type Query {
        post(id: ID!): Post!
        talk(id: ID!): Talk!
        posts: [Post!]!
        talks: [Talk!]!
    }
    
    type Mutation {
        signup(
            email: String!
            password: String!
            username: String!
        ): AuthPayload!
        login(email: String!, password: String!): AuthPayload!
        createTalk(name: String!, description: String!): Talk!
        joinTalk(id: ID!): Talk!
        leaveTalk(id: ID!): Talk!
        createPost(text: String!, talkId: ID!): Post!
        updatePost(id: ID!, text: String!): Post!
        deletePost(id: ID!): Post!
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
`

export default typeDefs
