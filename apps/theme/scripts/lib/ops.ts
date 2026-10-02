/**
 * Every Admin GraphQL document the sync uses, in one place so `scripts/validate-ops.ts` can check them
 * against the live schema. Keep selections small; the script only needs ids, handles and errors.
 */

export const Q_SHOP = /* GraphQL */ `query CbShop { shop { name myshopifyDomain primaryDomain { host } } }`;

// ---------------------------------------------------------------- metaobject definitions
export const Q_DEFINITION_BY_TYPE = /* GraphQL */ `query CbDefinitionByType($type: String!) {
  metaobjectDefinitionByType(type: $type) {
    id type name displayNameKey
    fieldDefinitions { key name required type { name } validations { name value } }
    capabilities { publishable { enabled } onlineStore { enabled data { urlHandle } } }
    access { storefront }
  }
}`;

export const M_DEFINITION_CREATE = /* GraphQL */ `mutation CbDefinitionCreate($definition: MetaobjectDefinitionCreateInput!) {
  metaobjectDefinitionCreate(definition: $definition) {
    metaobjectDefinition { id type }
    userErrors { field message code }
  }
}`;

export const M_DEFINITION_UPDATE = /* GraphQL */ `mutation CbDefinitionUpdate($id: ID!, $definition: MetaobjectDefinitionUpdateInput!) {
  metaobjectDefinitionUpdate(id: $id, definition: $definition) {
    metaobjectDefinition { id type fieldDefinitions { key } }
    userErrors { field message code }
  }
}`;

// ---------------------------------------------------------------- product metafield definitions
export const Q_METAFIELD_DEFINITIONS = /* GraphQL */ `query CbMetafieldDefinitions($ownerType: MetafieldOwnerType!, $namespace: String!) {
  metafieldDefinitions(first: 100, ownerType: $ownerType, namespace: $namespace) {
    nodes { id key name pinnedPosition type { name } access { storefront } }
  }
}`;

export const M_METAFIELD_DEFINITION_CREATE = /* GraphQL */ `mutation CbMetafieldDefinitionCreate($definition: MetafieldDefinitionInput!) {
  metafieldDefinitionCreate(definition: $definition) {
    createdDefinition { id key }
    userErrors { field message code }
  }
}`;

export const M_METAFIELD_DEFINITION_PIN = /* GraphQL */ `mutation CbMetafieldDefinitionPin($definitionId: ID!) {
  metafieldDefinitionPin(definitionId: $definitionId) {
    pinnedDefinition { id key pinnedPosition }
    userErrors { field message code }
  }
}`;

// ---------------------------------------------------------------- files
export const Q_FILES = /* GraphQL */ `query CbFiles($query: String, $after: String) {
  files(first: 250, query: $query, after: $after) {
    nodes {
      id fileStatus alt
      ... on MediaImage { image { url width height } }
      ... on GenericFile { url }
    }
    pageInfo { hasNextPage endCursor }
  }
}`;

export const M_FILE_CREATE = /* GraphQL */ `mutation CbFileCreate($files: [FileCreateInput!]!) {
  fileCreate(files: $files) {
    files { id fileStatus alt }
    userErrors { field message code }
  }
}`;

export const Q_FILE_STATUS = /* GraphQL */ `query CbFileStatus($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on MediaImage { id fileStatus image { url } }
    ... on GenericFile { id fileStatus url }
  }
}`;

// ---------------------------------------------------------------- metaobjects
export const Q_METAOBJECTS = /* GraphQL */ `query CbMetaobjects($type: String!, $after: String) {
  metaobjects(type: $type, first: 100, after: $after) {
    nodes { id handle }
    pageInfo { hasNextPage endCursor }
  }
}`;

export const M_METAOBJECT_UPSERT = /* GraphQL */ `mutation CbMetaobjectUpsert($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
  metaobjectUpsert(handle: $handle, metaobject: $metaobject) {
    metaobject { id handle }
    userErrors { field message code }
  }
}`;

// ---------------------------------------------------------------- products
export const Q_PRODUCT_BY_HANDLE = /* GraphQL */ `query CbProductByHandle($query: String!) {
  products(first: 1, query: $query) {
    nodes { id handle title tags seo { title description } }
  }
}`;

export const M_METAFIELDS_SET = /* GraphQL */ `mutation CbMetafieldsSet($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields { id namespace key }
    userErrors { field message code }
  }
}`;

export const M_PRODUCT_UPDATE = /* GraphQL */ `mutation CbProductUpdate($product: ProductUpdateInput!) {
  productUpdate(product: $product) {
    product { id handle seo { title description } }
    userErrors { field message }
  }
}`;

// ---------------------------------------------------------------- pages
export const Q_PAGE_BY_HANDLE = /* GraphQL */ `query CbPageByHandle($query: String!) {
  pages(first: 1, query: $query) {
    nodes { id handle title templateSuffix isPublished }
  }
}`;

export const M_PAGE_CREATE = /* GraphQL */ `mutation CbPageCreate($page: PageCreateInput!) {
  pageCreate(page: $page) {
    page { id handle }
    userErrors { field message code }
  }
}`;

export const M_PAGE_UPDATE = /* GraphQL */ `mutation CbPageUpdate($id: ID!, $page: PageUpdateInput!) {
  pageUpdate(id: $id, page: $page) {
    page { id handle }
    userErrors { field message code }
  }
}`;

// ---------------------------------------------------------------- redirects
export const Q_REDIRECTS = /* GraphQL */ `query CbRedirects($query: String!) {
  urlRedirects(first: 10, query: $query) {
    nodes { id path target }
  }
}`;

export const M_REDIRECT_CREATE = /* GraphQL */ `mutation CbRedirectCreate($urlRedirect: UrlRedirectInput!) {
  urlRedirectCreate(urlRedirect: $urlRedirect) {
    urlRedirect { id path target }
    userErrors { field message }
  }
}`;

export const M_REDIRECT_UPDATE = /* GraphQL */ `mutation CbRedirectUpdate($id: ID!, $urlRedirect: UrlRedirectInput!) {
  urlRedirectUpdate(id: $id, urlRedirect: $urlRedirect) {
    urlRedirect { id path target }
    userErrors { field message }
  }
}`;

export const ALL_OPS: Record<string, string> = {
  Q_SHOP, Q_DEFINITION_BY_TYPE, M_DEFINITION_CREATE, M_DEFINITION_UPDATE,
  Q_METAFIELD_DEFINITIONS, M_METAFIELD_DEFINITION_CREATE, M_METAFIELD_DEFINITION_PIN,
  Q_FILES, M_FILE_CREATE, Q_FILE_STATUS,
  Q_METAOBJECTS, M_METAOBJECT_UPSERT,
  Q_PRODUCT_BY_HANDLE, M_METAFIELDS_SET, M_PRODUCT_UPDATE,
  Q_PAGE_BY_HANDLE, M_PAGE_CREATE, M_PAGE_UPDATE,
  Q_REDIRECTS, M_REDIRECT_CREATE, M_REDIRECT_UPDATE,
};
