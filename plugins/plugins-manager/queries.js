import gql from 'graphql-tag';

const INSTALL_PLUGIN = gql`
mutation ($plugin: String!, $url: String!, $version: String!) {
  installPlugin(plugin: $plugin, url: $url, version: $version) {
    id,
    plugin,
    filename,
    version
  }
}`;

const UNISTALL_PLUGIN = gql`
mutation($plugin: String!) {
  uninstallPlugin(plugin: $plugin) {
    id
  }
}`;

const CHATBOT = gql`
query {
  chatbot {
    id,
    name,
    description,
    plugins {
      id,
      plugin,
      filename,
      version
    }
  }
}`;

export { INSTALL_PLUGIN, CHATBOT, UNISTALL_PLUGIN };