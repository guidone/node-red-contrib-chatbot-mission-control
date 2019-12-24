const { ApolloServer } = require('apollo-server-express');
const { resolver } = require('graphql-sequelize');


const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLFloat,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLBoolean,
  GraphQLInputObjectType
} = require('graphql');

module.exports = ({ Configuration, Message, User }) => {

  const newUserType = new GraphQLInputObjectType({
    name: 'NewUser',
    description: 'tbd',
    fields: {
      userId: {
        type: GraphQLString,
        description: '',
      },
      email: {
        type: GraphQLString,
        description: '',
      },
      first_name: {
        type: GraphQLString,
        description: '',
      },
      last_name: {
        type: GraphQLString,
        description: '',
      },
      language: {
        type: GraphQLString,
        description: '',
      },
      username: {
        type: GraphQLString,
        description: '',
      },
      payload: {
        type: GraphQLString,
        description: '',
      }
    }
  });

  const newMessageType = new GraphQLInputObjectType({
    name: 'NewMessage',
    description: 'tbd',
    fields: () => ({
      user: {
        type: newUserType,
        description: 'User of the chat message'
      },
      chatId: {
        type: GraphQLString,
        description: '',
      },
      userId: {
        type: GraphQLString,
        description: '',
      },
      messageId: {
        type: GraphQLString,
        description: '',
      },
      from: {
        type: GraphQLString,
        description: '',
      },
      type: {
        type: GraphQLString,
        description: '',
      },
      content: {
        type: GraphQLString,
        description: '',
      },
      transport: {
        type: GraphQLString,
        description: '',
      },
      inbound: {
        type: GraphQLBoolean,
        description: ''
      }, 
      ts: {
        type: GraphQLString,
        description: '',
      }  
    })
  });

  const messageType = new GraphQLObjectType({
    name: 'Message',
    description: 'tbd',
    fields: {
      id: {
        type: new GraphQLNonNull(GraphQLInt),
        description: 'The id of the message',
      },
      chatId: {
        type: GraphQLString,
        description: '',
      },
      userId: {
        type: GraphQLString,
        description: '',
      },
      messageId: {
        type: GraphQLString,
        description: '',
      },
      from: {
        type: GraphQLString,
        description: '',
      },
      type: {
        type: GraphQLString,
        description: '',
      },
      transport: {
        type: GraphQLString,
        description: '',
      },
      content: {
        type: GraphQLString,
        description: '',
      },
      inbound: {
        type: GraphQLBoolean,
        description: ''
      },
      ts: {
        type: GraphQLString,
        description: '',
      }
    }
  });

  const userType = new GraphQLObjectType({
    name: 'User',
    description: 'tbd',
    fields: {
      id: {
        type: new GraphQLNonNull(GraphQLInt),
        description: 'The internal id of the user',
      },
      userId: {
        type: GraphQLString,
        description: '',
      },
      email: {
        type: GraphQLString,
        description: '',
      },
      first_name: {
        type: GraphQLString,
        description: '',
      },
      last_name: {
        type: GraphQLString,
        description: '',
      },
      language: {
        type: GraphQLString,
        description: '',
      },
      username: {
        type: GraphQLString,
        description: '',
      },
      payload: {
        type: GraphQLString,
        description: '',
      }
    }
  });

  const configurationType = new GraphQLObjectType({
    name: 'Configuration',
    description: 'tbd',
    fields: {
      id: {
        type: new GraphQLNonNull(GraphQLInt),
        description: 'The id of the configuration',
      },
      namespace: {
        type: GraphQLString,
        description: '',
      },
      payload: {
        type: GraphQLString,
        description: '',
      }
    }
  });
  
  const newConfigurationType = new GraphQLInputObjectType({
    name: 'NewConfiguration',
    description: 'tbd',
    fields: () => ({
      namespace: {
        type: GraphQLString,
        description: '',
      },
      payload: {
        type: GraphQLString,
        description: '',
      }
    })
  });
  

  const messageCounterType = new GraphQLObjectType({ 
    name: 'MessageCounters',
    description: 'Message Counters',
    fields: {
      count: {
        type: GraphQLInt,
        description: 'Total messages',
        resolve: () => Message.count()
      }
    }
  });

  const userCounterType = new GraphQLObjectType({ 
    name: 'UserCounters',
    description: 'User Counters',
    fields: {
      count: {
        type: GraphQLInt,
        description: 'Total users',
        resolve: () => User.count()
      }
    }
  });

  const countersType = new GraphQLObjectType({
    name: 'Counters',
    description: 'Counters',
    fields: {
      messages: {
        type: messageCounterType,
        description: 'Counters for messages',
        resolve: (root, args) => {
          return {};
        } 
      },
      users: {
        type: userCounterType,
        description: 'Counters for users',
        resolve: (root, args) => {
          return {};
        } 
      }
    }
  });


  const schema = new GraphQLSchema({
    
    mutation: new GraphQLObjectType({
      name: 'Mutations',
      description: 'These are the things we can change',
      fields: {
        
        createConfiguration: {
          type: configurationType,
          args: {
            configuration: { type: new GraphQLNonNull(newConfigurationType) }
          },
          resolve(root, { configuration }) {
            return Configuration.findOne({ where: { namespace: configuration.namespace }})
              .then(found => {
                if (found != null) {
                  return Configuration.update(configuration, { where: { id: found.id }})
                    .then(() => Configuration.findByPk(found.id));  
                } 
                return Configuration.create(configuration);
              });
          }
        },

        createMessage: {
          type: messageType,
          args: {
            message: { type: new GraphQLNonNull(newMessageType) }
          },
          resolve: async function(root, { message }) {            
            const { user, ...newMessage } = message;
            // create user if doesn't exist
            if (user != null && user.userId) {
              const existingUser = await User.findOne({ where: { userId: user.userId }});
              if (existingUser == null) {
                await User.create(user);
              }
            }
            return Message.create({ ...newMessage, userId: user.userId });    
          }
        }        
      }
    }),
    
    query: new GraphQLObjectType({
      name: 'Queries',
      fields: {
  
        configurations: {
          type: new GraphQLList(configurationType),
          args: {
            offset: { type: GraphQLInt },
            limit: { type: GraphQLInt },
            order: { type: GraphQLString },
            namespace: { type: GraphQLString }
          },
          resolve: resolver(Configuration)
        },

        users: {
          type: new GraphQLList(userType),
          args: {
            offset: { type: GraphQLInt },
            limit: { type: GraphQLInt },
            order: { type: GraphQLString }
          },
          resolve: resolver(User)
        },

        messages: {
          type: new GraphQLList(messageType),
          args: {
            offset: { type: GraphQLInt },
            limit: { type: GraphQLInt },
            order: { type: GraphQLString },
            type: { type: GraphQLString },
            transport: { type: GraphQLString },
            inbound: { type: GraphQLBoolean }
          },
          resolve: resolver(Message, {
            before: (findOptions, args, context) => {
              console.log('???', args)
              //findOptions.where = { /* Custom where arguments */ };
              return findOptions;
            },

          })
        },
  
        counters: {
          type: countersType,
          resolve: (root, args) => {
            return {};
          } 
        },

        version: {
          type: GraphQLInt,
          resolve: () => 42
        }
      }
    })
  });
  
  const graphQLServer = new ApolloServer({ schema });

  return graphQLServer;
};





