import * as React from "react"
import { Link } from "gatsby"

interface LayoutProps {
  location: Location
  title: string
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ location, title, children }) => {
  const rootPath =
    (typeof __PATH_PREFIX__ !== "undefined" ? __PATH_PREFIX__ : "") + "/"
  const isRootPath = location.pathname === rootPath

  const header = (
    <h1 className="main-heading">
      <Link to="/">{title}</Link>
    </h1>
  )

  return (
    <div className="global-wrapper" data-is-root-path={isRootPath}>
      <header className="global-header">{header}</header>
      <main>{children}</main>
      <footer>
        © {new Date().getFullYear()}, Built with
        {` `}
        <a href="https://www.gatsbyjs.com">Gatsby</a>
      </footer>
    </div>
  )
}

export default Layout
