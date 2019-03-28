import React from 'react'
import { Link } from 'gatsby'

class Layout extends React.Component {
  render() {
    const { location, title, children } = this.props
    const rootPath = `${__PATH_PREFIX__}/`
    let header

    if (location.pathname === rootPath) {
      header = (
        <h1>
          <Link to={`/`}>{title}</Link>
        </h1>
      )
    } else {
      header = (
        <h3>
          <Link to={`/`}>{title}</Link>
        </h3>
      )
    }
    return (
      <div>
        {header}
        {children}
        <footer>
          <p>
            <small>
              <strong>&copy; 2019 Copyright Romain Lanz. All rights reserved.</strong>
            </small>
            <small>
              This site is built with{' '}
              <a href="https://www.gatsbyjs.org" target="_blank" rel="nofollow noopener noreferrer">
                Gatsby
              </a>{' '}
              and hosted on{' '}
              <a href="https://www.netlify.com/" target="_blank" rel="nofollow noopener noreferrer">
                Netlify
              </a>
              .
            </small>
          </p>
        </footer>
      </div>
    )
  }
}

export default Layout
