import * as React from "react"
import { Link } from "gatsby"
import ThemeToggle from "./theme-switch"
import { useDarkMode } from "../hooks/useDarkMode"

interface LayoutProps {
  location: Location
  title: string
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ location, title, children }) => {
  const { theme, toggleTheme } = useDarkMode()

  const rootPath =
    (typeof __PATH_PREFIX__ !== "undefined" ? __PATH_PREFIX__ : "") + "/"
  const isRootPath = location.pathname === rootPath

  return (
    <div className="global-wrapper" data-is-root-path={isRootPath}>
      <header className="global-header">
        <h1 className="main-heading">
          <Link to="/">{title}</Link>
        </h1>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>
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
