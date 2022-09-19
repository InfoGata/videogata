import { createInstance, MatomoProvider } from "@datapunt/matomo-tracker-react";
import React from "react";
import { useLocation } from "react-router-dom";

export const createClient = () => {
  return createInstance({
    urlBase: "https://matomo.infogata.com",
    siteId: 2,
    linkTracking: true,
    configurations: {
      disableCookies: true,
      enableJSErrorTracking: true,
    },
  });
};

const MamotoRouterProvider: React.FC = (props) => {
  let location = useLocation();
  const matomoClient = createClient();

  React.useEffect(() => {
    // track page view on each location change
    matomoClient.trackPageView();
  }, [location, matomoClient]);

  return <MatomoProvider value={matomoClient}>{props.children}</MatomoProvider>;
};

export default MamotoRouterProvider;
