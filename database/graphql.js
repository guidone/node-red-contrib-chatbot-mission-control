const { ApolloServer, graphqlExpress } = require('apollo-server-express');
const { resolver } = require('graphql-sequelize');
const { Kind } = require('graphql/language');
const { PubSub, withFilter } = require('graphql-subscriptions');
const _ = require('lodash');
const Sequelize = require('sequelize');
const fetch = require('node-fetch');
const fs = require('fs');

const Op = Sequelize.Op;
const pubsub = new PubSub();

const { when, hash } = require('../lib/utils');
const isCircularPaths = require('../lib/get-circular-paths');

const deleteFile = filename => new Promise((resolve, reject) => {
  fs.unlink(filename, err => {
    if (err) {
      reject(err)
    } else {
      resolve();
    }
  });
});

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


module.exports = ({
  Configuration,
  Message,
  User,
  ChatId,
  Event,
  Content,
  Category,
  Field,
  Context,
  Admin,
  Record,
  Device,
  ChatBot,
  Plugin,
  sequelize,
  mcSettings
}) => {

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

  const deviceType = new GraphQLObjectType({
    name: 'Device',
    description: 'tbd',
    fields: () => ({
      id: {
        type: new GraphQLNonNull(GraphQLInt),
        description: 'The unique id of the device',
      },
      status: {
        type: GraphQLString,
        description: ''
      },
      name: {
        type: GraphQLString,
        description: ''
      },
      version: {
        type: GraphQLString,
        description: ''
      },
      status: {
        type: GraphQLString,
        description: ''
      },
      payload: {
        type: JSONType,
        description: ''
      },
      jsonSchema: {
        type: JSONType,
        description: ''
      },
      snapshot: {
        type: JSONType,
        description: ''
      },
      lat: {
        type: GraphQLFloat,
        description: ''
      },
      lon: {
        type: GraphQLFloat,
        description: ''
      },
      createdAt: {
        type: DateType
      },
      updatedAt: {
        type: DateType
      },
      lastUpdate: {
        type: DateType
      }
    })
  });

  const newDeviceType = new GraphQLInputObjectType({
    name: 'NewDevice',
    description: 'tbd',
    fields: () => ({
      status: {
        type: GraphQLString,
        description: ''
      },
      name: {
        type: GraphQLString,
        description: ''
      },
      version: {
        type: GraphQLString,
        description: ''
      },
      status: {
        type: GraphQLString,
        description: ''
      },
      payload: {
        type: JSONType,
        description: ''
      },
      jsonSchema: {
        type: JSONType,
        description: ''
      },
      snapshot: {
        type: JSONType,
        description: ''
      },
      lat: {
        type: GraphQLFloat,
        description: ''
      },
      lon: {
        type: GraphQLFloat,
        description: ''
      },
      createdAt: {
        type: DateType
      },
      updatedAt: {
        type: DateType
      },
      lastUpdate: {
        type: DateType
      }
    })
  });

  const recordType = new GraphQLObjectType({
    name: 'Record',
    description: 'tbd',
    fields: () => ({
      id: {
        type: new GraphQLNonNull(GraphQLInt),
        description: '',
      },
      type: {
        type: GraphQLString,
        description: ''
      },
      title: {
        type: GraphQLString,
        description: ''
      },
      status: {
        type: GraphQLString,
        description: ''
      },
      transport: {
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
      },
      createdAt: {
        type: DateType
      },
      user: {
        type: userType,
        resolve: user => User.findOne({ where: { userId: user.userId }})
      }
    })
  });

  const newRecordType = new GraphQLInputObjectType({
    name: 'NewRecord',
    description: 'tbd',
    fields: () => ({
      type: {
        type: GraphQLString,
        description: ''
      },
      title: {
        type: GraphQLString,
        description: ''
      },
      status: {
        type: GraphQLString,
        description: ''
      },
      transport: {
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
      },
      createdAt: {
        type: DateType
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
      },
      records: {
        type: new GraphQLList(recordType),
        args: {
          order: { type: GraphQLString },
          type: { type: GraphQLString },
          status: { type: GraphQLString },
          offset: { type: GraphQLInt },
          limit: { type: GraphQLInt }
        },
        resolve: (user, { order = 'createdAt', offset, limit, type, status }) => {
          return Record.findAll({
            limit,
            offset,
            order: splitOrder(order),
            where: compactObject({ type, status, userId: user.userId })
          });
        }
      },
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

  const newAdminType = new GraphQLInputObjectType({
    name: 'NewAdmin',
    description: 'tbd',
    fields: () => ({
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

  const pluginType = new GraphQLObjectType({
    name: 'Plugin',
    description: 'tbd',
    fields: {
      id: {
        type: new GraphQLNonNull(GraphQLInt),
        description: 'The id of the plugin',
      },
      plugin: {
        type: GraphQLString,
        description: '',
      },
      version: {
        type: GraphQLString,
        description: '',
      },
      filename: {
        type: GraphQLString,
        description: '',
      }
    }
  });

  const newPluginType = new GraphQLInputObjectType({
    name: 'NewPlugin',
    description: 'tbd',
    fields: {
      plugin: {
        type: GraphQLString,
        description: '',
      },
      version: {
        type: GraphQLString,
        description: '',
      },
      filename: {
        type: GraphQLString,
        description: '',
      }
    }
  });

  const chatbotType = new GraphQLObjectType({
    name: 'Chatbot',
    description: 'tbd',
    fields: {
      id: {
        type: new GraphQLNonNull(GraphQLInt),
        description: 'The id of the chatbot',
      },
      name: {
        type: GraphQLString,
        description: '',
      },
      description: {
        type: GraphQLString,
        description: '',
      },
      guid: {
        type: GraphQLString,
        description: '',
      },
      plugins: {
        type: new GraphQLList(pluginType),
        description: 'The list of installed plugins',
        resolve: (root) => root.getPlugins({ limit: 9999 })
      }
    }
  });

  const inputChatbotType = new GraphQLInputObjectType({
    name: 'InputChatbot',
    description: 'tbd',
    fields: {
      name: {
        type: GraphQLString,
        description: '',
      },
      description: {
        type: GraphQLString,
        description: '',
      },
      guid: {
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

  const deviceCounterType = new GraphQLObjectType({
    name: 'DeviceCounters',
    description: 'Device Counters',
    fields: {
      count: {
        type: GraphQLInt,
        description: 'Total devices',
        args: {
        },
        resolve: (root, { }) => Device.count()
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
        description: 'Total categories',
        resolve: (root, { namespace }) => Category.count({
          where: compactObject({
            namespace
          })
        })
      }
    }
  });

  const recordCounterType = new GraphQLObjectType({
    name: 'RecordCounters',
    description: 'Record Counters',
    fields: {
      count: {
        type: GraphQLInt,
        args: {
          type: { type: GraphQLString },
          userId: { type: GraphQLString },
          status: { type: GraphQLString }
        },
        description: 'Total records',
        resolve: (root, { type, userId, status }) => Record.count({
          where: compactObject({
            type, userId, status
          })
        })
      }
    }
  });

  const buildContentQuery = ({ slug, categoryId, language, title, id, ids, namespace, search, slugs }) => {
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
    return whereParams;
  }


  const contentCounterType = new GraphQLObjectType({
    name: 'ContentCounters',
    description: 'Content Counters',
    fields: {
      count: {
        type: GraphQLInt,
        description: 'Total contents',
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
        resolve(root, { slug, categoryId, language, title, id, ids, namespace, search, slugs }) {
          return Content.count({
            where: buildContentQuery({ slug, categoryId, language, title, id, ids, namespace, search, slugs })
          });
        }
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
      },
      records: {
        type: recordCounterType,
        description: 'Counters for user records',
        resolve: () => {
          return {};
        }
      },
      devices: {
        type: deviceCounterType,
        description: 'Counters for devices',
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

        createRecord: {
          type: recordType,
          args: {
            record: { type: new GraphQLNonNull(newRecordType) }
          },
          resolve: function(root, { record }) {
            return Record.create(record);
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

        editChatbot: {
          type: chatbotType,
          args: {
            chatbot: { type: new GraphQLNonNull(inputChatbotType)}
          },
          async resolve(root, { chatbot }) {
            const currentChatbot = await ChatBot.findOne();
            await ChatBot.update(chatbot, { where: { id: currentChatbot.id } });
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

        editRecord: {
          type: recordType,
          args: {
            id: { type: new GraphQLNonNull(GraphQLInt)},
            record: { type: new GraphQLNonNull(newRecordType)}
          },
          resolve(root, { id, record }) {
            return Record.update(record, { where: { id } })
              .then(() => Record.findByPk(id));
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

        deleteRecord: {
          type: recordType,
          args: {
            id: { type: new GraphQLNonNull(GraphQLInt)}
          },
          resolve: async function(root, { id }) {
            const record = await Record.findByPk(id);
            // destroy user and related chatIds
            if (record != null) {
              await record.destroy();
            }
            return record;
          }
        },

        deleteAdmin: {
          type: adminType,
          args: {
            id: { type: new GraphQLNonNull(GraphQLInt)}
          },
          resolve: async function(root, { id }) {
            const admin = await Admin.findByPk(id);
            await Admin.destroy({ where: { id }});
            return admin;
          }
        },

        editAdmin: {
          type: adminType,
          args: {
            id: { type: GraphQLInt},
            admin: { type: new GraphQLNonNull(newAdminType) }
          },
          async resolve(root, { id, admin }) {
            if (!_.isEmpty(admin.password)) {
              admin.password = hash(admin.password, { salt: mcSettings.salt });
            }
            await Admin.update(admin, { where: { id } })
            return await Admin.findOne({ where: { id } });
          }
        },

        createAdmin: {
          type: adminType,
          args: {
            admin: { type: new GraphQLNonNull(newAdminType)}
          },
          resolve: function(root, { admin }) {
            if (!_.isEmpty(admin.password)) {
              admin.password = hash(admin.password, { salt: mcSettings.salt });
            }
            return Admin.create(admin);
          }
        },

        editDevice: {
          type: deviceType,
          args: {
            id: { type: GraphQLInt },
            device: { type: newDeviceType }
          },
          async resolve(root, { id, device }) {
            console.log('--->', device, id)
            await Device.update(device, { where: { id }});
            const updated = await Device.findOne({ where: { id }});
            console.log('publish', 'deviceUpdated', updated.id)
            pubsub.publish('deviceUpdated', { device: updated.toJSON() });
            return updated;
          }
        },

        deleteDevice: {
          type: deviceType,
          args: {
            id: { type: GraphQLInt }
          },
          resolve: async function(root, { id }) {
            const device = await Device.findByPk(id);
            await Device.destroy({ where: { id }});
            return device;
          }
        },

        createDevice: {
          type: deviceType,
          args: {
            device: { type: newDeviceType }
          },
          async resolve(root, { device }) {
            return Device.create(device);
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
            await Context.destroy({ where: { userId }});
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

        installPlugin: {
          type: pluginType,
          args: {
            plugin: { type: GraphQLString },
            url: { type: GraphQLString },
            version: { type: GraphQLString },
            initialConfiguration: { type: GraphQLString },
            initialContent: { type: newContentType }
          },
          resolve: async function(root, { plugin, url, version, initialConfiguration, initialContent }) {

            const response = await fetch(url);
            console.log('RESPONSE', response.status);
            if (!response.ok) {
              throw `Error trying to download plugin at ${url}`;
            }

            // write down plugin
            const filename = `${plugin}-${hash((new Date().toString()))}.js`;
            const pluginFile = fs.createWriteStream(`${mcSettings.pluginsPath}/${filename}`);
            response.body.pipe(pluginFile);

            const chatbot = await ChatBot.findOne();
            // destroy and re-create
            await Plugin.destroy({ where: { plugin }});
            const installedPlugin = await Plugin.create({ plugin, url, version, chatbotId: chatbot.id, filename });
            // create default configuration, if any, if not already exist
            if (!_.isEmpty(initialConfiguration)) {
              const existsConfiguration = await Configuration.findOne({ where: { namespace: plugin }});
              if (existsConfiguration == null) {
                await Configuration.create({
                  namespace: plugin,
                  payload: initialConfiguration
                });
              }
            }
            // create content if needed
            if (initialContent != null && !_.isEmpty(initialContent.title)) {
              let slugExists = false;
              if (!_.isEmpty(initialContent.slug)) {
                slugExists = await Content.findOne({ where: { slug: initialContent.slug }}) != null;
              }
              if (!slugExists) {
                await Content.create({
                  namespace: 'content',
                  language: 'en',
                  ...initialContent
                });
              }
            }
            return installedPlugin;
          }
        },

        updatePlugin: {
          type: pluginType,
          args: {
            plugin: { type: GraphQLString },
            url: { type: GraphQLString },
            version: { type: GraphQLString },
            initialConfiguration: { type: GraphQLString }
          },
          resolve: async function(root, { plugin, url, version, initialConfiguration }) {
            // get the current plugin
            const currentInstall = await Plugin.findOne({ where: { plugin }});
            // if found, otherwise just create
            if (currentInstall != null) {
              deleteFile(`${mcSettings.pluginsPath}/${currentInstall.filename}`);
              await currentInstall.destroy();
            }
            // get the plugin code
            const response = await fetch(url);
            const filename = `${plugin}-${hash((new Date().toString()))}.js`;
            const pluginFile = fs.createWriteStream(`${mcSettings.pluginsPath}/${filename}`);
            response.body.pipe(pluginFile);

            const chatbot = await ChatBot.findOne();
            // destroy and re-create
            await Plugin.destroy({ where: { plugin }});
            const installedPlugin = await Plugin.create({ plugin, url, version, chatbotId: chatbot.id, filename });
            // create default configuration, if any, if not already exist
            if (!_.isEmpty(initialConfiguration)) {
              const existsConfiguration = await Configuration.findOne({ where: { namespace: plugin }});
              if (existsConfiguration == null) {
                await Configuration.create({
                  namespace: plugin,
                  payload: initialConfiguration
                });
              }
            }
            return installedPlugin;
          }
        },

        uninstallPlugin: {
          type: pluginType,
          args: {
            plugin: { type: GraphQLString }
          },
          resolve: async function(root, { plugin }) {
            const deletedPlugin = await Plugin.findOne({ where: { plugin }});
            await Plugin.destroy({ where: { plugin }});
            await Configuration.destroy({ where: { namespace: plugin }});
            try {
              await deleteFile(`${mcSettings.pluginsPath}/${deletedPlugin.filename}`);
            } catch(e) {
              // do nothing, perhaps dir was removed
            }
            return deletedPlugin;
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
              if (message.chatId != null) {
                await ChatId.create({ userId: user.userId, chatId: message.chatId, transport: message.transport });
              } else {
                console.trace(`Warning: received message without chatId for transport ${message.transport}`)
              }
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

        chatbot: {
          type: chatbotType,
          resolve: async() => ChatBot.findOne()
        },

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
            return Content.findAll({
              limit,
              offset,
              order: splitOrder(order),
              where: buildContentQuery({ slug, categoryId, language, title, id, ids, namespace, search, slugs })
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

        device: {
          type: deviceType,
          args: {
            id: { type: GraphQLInt }
          },
          resolve: resolver(Device)
        },

        record: {
          type: recordType,
          args: {
            id: { type: GraphQLInt }
          },
          resolve: resolver(Record)
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

        records: {
          type: new GraphQLList(recordType),
          args: {
            order: { type: GraphQLString },
            type: { type: GraphQLString },
            status: { type: GraphQLString },
            userId: { type: GraphQLString },
            offset: { type: GraphQLInt },
            limit: { type: GraphQLInt }
          },
          resolve: (root, { order = 'createdAt', offset, limit, type, userId, status }) => {
            return Record.findAll({
              limit,
              offset,
              order: splitOrder(order),
              where: compactObject({ type, userId, status })
            });
          }
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

        devices: {
          type: new GraphQLList(deviceType),
          args: {
            order: { type: GraphQLString },
            offset: { type: GraphQLInt },
            limit: { type: GraphQLInt }
          },
          resolve: (root, { order = 'name', offset, limit }) => {
            return Device.findAll({
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
    }),


    subscription: new GraphQLObjectType({
      name: 'Subscriptions',
      fields: {
        deviceUpdated: {
          type: deviceType,
          subscribe: () => pubsub.asyncIterator('deviceUpdated'),
          args: {
            id: { type: GraphQLInt }
          },
          resolve: (payload) => {
            //console.log('payload', payload)
            return payload.device;
          },
        }
      }

    })

  });

  const graphQLServer = new ApolloServer({
    schema
  });

  return { graphQLServer, graphQLSchema: schema };
};
