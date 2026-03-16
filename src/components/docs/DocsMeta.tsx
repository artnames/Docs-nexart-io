import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface DocsMetaProps {
  title: string;
  description: string;
  breadcrumbs?: BreadcrumbItem[];
}

const BASE_URL = "https://docs.nexart.io";

const sectionNames: Record<string, string> = {
  concepts: "Concepts",
  integrations: "Integrations",
  dashboard: "Dashboard",
};

const DocsMeta = ({ title, description, breadcrumbs }: DocsMetaProps) => {
  const { pathname } = useLocation();
  const canonicalUrl = `${BASE_URL}${pathname}`;
  const fullTitle = `${title} — NexArt Docs`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    description,
    author: { "@type": "Organization", name: "NexArt" },
    publisher: {
      "@type": "Organization",
      name: "NexArt",
      url: "https://nexart.io",
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    url: canonicalUrl,
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NexArt",
    url: "https://nexart.io",
    sameAs: [
      "https://docs.nexart.io",
      "https://verify.nexart.io",
      "https://www.linkedin.com/company/nexart",
      "https://x.com/nexaborations",
    ],
  };

  // Auto-detect section from path for breadcrumbs
  const buildBreadcrumbs = (): BreadcrumbItem[] => {
    if (breadcrumbs) {
      return [{ name: "Home", path: "/" }, { name: "Docs", path: "/docs/getting-started" }, ...breadcrumbs];
    }
    const parts = pathname.replace(/^\/docs\//, "").split("/");
    const crumbs: BreadcrumbItem[] = [
      { name: "Home", path: "/" },
      { name: "Docs", path: "/docs/getting-started" },
    ];
    if (parts.length > 1 && sectionNames[parts[0]]) {
      const sectionPath = parts[0] === "integrations" ? "/docs/integrations" : `/docs/${parts[0]}/${parts[1]}`;
      crumbs.push({ name: sectionNames[parts[0]], path: parts[0] === "integrations" ? "/docs/integrations" : `/docs/${parts[0]}` });
    }
    crumbs.push({ name: title, path: pathname });
    return crumbs;
  };

  const allCrumbs = buildBreadcrumbs();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allCrumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: crumb.path.startsWith("http") ? crumb.path : `${BASE_URL}${crumb.path}`,
    })),
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="article" />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />

      <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
    </Helmet>
  );
};

export default DocsMeta;
