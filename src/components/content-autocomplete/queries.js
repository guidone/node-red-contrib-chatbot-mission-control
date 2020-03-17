import gql from 'graphql-tag';

const SEARCH = gql`
query($title: String, $id: Int, $slug: String, $namespace: String) {
	contents(title: $title, id: $id, slug: $slug, namespace: $namespace) {
    id,
    title,
    language,
    slug
  }
}`;

const CONTENT = gql`
query($id: Int) {
  categories {
    id,
    name
  }
  content(id: $id) {
    id,
    slug,
    title,
    body,
    categoryId,
    language,
    createdAt,
    category {
      id,
      name
    }
    fields {
      id,
      name,
      value,
      type
    } 
  }
}
`;

const EDIT_CONTENT = gql`
mutation($id: Int!, $content: NewContent!) {
  editContent(id: $id, content: $content) {
    id,
    slug,
    title,
    body,
    language,
    fields {
      id,
      name,
      value,
      type
    }
  }
}
`;

const CREATE_CONTENT = gql`
mutation($content: NewContent!) {
  createContent(content: $content) {
    id,
    slug,
    title,
    body,
    language,
    payload,
    fields {
      id,
      name,
      value,
      type
    }
  }
}
`;

const CATEGORIES = gql`
query($offset: Int, $limit: Int, $order: String, $namespace: String) {  
  categories(offset: $offset, limit: $limit, order: $order, namespace: $namespace) {
    id,
    name,
    createdAt
  }
}
`;


export { SEARCH, CONTENT, EDIT_CONTENT, CREATE_CONTENT, CATEGORIES };