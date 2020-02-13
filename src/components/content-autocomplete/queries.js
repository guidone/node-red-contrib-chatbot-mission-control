import gql from 'graphql-tag';

const SEARCH = gql`
query($title: String, $id: Int, $slug: String) {
	contents(title: $title, id: $id, slug: $slug) {
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

export { SEARCH, CONTENT, EDIT_CONTENT };