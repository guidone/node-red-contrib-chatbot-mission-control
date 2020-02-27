import { plug } from '../../lib/code-plug';

import UploadImage from './views/upload-image';

plug('content-tabs', UploadImage, { 
  id: 'content-image',
  label: 'Image' 
});
