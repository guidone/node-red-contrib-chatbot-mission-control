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

module.exports = ({ Configuration, Message }) => {

  const newMessageType = new GraphQLInputObjectType({
    name: 'NewMessage',
    description: 'tbd',
    fields: () => ({
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
          resolve(root, { message }) {
            return Message.create(message);    
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





