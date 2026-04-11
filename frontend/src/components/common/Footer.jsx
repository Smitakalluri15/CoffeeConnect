import { Coffee, Github, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="cc-footer">
      <div className="cc-footer-inner">
        <section className="cc-footer-brand">
          <div className="cc-footer-title">
            <Coffee size={18} />
            <strong>CoffeeConnect</strong>
          </div>
          <p>Premium coffee ordering and operations platform for customers, owners, and staff.</p>
        </section>

        <section>
          <h4>Product</h4>
          <div className="cc-footer-links">
            <Link to="/signup">Get Started</Link>
            <Link to="/login">Sign In</Link>
            <Link to="/booking">Book Table</Link>
          </div>
        </section>

        <section>
          <h4>Follow</h4>
          <div className="cc-footer-social">
            <a href="#" aria-label="Instagram"><Instagram size={16} /></a>
            <a href="#" aria-label="LinkedIn"><Linkedin size={16} /></a>
            <a href="#" aria-label="GitHub"><Github size={16} /></a>
          </div>
        </section>
      </div>
      <div className="cc-footer-bottom">© {new Date().getFullYear()} CoffeeConnect</div>
    </footer>
  );
}
