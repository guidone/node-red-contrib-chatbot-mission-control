import CollectionEditor from './collection-editor';
import * as HelpElements from './help-elements';
import withConfigurationPage from './configuration-page';
import ContentAutocomplete from './content-autocomplete';

const Components = {
  CollectionEditor,
  HelpElements,
  withConfigurationPage,
  ContentAutocomplete
};

// Define the global scope to store the components shared with plugins
if (window.globalLibs == null) {
  window.globalLibs = {};
}
window.globalLibs.Components = Components;

export default Components;
