
const { ApolloServer } = require('apollo-server-express');
const { resolver } = require('graphql-sequelize');

const { Configuration } = require('./sqlite-schema');
// todo: create if not exist 
//sequelize.sync({ force: true });

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
        /*resolve(root, { plugin }) {
          return Plugin.create(plugin);
        }*/
        resolve(root, { configuration }) {
          return Configuration.findOne({ where: { namespace: configuration.namespace }})
            .then(found => {
              if (found != null) {
                return Configuration.update(configuration, { where: { id: found.id }})
                  .then(() => Configuration.findByPk(found.id));  
              } 
              return Configuration.create(extension);
            });
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

      version: {
        type: GraphQLInt,
        resolve: () => 42
      }
    }
  })
});


const graphQLServer = new ApolloServer({ schema });

module.exports = graphQLServer;