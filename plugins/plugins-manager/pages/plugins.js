import React, { useContext } from 'react';
import { Button, ButtonToolbar, Notification } from 'rsuite';
import { useQuery, useMutation, useApolloClient } from 'react-apollo';



import PageContainer from '../../../src/components/page-container';
import Breadcrumbs from '../../../src/components/breadcrumbs';
import SmallTag from '../../../src/components/small-tag';

import { INSTALL_PLUGIN, CHATBOT, UNISTALL_PLUGIN } from '../queries';

import AppContext from '../../../src/common/app-context';


const usePlugins = ({ onCompleted = () => {} } = {}) => {
  const [
    install,
    { loading: installLoading, error: installError },
  ] = useMutation(INSTALL_PLUGIN, { onCompleted });
  const [
    uninstall,
    { loading: uninstallLoading, error: uninstallError },
  ] = useMutation(UNISTALL_PLUGIN, { onCompleted });

  return {
    saving: installLoading || uninstallLoading,
    error: installError || uninstallError,
    install,
    uninstall
  };
};


const PLUGINS = [
  {
    id: 'commands',
    name: 'Commands',
    version : '1.0.1',
    description: 'Show some content on response to commands-like messages...',
    url: 'https://gist.githubusercontent.com/guidone/bd2d4fec49198961e946ce42c5d373ba/raw/4fa7f4cb89dc131528cc5815e8640cfa659147d4/commands.js',
    author: {
      name: 'guidone'
    }
  },
  {
    id: 'welcome-message',
    name: 'Welcome Message',
    version : '1.0.0',
    description: 'Show a welcome message for the new users of the chatbot',
    url: 'https://gist.githubusercontent.com/guidone/be3d57ece22d366908e45b53b6478915/raw/7f0371e1b9f0a272c4989e844c341ebe52229e08/welcome-message.js',
    author: {
      name: 'guidone'
    }
  },
  {
    id: 'send-message',
    name: 'Send Message',
    version : '1.0',
    description: 'Contact directly a user of the chatbot',
    author: {
      name: 'guidone'
    }
  },
  {
    id: 'openings',
    name: 'Openings',
    version : '1.0',
    description: 'Handle shop hours, answer to sentences like are you open?',
    author: {
      name: 'guidone'
    }
  }

]

const isInstalled = (current, plugins) => plugins.some(plugin => plugin.plugin === current.id);

const needUpdate = (current, plugins) => {
  const installed = plugins.find(plugin => plugin.plugin === current.id);

  return versionCompare(installed.version, current.version) === -1;
}

function versionCompare(v1, v2, options) {
  var lexicographical = options && options.lexicographical,
      zeroExtend = options && options.zeroExtend,
      v1parts = v1.split('.'),
      v2parts = v2.split('.');

  function isValidPart(x) {
      return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
  }

  if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
      return NaN;
  }

  if (zeroExtend) {
      while (v1parts.length < v2parts.length) v1parts.push("0");
      while (v2parts.length < v1parts.length) v2parts.push("0");
  }

  if (!lexicographical) {
      v1parts = v1parts.map(Number);
      v2parts = v2parts.map(Number);
  }

  for (var i = 0; i < v1parts.length; ++i) {
      if (v2parts.length == i) {
          return 1;
      }

      if (v1parts[i] == v2parts[i]) {
          continue;
      }
      else if (v1parts[i] > v2parts[i]) {
          return 1;
      }
      else {
          return -1;
      }
  }

  if (v1parts.length != v2parts.length) {
      return -1;
  }

  return 0;
}


const PluginPanel = ({
  plugin,
  plugins,
  onInstall = () => {},
  onUninstall= () => {},
  disabled = false
}) => {
  const { state: { chatbot } } = useContext(AppContext);

  console.log('chatbot', chatbot, plugins)
  const installed = isInstalled(plugin, chatbot.plugins);
  const upgrade = installed && needUpdate(plugin, chatbot.plugins);

  return (
    <div className="plugin">
      <div className="preview">image</div>
      <div className="meta">
        <h5>
          {plugin.name}
          &nbsp;<SmallTag color="#0579DB">{plugin.version}</SmallTag>
        </h5>
        <div className="description">
          {plugin.description}
        </div>

        <ButtonToolbar size="sm">
          {installed && (
            <Button
              disabled={disabled}
              size="sm"
              color="red"
              onClick={() => onUninstall(plugin)}
            >Uninstall</Button>
          )}
          {!installed && (
            <Button
              disabled={disabled}
              size="sm"
              color="blue"
              onClick={() => onInstall(plugin)}
            >Install</Button>
          )}
          {upgrade && (
            <Button
              disabled={disabled}
              size="sm"
              color="orange"
            >Update</Button>
          )}
        </ButtonToolbar>
      </div>


    </div>
  );
};




const PluginsManager = ({ dispatch }) => {
  const client = useApolloClient();
  const { loading, plugins, error,  } = { plugins: PLUGINS, loading: false }
  const { install, uninstall, saving } = usePlugins({
    onCompleted: async () => {
      try {
        const response = await client.query({ query: CHATBOT, fetchPolicy: 'network-only' });
        console.log('updated chatbot', response)
        dispatch({ type: 'updateChatbot', chatbot: response.data.chatbot });
      } catch(e) {
        console.log('e', e)
      }
    }
  });

  return (
    <PageContainer className="page-plugins">
      <Breadcrumbs pages={['Plugins']}/>

      {!loading && (
        <div className="plugins">
          {plugins.map(plugin => (
            <PluginPanel
              key={plugin.id}
              plugin={plugin}
              plugins={plugins}
              disabled={saving || loading}
              onInstall={async plugin => {
                try {
                  await install({ variables: {
                    plugin: plugin.id,
                    url: plugin.url,
                    version: plugin.version
                  }});
                  Notification.success({ title: 'Installed', description: `Plugin "${plugin.id}" installed succesfully` });
                } catch(e) {
                  Notification.error({ title: 'Error', description: `Something went wrong trying to install the plugin "${plugin.id}"` });
                }
              }}
              onUninstall={async plugin => {
                try {
                  await uninstall({ variables: { plugin: plugin.id }});
                  Notification.success({ title: 'Unistalled', description: `Plugin "${plugin.id}" uninstalled succesfully` });
                } catch(e) {
                  Notification.error({ title: 'Error', description: `Something went wrong trying to uninstall the plugin "${plugin.id}"` });
                }
              }}

            />
          ))}
        </div>
      )}

    </PageContainer>
  );
}

export default PluginsManager;