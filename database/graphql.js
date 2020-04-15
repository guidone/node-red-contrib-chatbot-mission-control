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


module.exports = ({ Configuration, Message, User, ChatId, Event, Content, Category, Field, Context, Admin, sequelize }) => {

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
      },
      context: {
        type: JSONType,
        description: 'The context to update',
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

  const contextType = new GraphQLObjectType({
    name: 'Context',
    description: 'tbd',
    fields: () => ({
      id: {
        type: new GraphQLNonNull(GraphQLInt),
        description: 'The internal id of the chat context',
      },
      chatId: {
        type: GraphQLString,
        description: ''
      },
      userId: {
        type: GraphQLString,
        description: ''
      },
      payload: {
        type: JSONType,
        description: ''
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
      context: {
        type: JSONType,
        description: 'The chat context associated with the user',
        resolve: async user => {
          const context = await Context.findOne({ where: { userId: user.userId }});
          return context != null ? context.payload : null;
        }
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

  const adminType = new GraphQLObjectType({
    name: 'Admin',
    description: 'tbd',
    fields: () => ({
      id: {
        type: new GraphQLNonNull(GraphQLInt),
        description: 'The internal id of the user',
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
      avatar: {
        type: GraphQLString,
        description: '',
      },
      username: {
        type: GraphQLString,
        description: '',
      },
      password: {
        type: GraphQLString,
        description: '',
      },
      permissions: {
        type: GraphQLString,
        description: '',
      },
      createdAt: {
        type: DateType
      },
      payload: {
        type: JSONType,
        description: '',
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
      flag: {
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
      },
      namespace: {
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
      flag: {
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
      namespace: {
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
      namespace: {
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
        args: {
          type: { type: GraphQLString },
          transport: { type: GraphQLString },
          messageId: { type: GraphQLString },
          chatId: { type: GraphQLString },
          userId: { type: GraphQLString },
          flag: { type: GraphQLString },
          inbound: { type: GraphQLBoolean }
        },
        description: 'Total messages',
        resolve: (root, { type, transport, messageId, chatId, userId, flag, inbound }) => Message.count({
          where: compactObject({
            type, transport, messageId, chatId, userId, flag, inbound
          })
        })
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

  const adminCounterType = new GraphQLObjectType({
    name: 'AdminCounters',
    description: 'User Counters',
    fields: {
      count: {
        type: GraphQLInt,
        description: 'Total admins',
        args: {
          username: { type: GraphQLString }
        },
        resolve: (root, { username }) => Admin.count({
          where: compactObject({
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
        args: {
          namespace: { type: GraphQLString }
        },
        description: 'Total categories', // TODO put also namespace
        resolve: (root, { namespace }) => Category.count({
          where: compactObject({
            namespace
          })
        })
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
          namespace: { type: GraphQLString },
          categoryId: { type: GraphQLInt }
        },
        resolve: (root, { slug, categoryId, language, namespace }) => Content.count({
          where: compactObject({
            categoryId,
            slug,
            language,
            namespace
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
      admins: {
        type: adminCounterType,
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

        deleteEvent: {
          type: GraphQLString,
          args: {
            flow: { type: new GraphQLNonNull(GraphQLString) }
          },
          resolve: async function(root, { flow }) {
            await Event.destroy({ where: { flow }});
            return true;
          }
        },

        createEvent: {
          type: eventType,
          args: {
            event: { type: new GraphQLNonNull(newEventType) }
          },
          resolve: async function(root, { event }) {

            // get all connections for this flow
            const nodes = await Event.findAll({ where: { flow: event.flow }})

            let sources = [...event.sources];

            // while the last event of history is circular, chop the array remove the last event,
            // then try again
            while (!_.isEmpty(sources) && isCircularPaths(event.name, _.last(sources), nodes, false)) {
              console.log('* IS circular ', _.last(sources),  ' -> ', event.name)
              sources = _.initial(sources);
            }

            let source = !_.isEmpty(sources) ? _.last(sources) : 'home';

            // there's still something
            //if (!_.isEmpty(sources)) {
              console.log('* NOT circular ', source,  ' -> ', event.name)
              // check if exists
              const existingEvent = nodes.find(node => node.name === event.name && node.source === source);
              // check if the event already exists or create a new one
              if (existingEvent != null) {
                await Event.update({ count: existingEvent.count + 1 }, { where: { flow: event.flow, name: event.name, source }})
                existingEvent.count += 1;
                return { ...existingEvent.toJSON(), sources: [...sources, event.name] };
              } else {
                let newEvent = await Event.create({ name: event.name, flow: event.flow, source, count: 1 });
                return { ...newEvent.toJSON(), sources: [...sources, event.name] };
              }
            //}
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
            id: { type: GraphQLInt},
            userId: { type: GraphQLString },
            user: { type: new GraphQLNonNull(newUserType) }
          },
          async resolve(root, { id, userId, user: value }) {
            let where;
            if (id != null) {
              where = { id };
            } else if (userId != null) {
              where = { userId };
            } else {
              throw 'Missing both id and userId';
            }
            // if context is present, update using userId
            if (value.context) {
              const user = await User.findOne({ where });
              await Context.update({ payload: value.context }, { where: { userId: user.userId }});
              delete value.context;
            }
            await User.update(value, { where })
            return await User.findOne({ where });
          }
        },

        mergeUser: {
          type: userType,
          args: {
            fromId: { type: new GraphQLNonNull(GraphQLInt)},
            toId: { type: new GraphQLNonNull(GraphQLInt)}
          },
          resolve: async function(root, { fromId, toId }) {
            const fromUser = await User.findByPk(fromId);
            const toUser = await User.findByPk(toId);

            const fromChatIds = await ChatId.findAll({ where: { userId: fromUser.userId }});
            const toChatIds = await ChatId.findAll({ where: { userId: toUser.userId }});

            // find all fields from the source user that are empty in the destination user and can be used
            const fieldsToUpdate = ['email', 'first_name', 'last_name', 'username', 'language'];
            const updateToUser = {};
            for (const field of fieldsToUpdate) {
              if (!_.isEmpty(fromUser[field]) && _.isEmpty(toUser[field])) {
                updateToUser[field] = fromUser[field];
                toUser[field] = fromUser[field];
              }
            }
            // update user if not empty
            if (_.isEmpty(updateToUser)) {
              await User.update(updateToUser, { where: { id: toUser.id }});
            }
            // turn only chatIds that don't already exists
            for (const item of fromChatIds) {
              const hasTransport = toChatIds.filter(({ transport }) => transport === item.transport).length !== 0;
              if (!hasTransport) {
                await ChatId.update({ userId: toUser.userId }, { where: { id: item.id }});
              }
            };
            // finally destroy source user
            await User.destroy({ where: { id: fromUser.id }});
            return toUser;
          }
        },

        deleteUser: {
          type: userType,
          args: {
            id: { type: new GraphQLNonNull(GraphQLInt)}
          },
          resolve: async function(root, { id }) {
            const user = await User.findByPk(id);
            const userId = user.userId;
            // destroy user and related chatIds
            if (user != null) {
              await user.destroy();
            }
            await ChatId.destroy({ where: { userId }});
            return user;
          }
        },

        deleteChatId: {
          type: userType,
          args: {
            id: { type: new GraphQLNonNull(GraphQLInt)}
          },
          resolve: async function(root, { id }) {
            const chatId = await ChatId.findByPk(id);
            await chatId.destroy();
            return User.findOne({ where: { userId: chatId.userId }});
          }
        },

        createMessage: {
          type: messageType,
          args: {
            message: { type: new GraphQLNonNull(newMessageType) }
          },
          resolve: async function(root, { message }) {
            const { user, ...newMessage } = message;
            // check if exists userid / transport and create or update
            const existingChatId = await ChatId.findOne({ where: { chatId: message.chatId, transport: message.transport }});
            let userId;
            let currentUser;
            // if no chatId, the create the user and the related chatId-transport using the userId of the message
            if (existingChatId == null) {
              try {
                currentUser = await User.create(user);
              } catch(e) {
                // this could fail, the user already exists (was only deleted the chatId)
                // keep the existing one, the admin may have enriched the payload
                // then get the current user
                currentUser = await User.findOne({ where: { userId: user.userId }});
              }
              userId = user.userId;
              await ChatId.create({ userId: user.userId, chatId: message.chatId, transport: message.transport });
            } else {
              userId = existingChatId.userId;
            }
            const createdMessage = await Message.create({ ...newMessage, userId });
            return createdMessage;
          }
        }
      }
    }),

    query: new GraphQLObjectType({
      name: 'Queries',
      fields: {

        contexts: {
          type: new GraphQLList(contextType),
          args: {
            id: { type: GraphQLInt },
            chatId: { type: GraphQLString },
            userId: { type: GraphQLString }
          },
          resolve: resolver(Context)
        },

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
            username: { type: GraphQLString },
            search: { type: GraphQLString }
          },
          resolve(root, { order, offset = 0, limit = 10, userId, username, id, search }) {
            const whereParams = compactObject({
              id,
              userId,
              username: username != null ? { [Op.like]: `%${username}%` } : null,
            });
            if (search != null) {
              whereParams[Op.or] = [
                { username: { [Op.like]: `%${search}%` } },
                { first_name: { [Op.like]: `%${search}%` } },
                { last_name: { [Op.like]: `%${search}%` } }
              ]
            }
            return User.findAll({
              limit,
              offset,
              order: splitOrder(order),
              where: whereParams
            });
          }
        },

        admins: {
          type: new GraphQLList(adminType),
          args: {
            offset: { type: GraphQLInt },
            limit: { type: GraphQLInt },
            id: { type: GraphQLInt },
            order: { type: GraphQLString },
            username: { type: GraphQLString },
            search: { type: GraphQLString }
          },
          resolve(root, { order, offset = 0, limit = 10, username, id, search }) {
            const whereParams = compactObject({
              id,
              username: username != null ? { [Op.like]: `%${username}%` } : null,
            });
            if (search != null) {
              whereParams[Op.or] = [
                { username: { [Op.like]: `%${search}%` } },
                { first_name: { [Op.like]: `%${search}%` } },
                { last_name: { [Op.like]: `%${search}%` } }
              ]
            }
            return Admin.findAll({
              limit,
              offset,
              order: splitOrder(order),
              where: whereParams
            });
          }
        },

        user: {
          type: userType,
          args: {
            userId: { type: GraphQLString },
            id: { type: GraphQLInt }
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
            ids: { type: new GraphQLList(GraphQLInt)},
            slugs: { type: new GraphQLList(GraphQLString)},
            language: { type: GraphQLString },
            namespace: { type: GraphQLString },
            title: { type: GraphQLString },
            search: { type: GraphQLString }
          },
          resolve(root, { slug, order, offset = 0, limit = 10, categoryId, language, title, id, ids, namespace, search, slugs }) {
            const whereParams = compactObject({
              id: _.isArray(ids) && !_.isEmpty(ids) ? { [Op.in]: ids } : id,
              categoryId,
              slug: _.isArray(slugs) && !_.isEmpty(slugs) ? { [Op.in]: slugs } : slug,
              language,
              namespace
            });
            if (title != null) {
              whereParams.title = { [Op.like]: `%${title}%` };
            }
            if (search != null) {
              whereParams[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { slug: { [Op.like]: `%${search}%` } },
              ]
            }
            return Content.findAll({
              limit,
              offset,
              order: splitOrder(order),
              where: whereParams
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
            flag: { type: GraphQLString },
            inbound: { type: GraphQLBoolean }
          },
          resolve: resolver(Message)
        },

        categories: {
          type: new GraphQLList(categoryType),
          args: {
            order: { type: GraphQLString },
            namespace: { type: GraphQLString },
            offset: { type: GraphQLInt },
            limit: { type: GraphQLInt }
          },
          resolve: (root, { order = 'name', offset, limit, namespace }) => {
            return Category.findAll({
              limit,
              offset,
              order: splitOrder(order),
              where: compactObject({
                namespace
              })
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
