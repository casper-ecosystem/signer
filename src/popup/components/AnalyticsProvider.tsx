import { useEffect } from 'react';

export default function AnalyticsProvider() {
  const initAnalytics = () => {
    setTimeout(() => {
      const gaPlugin = (window as any)._gaq || [];
      gaPlugin.push(['_setAccount', 'UA-133833104-5']);
      gaPlugin.push(['_trackPageview']);
    }, 2000);
  };

  useEffect(() => {
    (function () {
      const ga = document.createElement('script');
      ga.type = 'text/javascript';
      ga.async = true;
      ga.src = 'https://ssl.google-analytics.com/ga.js';
      const s = document.getElementsByTagName('script')[0];
      s.parentNode?.insertBefore(ga, s);
      initAnalytics();
    })();
  }, []);

  return null;
}
