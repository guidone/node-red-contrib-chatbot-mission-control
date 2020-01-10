const { ApolloServer } = require('apollo-server-express');
const { resolver } = require('graphql-sequelize');
const { Kind } = require('graphql/language');

const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLFloat,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLScalarType
} = require('graphql');

const DateType = new GraphQLScalarType({
  name: 'Date',
  description: 'Date type',
  parseValue(value) {
    return new Date(value); // value from the client
  },
  serialize(value) {
    return value;
    //return value.getTime(); // value sent to the client
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(ast.value) // ast value is always in string format
    }
    return null;
  },
});

const JSONType = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON data type',
  parseValue(value) {
    return JSON.stringify(value);
  },
  serialize(value) {
    let result;
    try {
      result = JSON.parse(value);
    } catch(e) {
      // do nothing
    }
    return result;
  },
  parseLiteral(ast) {
    return null;
  },
});

module.exports = ({ Configuration, Message, User, ChatId, Event, sequelize }) => {

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
        type: JSONType,
        description: '',
      }
    }
  });

  const chatIdType = new GraphQLObjectType({
    name: 'ChatId',
    description: 'ChatId record, relation between a platform specific chatId and the userId',
    fields: () => ({
      id: {
        type: new GraphQLNonNull(GraphQLInt),
        description: 'The internal id of the user',
      },
      userId: {
        type: GraphQLString,
        description: ''
      },
      chatId: {
        type: GraphQLString,
        description: ''
      },
      transport: {
        type: GraphQLString,
        description: ''
      },
      user: {
        type: userType,
        description: 'User related to this chatId',
        resolve: (chatId, args) => User.findOne({ where: { userId: chatId.userId }}) 
      }
    })
  });

  const userType = new GraphQLObjectType({
    name: 'User',
    description: 'tbd',
    fields: () => ({
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
      createdAt: {
        type: DateType
      },
      payload: {
        type: JSONType,
        description: '',
      },
      chatIds: {
        type: new GraphQLList(chatIdType),
        args: {
          transport: { type: GraphQLString }
        },
        resolve: (user, args) => {
          const where = { userId: user.userId };
          if (args.transport != null) {
            where.transport = args.transport;  
          } 
          return ChatId.findAll({ where });
        }
      },
      messages: {
        type: GraphQLList(messageType),
        args: {
          offset: { type: GraphQLInt },
          limit: { type: GraphQLInt },
          order: { type: GraphQLString }
        },
        resolve: (user, args = {}) => {
          let order;
          if (args.order != null) {
            order = [
              [args.order.replace('reverse:', ''), args.order.startsWith('reverse:') ? 'ASC' : 'DESC']
            ]; 
          }
          return Message.findAll({ 
            where: { userId: user.userId},
            limit: args.limit,
            offset: args.offset,
            order
          });
        }
      }
    })
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
      createdAt: {
        type: DateType
      },
      ts: {
        type: GraphQLString,
        description: '',
      },
      user: {
        type: userType,
        resolve: (message, args) => {
          return User.findOne({ where: { userId: message.userId }});
        }
      }
    }
  });


  const eventType = new GraphQLObjectType({
    name: 'Event',
    description: 'tbd',
    fields: {
      id: {
        type: new GraphQLNonNull(GraphQLInt),
        description: 'The internal id of funnel record',
      },
      flow: {
        type: GraphQLString,
        description: '',
      },
      name: {
        type: GraphQLString,
        description: '',
      },
      count: {
        type: GraphQLInt,
        description: '',
      }
    }
  });

  const newEventType = new GraphQLInputObjectType({
    name: 'NewEvent',
    description: 'tbd',
    fields: {
      flow: {
        type: GraphQLString,
        description: '',
      },
      name: {
        type: GraphQLString,
        description: '',
      },
      count: {
        type: GraphQLInt,
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

  const aggregatedEvent = new GraphQLObjectType({
    name: 'aggregatedEvent',
    description: 'Aggregation of event',
    fields: {
      flow: {
        type: GraphQLString
      },
      count: {
        type: GraphQLInt
      }
    }
  });

  const eventCounterType = new GraphQLObjectType({ 
    name: 'EventCounters',
    description: 'Event Counters',
    fields: {
      count: {
        type: GraphQLInt,
        description: 'Total events',
        resolve: () => Event.count()
      },
      events: {
        type: new GraphQLList(aggregatedEvent),
        resolve() {
          return Event
            .findAll({
              group: ['flow'],
              attributes: ['flow', [sequelize.fn('COUNT', 'flow'), 'count']],
            })
            .then(res => res.map(item => item.dataValues));
        }
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
      },
      events: {
        type: eventCounterType,
        description: 'Counters for events',
        resolve: () => {
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
        
        createEvent: {
          type: eventType,
          args: {
            event: { type: new GraphQLNonNull(newEventType) }
          },
          resolve: async function(root, { event }) {
            const existingEvent = await Event.findOne({ where: { flow: event.flow, name: event.name }});
            
            if (existingEvent != null) {
              await Event.update({ count: existingEvent.count + 1 }, { where: { flow: event.flow, name: event.name }})
              existingEvent.count += 1;
              return existingEvent;
            }
            return Event.create({ ...event, count: 1 });
          }
        },

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

        editUser: {
          type: userType,
          args: {
            id: { type: new GraphQLNonNull(GraphQLInt)},
            user: { type: new GraphQLNonNull(newUserType) }
          },
          resolve(root, { id, user: value }) {
            return User.update(value, { where: { id } })
              .then(() => User.findByPk(id));
          }
        },

        deleteUser: {
          type: userType,
          args: {
            id: { type: new GraphQLNonNull(GraphQLInt)}
          },
          resolve: async function(root, { id }) {
            const user = await User.findByPk(id);
            // destroy user and related chatIds
            if (user != null) {
              await user.destroy();
            }
            await ChatId.destroy({ where: { userId: user.userId }});
            return user;
          }
        },

        createMessage: {
          type: messageType,
          args: {
            message: { type: new GraphQLNonNull(newMessageType) }
          },
          resolve: async function(root, { message }) {            
            const { user, ...newMessage } = message;
            // if user with a valid id
            if (user != null && user.userId) {
              // create user if doesn't exist
              const existingUser = await User.findOne({ where: { userId: user.userId }});
              if (existingUser == null) {
                const newUser = await User.create(user);
              }
              // check if exists userid / transport and create or update  
              const existingChatId = await ChatId.findOne({ where: { userId: user.userId, transport: message.transport }});
              if (existingChatId == null) {
                // creating new triplet userId / transport / chatId
                await ChatId.create({ userId: user.userId, chatId: message.chatId, transport: message.transport });
              } else if (existingChatId != null && existingChatId.chatId != message.chatId) {
                // it exists but with a different chatId, could be changed, then update
                await ChatId.update({ chatId: message.chatId }, { where: { userId: user.userId, transport: message.transport }});
              } 
              // triplet already exists, doing nothing 
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
            order: { type: GraphQLString },
            userId: { type: GraphQLString },
          },
          resolve: resolver(User)
        },

        events: {
          type: new GraphQLList(eventType),
          args: {
            flow: { type: GraphQLString }
          },
          resolve: resolver(Event)
        },

        chatIds: {
          type: new GraphQLList(chatIdType),
          args: {
            chatId: { type: GraphQLString },
            userId: { type: GraphQLString },
            transport: { type: GraphQLString }
          },
          resolve: resolver(ChatId)
        },

        messages: {
          type: new GraphQLList(messageType),
          args: {
            offset: { type: GraphQLInt },
            limit: { type: GraphQLInt },
            order: { type: GraphQLString },
            type: { type: GraphQLString },
            transport: { type: GraphQLString },
            messageId: { type: GraphQLString },
            chatId: { type: GraphQLString },
            userId: { type: GraphQLString },
            inbound: { type: GraphQLBoolean }
          },
          resolve: resolver(Message)
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





