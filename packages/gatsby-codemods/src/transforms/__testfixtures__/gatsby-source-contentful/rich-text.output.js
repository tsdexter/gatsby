function renderReferencedComponent(ref) {
  const Component = components[ref.__typename]
  if (!Component) {
    throw new Error(
      `Unable to render referenced component of type ${ref.__typename}`
    )
  }
  return <Component {...ref} />
}

const makeOptions = (
  {
    assetBlockMap,
    entryBlockMap,
    entryInlineMap
  }
) => ({
  renderMark: {
    [MARKS.BOLD]: text => <strong data-cy-strong>{text}</strong>
  },

  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: node => {
      const asset = assetBlockMap.get(node.data?.target?.sys?.id);
      if (asset.gatsbyImageData) {
        return <GatsbyImage image={asset.gatsbyImageData} />;
      }
      return (<>
        <h2>Embedded NON-Image Asset</h2>
        <pre>
          <code>{JSON.stringify(asset, null, 2)}</code>
        </pre>
      </>);
    },

    [BLOCKS.EMBEDDED_ENTRY]: node => {
      const entry = entryBlockMap.get(node.data?.target?.sys?.id);
      if (!entry) {
        throw new Error(`Entity not available for node:\n${JSON.stringify(node, null, 2)}`);
      }
      return renderReferencedComponent(entry);
    },

    [INLINES.EMBEDDED_ENTRY]: node => {
      const entry = entryInlineMap.get(node.data?.target?.sys?.id);
      if (entry.__typename === "ContentfulText") {
        return (
          (<span data-cy-id="inline-text">[Inline-ContentfulText]{" "}{entry.title}:{" "}{entry.short}
          </span>)
        );
      }
      return (
        (<span>[Inline-{entry.__typename}]{" "}{entry.title}
        </span>)
      );
    }
  }
})

const RichTextPage = ({ data }) => {
  const defaultEntries = data.default.nodes
  return (
    <Layout>
      {defaultEntries.map(({ id, title, richText }) => {
        const slug = slugify(title, { strict: true, lower: true })
        return (
          <div data-cy-id={slug} key={id}>
            <h2>{title}</h2>
            {renderRichText(richText, makeOptions)}
            <hr />
          </div>
        );
      })}
    </Layout>
  );
}

export default RichTextPage

export const pageQuery = graphql`query RichTextQuery {
  allContentfulContentTypeRichText {
    nodes {
      id
      title
      richText {
        json
        links {
          assets {
            block {
              sys {
                id
              }
              gatsbyImageData(width: 200)
            }
          }
          entries {
            block {
              __typename
              sys {
                id
                contentType
              }
              ... on ContentfulContentTypeText {
                title
                short
              }
              ... on ContentfulContentTypeLocation {
                location {
                  lat
                  lon
                }
              }
              ... on ContentfulContentTypeContentReference {
                title
                one {
                  ... on ContentfulContentTypeContentReference {
                    sys {
                      id
                    }
                    title
                    content_reference {
                      ... on ContentfulContentTypeContentReference {
                        sys {
                          id
                        }
                        title
                      }
                    }
                  }
                }
                many {
                  ... on ContentfulContentTypeText {
                    title
                    short
                  }
                  ... on ContentfulContentTypeNumber {
                    title
                    integer
                  }
                  ... on ContentfulContentTypeContentReference {
                    title
                    content_reference {
                      ... on ContentfulContentTypeContentReference {
                        title
                      }
                    }
                  }
                }
              }
            }
            inline {
              __typename
              sys {
                id
                contentType
              }
              ... on ContentfulContentTypeText {
                title
                short
              }
              ... on ContentfulContentTypeLocation {
                location {
                  lat
                  lon
                }
              }
              ... on ContentfulContentTypeContentReference {
                title
                one {
                  ... on ContentfulContentTypeContentReference {
                    sys {
                      id
                    }
                    title
                    content_reference {
                      ... on ContentfulContentTypeContentReference {
                        sys {
                          id
                        }
                        title
                      }
                    }
                  }
                }
                many {
                  ... on ContentfulContentTypeText {
                    title
                    short
                  }
                  ... on ContentfulContentTypeNumber {
                    title
                    integer
                  }
                  ... on ContentfulContentTypeContentReference {
                    title
                    content_reference {
                      ... on ContentfulContentTypeContentReference {
                        title
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`