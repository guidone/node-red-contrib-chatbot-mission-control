import React, { useContext, useEffect, useMemo, useState, Fragment } from 'react';
import { Button, ButtonToolbar, Notification, Icon, Message, FlexboxGrid, Input, Checkbox } from 'rsuite';
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
import { TableFilters } from '../../../src/components';

import { INSTALL_PLUGIN, CHATBOT, UNISTALL_PLUGIN } from '../queries';

import FlowSource from './flow-source';
import versionCompare from '../helpers/version-compare';
import PluginPanel from './plugin-panel';


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





const filtersSchema = [
  {
    name: 'Name',
    type: 'string',
    name: 'name',
    control: Input,
    placeholder: 'Search plugin'
  }
];


const CheckTree = ({ value = [], onChange, data }) => {
  return (
    <div>
      {data.map(item => (
        <Checkbox
          checked={value != null && value.includes(item.value)}
          onChange={() => {
            if (value != null && value.includes(item.value)) {
              onChange(value.filter(keyword => keyword != item.value))
            } else if (value != null && !value.includes(item.value)) {
              onChange([...value, item.value]);
            } else {
              onChange([item.value]);
            }
          }}
        >
          <span className="plugin-keyword">
            {item.label} <span className="count">{item.count}</span>
          </span>
        </Checkbox>
      ))}
    </div>
  );
};



const PluginsManager = ({ dispatch }) => {
  const { environment } = useSettings();
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
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
        dispatch({ type: 'updateChatbot', chatbot: response.data.chatbot });
      } catch(e) {
        setError(e);
      }
    }
  });

  const pageError = error || fetchError;
  const loading = plugins == null;

  // collect all keywords
  const keywordsData = useMemo(() => {
    if (plugins != null) {
      const keywords = {};
      plugins.forEach(plugin => {
        if (!_.isEmpty(plugin.keywords)) {
          plugin.keywords
            .forEach(keyword => keywords[keyword] = keywords[keyword] != null ? keywords[keyword] + 1 : 1);
        }
      });
      return Object.keys(keywords).sort().map(key => ({
        value: key,
        label: key,
        count: keywords[key]
      }));
    }
  }, [plugins]);


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
            <Fragment>
              <div className="plugins">
                {plugins
                  .filter(plugin => _.isEmpty(filters.name) || plugin.name.toLowerCase().includes(filters.name.toLowerCase()))
                  .filter(plugin => _.isEmpty(filters.keywords) || _.isEmpty(plugin.keywords) || _.intersection(filters.keywords, plugin.keywords).length !== 0)
                  .map(plugin => (
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
                  ))
                }
              </div>
            </Fragment>
          )}
        </FlexboxGrid.Item>
        <FlexboxGrid.Item colspan={7} className="right-column">
          <TableFilters
            filters={filters}
            schema={filtersSchema}
            onChange={filters => setFilters(filters)}
          />
          {keywordsData != null && (
            <Fragment>
              <div style={{ marginTop: '15px' }}>
                <strong>Keywords</strong>
                {!_.isEmpty(filters.keywords) && (
                  <span className="clear-button">
                    (<a href="#" onClick={e => {
                      e.preventDefault();
                      setFilters({ ...filters, keywords: null });
                    }}>clear</a>)
                  </span>
                )}
              </div>
              <CheckTree
                data={keywordsData}
                value={filters.keywords}
                onChange={keywords => setFilters({ ...filters, keywords })}
                renderTreeNode={item => (
                  <span className="plugin-keyword">
                    {item.label} <span className="count">{item.count}</span>
                  </span>
                )}
              />
            </Fragment>
          )}
        </FlexboxGrid.Item>
      </FlexboxGrid>
    </PageContainer>
  );
}

export default PluginsManager;