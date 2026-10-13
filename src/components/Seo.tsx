import { Helmet } from 'react-helmet-async';

interface Props {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
}

const SITE_NAME = 'SafeMarq';
const DEFAULT_DESC = 'Comparez les garages automobiles de Belgique. Classement basé sur les avis Google, qui ne s’achète pas.';
const DEFAULT_IMAGE = '/og-image.jpg';

const Seo = ({ title, description = DEFAULT_DESC, canonical, image = DEFAULT_IMAGE, type = 'website', jsonLd, noindex }: Props) => {
  const fullTitle = title.toLowerCase().includes('safemarq') ? title : `${title} | ${SITE_NAME}`;
  const url = canonical || (typeof window !== 'undefined' ? window.location.href : '');

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      {url && <link rel="canonical" href={url} />}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default Seo;
