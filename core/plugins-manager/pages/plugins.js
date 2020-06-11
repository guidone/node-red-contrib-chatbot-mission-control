import React, { useContext, useEffect, useState } from 'react';
import { Button, ButtonToolbar, Notification, Icon, Message, FlexboxGrid } from 'rsuite';
import { useMutation, useApolloClient } from 'react-apollo';
import useFetch from 'use-http';
import ClipboardJS from 'clipboard';
import Showdown from 'showdown';

import ModalLoader from '../../../src/components/loader-modal';
import PageContainer from '../../../src/components/page-container';
import Breadcrumbs from '../../../src/components/breadcrumbs';
import SmallTag from '../../../src/components/small-tag';
import Confirm from '../../../src/components/confirm';
import { useModal } from '../../../src/components/modal';
import useConfiguration from '../../../src/hooks/configuration';
import AppContext from '../../../src/common/app-context';
import ShowError from '../../../src/components/show-error';
import useSettings from '../../../src/hooks/settings';

import { INSTALL_PLUGIN, CHATBOT, UNISTALL_PLUGIN } from '../queries';

import FlowSource from './flow-source';
import versionCompare from '../helpers/version-compare';


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


/*const PLUGINS = [
  {
    id: 'commands',
    name: 'Commands',
    version : '1.0.1',
    description: 'Show some content on response to commands-like messages...',
    url: 'https://gist.githubusercontent.com/guidone/bd2d4fec49198961e946ce42c5d373ba/raw/4fa7f4cb89dc131528cc5815e8640cfa659147d4/commands.js',
    flow: 'https://gist.githubusercontent.com/guidone/ddafe29046f69e757faa2388e20d11a5/raw/afbe7969b0cd44a77c24716bffeed94a2878e484/commands.flow',
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
    id: 'shop-openings',
    name: 'Openings',
    version : '1.0.0',
    description: 'Handle shop hours, answer to sentences like are you open?',
    url: 'https://gist.githubusercontent.com/guidone/f391fd21ad3768a5abfb0272d9263e84/raw/615010fa4e799ea22f624e21e50f0a364d0d3181/shop-openings.js',
    author: {
      name: 'guidone'
    }
  }

]*/

const isInstalled = (current, plugins) => plugins.some(plugin => plugin.plugin === current.id);

const needUpdate = (current, plugins) => {
  const installed = plugins.find(plugin => plugin.plugin === current.id);

  return versionCompare(installed.version, current.version) === -1;
}







const CopyAndPasteButton = ({ text, disabled = false, label = 'Copy to Clipboard' }) => {
  useEffect(() => {
    const clipboard = new ClipboardJS('.ui-clipboard-button', {
      text: () => text
    });
    return () => clipboard.destroy();
  }, [text]);

  return (
    <Button
      disabled={disabled}
      onClick={() => {
        Notification.success({ title: 'Copied!', description: 'The Node-RED flow was copied to the clipboard '});
      }}
      className="ui-clipboard-button"
      appearance="ghost"
    >
      {label}
    </Button>
  );
};

const CopyAndPasteFlow = ({ plugin }) => {
  const { loading, data = [] } = useFetch(plugin.flow, {}, []);
  return (
    <CopyAndPasteButton
      disabled={loading}
      text={JSON.stringify(data)}
    />
  );
}



const PluginPanel = ({
  plugin,
  plugins,
  onInstall = () => {},
  onUninstall= () => {},
  disabled = false
}) => {
  const { state: { chatbot } } = useContext(AppContext);
  const { open, close } = useModal({
    view: FlowSource,
    title: `Node-RED flow for ${plugin.name}`,
    size: 'lg',
    labelSubmit: 'Close',
    labelCancel: null,
    align: 'center',
    custom: value => <CopyAndPasteFlow plugin={value}/>
  });

  const installed = isInstalled(plugin, chatbot.plugins);
  const upgrade = installed && needUpdate(plugin, chatbot.plugins);
  const converter = new Showdown.Converter({ openLinksInNewWindow: true });


  return (
    <div className="plugin">
      <div className="meta">
        <h5>
          {plugin.name}
        </h5>
        <div
          className="description"
          dangerouslySetInnerHTML={{ __html: converter.makeHtml(plugin.description)}}
        />
        <div className="info">
          <SmallTag color="#0579DB">{plugin.version}</SmallTag>
          {plugin.author != null && (
            <span className="author">
              <Icon icon="user"/>
              &nbsp;
              {plugin.author.url != null && (
                <a href={plugin.author.url} target="_blank">{plugin.author.name}</a>
              )}
              {plugin.author.url == null && <span>{plugin.author.name}</span>}
            </span>
          )}
        </div>
      </div>
      <div className="buttons">
        <ButtonToolbar size="sm">
          {installed && plugin.flow != null && (
            <Button
              disabled={disabled}
              size="sm"
              appearance="ghost"
              onClick={async () => {
                await open(plugin);
                close();
              }}
            >Import flow</Button>
          )}
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
  const { environment } = useSettings();
  const [error, setError] = useState(null);
  const client = useApolloClient();
  const { } = useConfiguration({
    namespace: 'market-place',
    onLoaded: data => {
      if (data != null && !_.isEmpty(data.jsonbin_id)) {
        get(`/b/${data.jsonbin_id}/latest`);
      } else {
        setError('Missing JSON bin id in configuration');
      }
    }
  })
  const { data: plugins, get, error: fetchError } = useFetch('https://api.jsonbin.io', {});
  const { install, uninstall, saving } = usePlugins({
    onCompleted: async () => {
      try {
        const response = await client.query({ query: CHATBOT, fetchPolicy: 'network-only' });
        console.log('updated chatbot', response)
        dispatch({ type: 'updateChatbot', chatbot: response.data.chatbot });
      } catch(e) {
        setError(e);
      }
    }
  });

  const pageError = error || fetchError;
  const loading = plugins == null;

  return (
    <PageContainer className="page-plugins">
      <Breadcrumbs pages={['Plugins']}/>
      <FlexboxGrid justify="space-between">
        <FlexboxGrid.Item colspan={17} style={{ paddingTop: '20px', paddingLeft: '20px' }}>
          {pageError != null && <ShowError error={pageError} />}
          {environment === 'development' && (
            <Message
              type="warning"
              title="Development mode"
              description={<p>
                Your are in <strong>development mode</strong>, all plugins are loaded with <code>import ... from ... </code> defined in
                the file <code>./plugins.js</code>, this is a development mode, any changes to a plugin will cause reload, installing and uninstallig plugins
                in this page will not affect the plugins actually loaded.
              </p>}
            />
          )}
          {loading && pageError == null && <ModalLoader />}
          {!loading && pageError == null && (
            <div className="plugins">
              {plugins.map(plugin => (
                <PluginPanel
                  key={plugin.id}
                  plugin={plugin}
                  plugins={plugins}
                  disabled={saving || loading}
                  onInstall={async plugin => {
                    if (await Confirm(
                      <div>Install plugin <strong>{plugin.name}</strong> ?</div>,
                      { okLabel: 'Ok, install'}
                    )) {
                      try {
                        await install({ variables: {
                          plugin: plugin.id,
                          url: plugin.url,
                          version: plugin.version,
                          initialConfiguration: plugin.initialConfiguration
                        }});
                        Notification.success({ title: 'Installed', description: `Plugin "${plugin.id}" installed succesfully` });
                      } catch(e) {
                        Notification.error({ title: 'Error', description: `Something went wrong trying to install the plugin "${plugin.id}"` });
                      }
                    }
                  }}
                  onUninstall={async plugin => {
                    if (await Confirm(
                      <div>Uninstall plugin <strong>{plugin.name}</strong> ?</div>,
                      { okLabel: 'Ok, uninstall'}
                    )) {
                      try {
                        await uninstall({ variables: { plugin: plugin.id }});
                        Notification.success({ title: 'Unistalled', description: `Plugin "${plugin.name}" uninstalled succesfully` });
                      } catch(e) {
                        Notification.error({ title: 'Error', description: `Something went wrong trying to uninstall the plugin "${plugin.name}"` });
                      }
                    }
                  }}
                />
              ))}
            </div>
          )}
        </FlexboxGrid.Item>
        <FlexboxGrid.Item colspan={7}>
          some info here
        </FlexboxGrid.Item>
      </FlexboxGrid>
    </PageContainer>
  );
}

export default PluginsManager;