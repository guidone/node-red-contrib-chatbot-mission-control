import React, { useContext, useEffect } from 'react';
import { Button, ButtonToolbar, Notification, Icon, Tag, TagGroup } from 'rsuite';
import useFetch from 'use-http';
import ClipboardJS from 'clipboard';
import Showdown from 'showdown';

import SmallTag from '../../../src/components/small-tag';
import { useModal } from '../../../src/components/modal';
import AppContext from '../../../src/common/app-context';

import FlowSource from './flow-source';
import ModalMarkdown from '../views/modal-markdown';
import versionCompare from '../helpers/version-compare';
import CopyAndPasteButton from '../views/copy-and-paste';

const isInstalled = (current, plugins) => plugins.some(plugin => plugin.plugin === current.id);

const needUpdate = (current, plugins) => {
  const installed = plugins.find(plugin => plugin.plugin === current.id);

  return versionCompare(installed.version, current.version) === -1;
};



const CopyAndPasteFlow = ({ plugin }) => {
  const { loading, data = [] } = useFetch(plugin.flow, {}, []);
  return (
    <CopyAndPasteButton
      disabled={loading}
      text={JSON.stringify(data)}
      notification="The Node-RED flow was copied to the clipboard"
    />
  );
};


const PluginPanel = ({
  plugin,
  plugins,
  onInstall = () => {},
  onUninstall = () => {},
  onUpdate = () => {},
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

  const { open: openReadMe, close: closeReadMe } = useModal({
    view: ModalMarkdown,
    title: plugin.name,
    size: 'md',
    labelSubmit: 'Close',
    labelCancel: null,
    align: 'center'
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
          dangerouslySetInnerHTML={{ __html: converter.makeHtml(plugin.description.split('---')[0])}}
        />
        {plugin.description.split('---').length > 1 && (
          <div>
            <a
              href="#"
              onClick={async e => {
                e.preventDefault();
                await openReadMe({ markdown: plugin.description });
                closeReadMe();
              }}
            >
              more...
            </a>
          </div>
        )}
        <div className="info">
          <SmallTag color="#0579DB" className="version"><span className="label">v</span>{plugin.version}</SmallTag>
          <div className="icons">
            {plugin.github != null && (
              <a className="github" href={plugin.github} target="_blank">
                <Icon icon="github" />
              </a>
            )}
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
          {plugin.keywords != null && (
            <TagGroup>
              {plugin.keywords.map(keyword => <Tag key={keyword}>{keyword}</Tag>)}
            </TagGroup>
          )}
        </div>
      </div>
      <div className="buttons">
        <ButtonToolbar size="sm">
          {!installed && (
            <Button
              disabled={disabled}
              size="sm"
              block
              color="blue"
              onClick={() => onInstall(plugin)}
            >Install</Button>
          )}
          {upgrade && (
            <Button
              disabled={disabled}
              block
              size="sm"
              color="orange"
              onClick={() => onUpdate(plugin)}
            >Update</Button>
          )}
          {installed && plugin.flow != null && (
            <Button
              disabled={disabled}
              size="sm"
              block
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
              block
              size="sm"
              color="red"
              onClick={() => onUninstall(plugin)}
            >Uninstall</Button>
          )}
        </ButtonToolbar>
      </div>
    </div>
  );
};

export default PluginPanel;