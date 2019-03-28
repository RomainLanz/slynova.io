import React from 'react'
import { Link, graphql } from 'gatsby'
import styled from 'styled-components'

import Bio from '../components/Bio'
import Layout from '../components/Layout'
import SEO from '../components/seo'

const TableOfContents = styled.div`
  ul {
    list-style: none;
    margin-top: 0;
  }

  li {
    margin-bottom: 0;
  }

  li p {
    display: inline;
  }

  li:before {
    content: '# ';
    margin-right: 10px;
    opacity: 0.3;
  }

  a {
    background: none;
    color: #3f6fa9;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-bottom 200ms;
  }

  a:hover {
    border-color: #3f6fa9;
  }
`

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark
    const siteTitle = this.props.data.site.siteMetadata.title
    const { previous, next, slug } = this.props.pageContext
    const editUrl = `https://github.com/romainlanz/slynova.io/edit/master/content/blog/${slug.replace(
      /\//g,
      ''
    )}/index.md`
    const discussUrl = `https://mobile.twitter.com/search?q=${encodeURIComponent(`https://slynova.io${slug}`)}`

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO title={post.frontmatter.title} description={post.excerpt} />
        <h1>{post.frontmatter.title}</h1>
        <p>
          Published {post.frontmatter.date} | ~ Reading Time: {post.timeToRead} mins
        </p>
        <TableOfContents dangerouslySetInnerHTML={{ __html: post.tableOfContents }} />
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
        <hr />
        <p>
          <a href={discussUrl} target="_blank" rel="nofollow noopener noreferrer">
            Discuss on Twitter
          </a>
          {' | '}
          <a href={editUrl} target="_blank" rel="nofollow noopener noreferrer">
            Edit on Github
          </a>
        </p>
        <hr />
        <Bio />

        <ul
          style={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <Link to={previous.fields.slug} rel="prev">
                ← {previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={next.fields.slug} rel="next">
                {next.frontmatter.title} →
              </Link>
            )}
          </li>
        </ul>
      </Layout>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      timeToRead
      tableOfContents
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
      }
    }
  }
`
