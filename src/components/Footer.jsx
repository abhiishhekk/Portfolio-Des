export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer" aria-label="Site footer">
      <div className="container">
        <div className="footer-inner">
          <p className="footer-copy">
            © {year} Abhishek Kumar. Built with React + Vite.
          </p>
          <nav className="footer-links" aria-label="Footer navigation">
            <a
              href="https://github.com/abhiishhekk"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
              id="footer-github-link"
            >
              GitHub
            </a>
            <a
              href="https://leetcode.com/u/abhiishhek_k/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
              id="footer-leetcode-link"
            >
              LeetCode
            </a>
            <a
              href="https://www.linkedin.com/in/abhishek-kumar-init/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
              id="footer-linkedin-link"
            >
              LinkedIn
            </a>
            <a
              href="mailto:abhishekkr.init@gmail.com"
              className="footer-link"
              id="footer-email-link"
            >
              Email
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
