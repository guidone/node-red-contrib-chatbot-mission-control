const { ApolloServer } = require('apollo-server-express');
const { resolver } = require('graphql-sequelize');
const { Kind } = require('graphql/language');
const _ = require('lodash');
const Sequelize = require('sequelize');

const Op = Sequelize.Op;

const { when } = require('../lib/utils');

const isCircularPaths = require('../lib/get-circular-paths');

const compactObject = obj => {
  return Object.entries(obj)
    .reduce((accumulator, current) => {
      return current[1] != null ? { ...accumulator, [current[0]]: current[1] } : accumulator; 
    }, {});
}

const splitOrder = order => {
  if (!_.isEmpty(order)) {
    return [[order.replace('reverse:', ''), order.startsWith('reverse:') ? 'DESC' : 'ASC']];
  }
  return null;
}

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

const PayloadType = new GraphQLScalarType({
  name: 'Payload',
  description: 'Payload (join custom fields in an hash)',
  parseValue(value) {
    // return JSON.stringify(value);
  },
  serialize(fields) {
    let result = {};
    fields.forEach(field => {
      try {
        result[field.name] = JSON.parse(field.value);
      } catch(e) {
        // do nothing
      }  
    });
    return result;
  },
  parseLiteral(ast) {
    return null;
  },
});


module.exports = ({ Configuration, Message, User, ChatId, Event, Content, Category, Field, sequelize }) => {

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

  const categoryType = new GraphQLObjectType({
    name: 'Category',
    description: 'tbd',
    fields: {
      id: {
        type: new GraphQLNonNull(GraphQLInt),
        description: 'The id of the category',
      },
      name: {
        type: GraphQLString,
        description: '',
      },
      language: {
        type: GraphQLString,
        description: '',
      },
      createdAt: {
        type: DateType
      }
    }
  });

  const newCategoryType = new GraphQLInputObjectType({
    name: 'NewCategory',
    description: 'tbd',
    fields: {
      name: {
        type: GraphQLString,
        description: '',
      },
      language: {
        type: GraphQLString,
        description: '',
      }
    }
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
      source: {
        type: GraphQLString,
        description: '',
      },
      count: {
        type: GraphQLInt,
        description: '',
      },
      sources: {
        type: new GraphQLList(GraphQLString),
        description: 'Only in adding'
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
      sources: {
        type: GraphQLList(GraphQLString),
        description: 'List of current events'
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

  const newFieldType = new GraphQLInputObjectType({
    name: 'NewField',
    description: 'tbd',
    fields: {  
      id: {
        type: GraphQLInt,
        description: 'The id of the field',
      },  
      name: {
        type: GraphQLString,
        description: '',
      },
      type: {
        type: GraphQLString,
        description: '',
      },
      value: {
        type: JSONType,
        description: '',
      }
    }
  });


  const fieldType = new GraphQLObjectType({
    name: 'Field',
    description: 'tbd',
    fields: {
      id: {
        type: new GraphQLNonNull(GraphQLInt),
        description: 'The id of the field',
      },
      name: {
        type: GraphQLString,
        description: '',
      },
      type: {
        type: GraphQLString,
        description: '',
      },
      value: {
        type: JSONType,
        description: '',
      }
    }
  });


  const newContentType = new GraphQLInputObjectType({
    name: 'NewContent',
    description: 'tbd',
    fields: {
      title: {
        type: GraphQLString,
        description: '',
      },
      slug: {
        type: GraphQLString,
        description: '',
      },
      language: {
        type: GraphQLString,
        description: '',
      },
      body: {
        type: GraphQLString,
        description: '',
      },
      payload: {
        type: JSONType,
        description: '',
      },
      fields: {
        type: new GraphQLList(newFieldType),
        description: ''        
      },
      categoryId: {
        type: GraphQLInt
      }
    }
  });

  const contentType = new GraphQLObjectType({
    name: 'Content',
    description: 'tbd',
    fields: {
      id: {
        type: new GraphQLNonNull(GraphQLInt),
        description: 'The id of the content',
      },
      title: {
        type: GraphQLString,
        description: '',
      },
      slug: {
        type: GraphQLString,
        description: '',
      },
      language: {
        type: GraphQLString,
        description: '',
      },
      body: {
        type: GraphQLString,
        description: '',
      },
      fields: {
        type: new GraphQLList(fieldType),
        resolve(root) {
          return root.getFields({ limit: 9999 });
        }
      },
      categoryId: {
        type: GraphQLInt
      },
      category: {
        type: categoryType,
        resolve(root) {
          return root.getCategory();
        }
      },
      payload: {
        type: JSONType,
        description: '',
      },
      json: {
        type: PayloadType,
        resolve(root) {
          return root.getFields({ limit: 9999 });
        }
      },
      createdAt: {
        type: DateType
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
        args: {          
          userId: { type: GraphQLString },
          username: { type: GraphQLString }
        },
        resolve: (root, { userId, username }) => User.count({
          where: compactObject({  
            userId,
            username: username != null ? { [Op.like]: `%${username}%` } : null
          })
        })
      }
    }
  });

  const categoryCounterType = new GraphQLObjectType({ 
    name: 'CategoryCounters',
    description: 'Category Counters',
    fields: {
      count: {
        type: GraphQLInt,
        description: 'Total categories',
        resolve: () => Category.count()
      }
    }
  });

  const contentCounterType = new GraphQLObjectType({ 
    name: 'ContentCounters',
    description: 'Content Counters',
    fields: {
      count: {
        type: GraphQLInt,
        description: 'Total contents',
        args: {
          slug: { type: GraphQLString },
          language: { type: GraphQLString },
          categoryId: { type: GraphQLInt }
        },
        resolve: (root, { slug, categoryId, language }) => Content.count({
          where: compactObject({
            categoryId,
            slug,
            language
          })
        })
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
      },
      contents: {
        type: contentCounterType,
        description: 'Counters for contents',
        resolve: () => {
          return {};
        }
      },
      categories: {
        type: categoryCounterType,
        description: 'Counters for categories',
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
            event: { type: new GraphQLNonNull(newEventType) },
            // TODO define sources
          },
          resolve: async function(root, { event }) {
                        
            // get all connections for this flow
            const nodes = await Event.findAll({ where: { flow: event.flow }})
            
             
            
            
            // if the node (source + target) already exists, then just increment
            //if (existingEvent != null) {
            //  await Event.update({ count: existingEvent.count + 1 }, { where: { flow: event.flow, name: event.name, source: event.source }})
            //  existingEvent.count += 1;
            //  return existingEvent;
            //} else {

            let sources = [...event.sources];

            // while the last event of history is circular, chop the array remove the last event, 
            // then try again
            while (!_.isEmpty(sources) && isCircularPaths(event.name, _.last(sources), nodes, false)) {
              console.log('* IS circular ', _.last(sources),  ' -> ', event.name)  
              sources = _.initial(sources);
            }
            // there's still something
            if (!_.isEmpty(sources)) {
              console.log('* NOT circular ', _.last(sources),  ' -> ', event.name)
              // check if exists
              const existingEvent = nodes.find(node => node.name === event.name && node.source === _.last(sources));
              // check if the event already exists or create a new one
              if (existingEvent != null) {
                await Event.update({ count: existingEvent.count + 1 }, { where: { flow: event.flow, name: event.name, source: _.last(sources) }})
                existingEvent.count += 1;
                return { ...existingEvent.toJSON(), sources: [...sources, event.name] };
              } else {
                let newEvent = await Event.create({ name: event.name, flow: event.flow, source: _.last(sources), count: 1 });                 
                return { ...newEvent.toJSON(), sources: [...sources, event.name] };
              }            
            }
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

        createContent: {
          type: contentType,
          args: {
            content: { type: new GraphQLNonNull(newContentType) }
          },
          resolve: function(root, { content }) {
            return Content.create(content, {
              include: [Content.Fields]
            });
          }
        },

        createCategory: {
          type: categoryType,
          args: {
            category: { type: new GraphQLNonNull(newCategoryType)}
          },
          resolve: function(root, { category }) {
            return Category.create(category);
          }
        },

        editCategory: {
          type: categoryType,
          args: {
            id: { type: new GraphQLNonNull(GraphQLInt)},
            category: { type: new GraphQLNonNull(newCategoryType)}
          },
          resolve(root, { id, category }) {
            return Category.update(category, { where: { id } })
              .then(() => Category.findByPk(id));
          }
        },

        deleteCategory: {
          type: contentType,
          args: {
            id: { type: new GraphQLNonNull(GraphQLInt)}
          },
          resolve: async function(root, { id }) {
            const category = await Category.findByPk(id);
            // destroy user and related chatIds
            if (category != null) {
              await category.destroy();
            }
            return category;
          }
        },

        editContent: {
          type: contentType,
          args: {
            id: { type: new GraphQLNonNull(GraphQLInt)},
            content: { type: new GraphQLNonNull(newContentType) }
          },
          resolve: async (root, { id, content }) => {
            await Content.update(content, { where: { id } })
            const updatedContent = await Content.findByPk(id, { include: [Content.Fields]} );            
            const currentFieldIds = updatedContent.fields.map(field => field.id);
            if (_.isArray(content.fields) && content.fields.length !== 0) {
              let task = when(true); 
              const newFieldIds = _.compact(content.fields.map(field => field.id));
              // now add or update each field present in the payload
              content.fields.forEach(field => {
                if (field.id != null) {
                  task = task.then(() => Field.update(field, { where: { id: field.id } }));
                } else {
                  task = task.then(() => updatedContent.createField(field));
                }
              });
              // remove all current id field that are not included in the list of new ids
              currentFieldIds
                .filter(id => !newFieldIds.includes(id))
                .forEach(id => {
                  task = task.then(() => Field.destroy({ where: { id }}));
                });
              await task;
              return Content.findByPk(id, { include: [Content.Fields]} );

            } else {
              return updatedContent;
            }            
          }
        },

        deleteContent: {
          type: contentType,
          args: {
            id: { type: new GraphQLNonNull(GraphQLInt)}
          },
          resolve: async function(root, { id }) {
            const content = await Content.findByPk(id);
            // destroy user and related chatIds
            if (content != null) {
              await content.destroy();
            }
            return content;
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
            if (user != null && user.userId != null) {
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
            id: { type: GraphQLInt },
            order: { type: GraphQLString },
            userId: { type: GraphQLString },
            username: { type: GraphQLString }
          },
          resolve(root, { order, offset = 0, limit = 10, userId, username, id }) {
            return User.findAll({              
              limit,
              offset,
              order: splitOrder(order),
              where: compactObject({
                id,  
                userId,
                username: username != null ? { [Op.like]: `%${username}%` } : null
              })
            });
          }
        },

        user: {
          type: userType,
          args: {
            userId: { type: GraphQLString }
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

        contents: {
          type: new GraphQLList(contentType),
          args: {
            slug: { type: GraphQLString },
            order: { type: GraphQLString },
            offset: { type: GraphQLInt },
            limit: { type: GraphQLInt },
            categoryId: { type: GraphQLInt },
            id: { type: GraphQLInt },
            language: { type: GraphQLString },
            title: { type: GraphQLString }
          },
          resolve(root, { slug, order, offset = 0, limit = 10, categoryId, language, title, id }) {
            return Content.findAll({
              limit,
              offset,
              order: splitOrder(order),
              where: compactObject({
                id,
                categoryId,
                slug,
                language,
                title: title != null ? { [Op.like]: `%${title}%` } : undefined
              })
            });
          }
        },

        content: {
          type: contentType,
          args: {
            slug: { type: GraphQLString },      
            id: { type: GraphQLInt }
          },
          resolve: resolver(Content)
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
  
        categories: {
          type: new GraphQLList(categoryType),
          args: {
            order: { type: GraphQLString },
            offset: { type: GraphQLInt },
            limit: { type: GraphQLInt }
          },
          resolve: (root, { order = 'name', offset, limit }) => {
            return Category.findAll({
              limit,
              offset,
              order: splitOrder(order)
            });
          }
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





