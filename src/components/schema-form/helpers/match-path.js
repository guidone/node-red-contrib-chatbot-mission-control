import _ from 'lodash';


const matchPath = (path1, path2) => {

  const a1 = path1.split('/');
  if (a1[0] === '') {
    a1.shift();
  }
  const a2 = path2.split('/');
  if (a2[0] === '') {
    a2.shift();
  }

  //console.log('--', a1, a2)

  let result = true;
  let idx;
  for(idx = 0; idx < Math.min(a1.length, a2.length); idx++) {
    if (a1[idx] === a2[idx]) {
      // same dir

    } else if (a2[idx] === '*') {
      // wildcard

    } else {
      result = false;
    }
  }


  return result;
}


export default (path, paths) => {
  if (_.isEmpty(paths) || !_.isArray(paths)) {
    return true;
  }

  return paths.some(test => matchPath(path, test));
}