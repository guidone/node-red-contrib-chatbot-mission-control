export default colorType = type => {
  switch(type) {
    case 'message': return 'cyan';
    case 'document':
    case 'photo':
    case 'video':
    case 'sticker':
      return 'orange';
    default: return 'grey';
  }
};