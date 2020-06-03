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

window.Components = Components;

console.log('COMPONENTS', window.Components)
export default Components;
