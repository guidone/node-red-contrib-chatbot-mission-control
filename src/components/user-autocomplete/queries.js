import gql from 'graphql-tag';

const SEARCH = gql`
query($id: Int,$username: String) {
  users(id: $id,username: $username) {
    id,
    userId,
    username,
    language,
    first_name,
    last_name      
  }
}`;



export { SEARCH };