import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const DEFAULT_TITLE = "CoffeeConnect | Discover, Reserve & Order From Artisanal Cafes";
const DEFAULT_DESCRIPTION =
  "Discover curated brews, reserve tables at top artisanal cafes, order specialty coffee, and join community food sharing with CoffeeConnect.";
const DEFAULT_IMAGE = "https://coffeeconnect.app/table-types/indoor-standard.webp";
const getBaseUrl = () => {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }
  return "https://statuesque-melba-7a1d8e.netlify.app";
};

/**
 * Reusable SEO component for dynamic metadata updates in React SPAs.
 *
 * @param {Object} props
 * @param {string} [props.title] - Page title (will append " | CoffeeConnect" unless already included)
 * @param {string} [props.description] - Page meta description
 * @param {string} [props.keywords] - Comma-separated SEO keywords
 * @param {string} [props.canonical] - Canonical URL for the page
 * @param {string} [props.ogImage] - Social share image URL
 * @param {string} [props.ogType] - Open Graph type ("website", "restaurant", "article")
 * @param {boolean} [props.noindex] - If true, tells crawlers not to index this page (e.g. for admin/private dashboards)
 * @param {Object|Array} [props.schema] - Optional Schema.org JSON-LD object or array
 */
export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  canonical,
  ogImage,
  ogType = "website",
  noindex = false,
  schema
}) {
  const location = useLocation();

  useEffect(() => {
    // 1. Update Title
    const effectiveOgImage = ogImage || `${getBaseUrl()}/table-types/indoor-standard.webp`;
    const formattedTitle = title
      ? title.includes("CoffeeConnect")
        ? title
        : `${title} | CoffeeConnect`
      : DEFAULT_TITLE;
    document.title = formattedTitle;

    // Helper to set or update meta tag
    const setMeta = (attr, key, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // 2. Standard Meta Tags
    setMeta("name", "description", description);
    setMeta("name", "title", formattedTitle);
    if (keywords) {
      setMeta("name", "keywords", keywords);
    }
    setMeta(
      "name",
      "robots",
      noindex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    );

    // 3. Canonical Link
    const targetCanonical = canonical || `${getBaseUrl()}${location.pathname}`;
    let canonicalEl = document.querySelector("link[rel='canonical']");
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      canonicalEl.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute("href", targetCanonical);

    // 4. Open Graph Tags
    setMeta("property", "og:title", formattedTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", targetCanonical);
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:image", effectiveOgImage);

    // 5. Twitter Card Tags
    setMeta("name", "twitter:title", formattedTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", effectiveOgImage);

    // 6. Dynamic JSON-LD Schema
    const existingSchemaScript = document.getElementById("dynamic-seo-schema");
    if (existingSchemaScript) {
      existingSchemaScript.remove();
    }

    if (schema) {
      const script = document.createElement("script");
      script.id = "dynamic-seo-schema";
      script.type = "application/ld+json";
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    }

    return () => {
      // Clean up dynamic schema when unmounting
      const script = document.getElementById("dynamic-seo-schema");
      if (script) {
        script.remove();
      }
    };
  }, [title, description, keywords, canonical, ogImage, ogType, noindex, schema, location.pathname]);

  return null;
}
