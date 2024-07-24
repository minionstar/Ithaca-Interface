// Packages
import { useEffect, useRef, useState } from "react";
import App, { AppContext, AppInitialProps, AppProps } from "next/app";
import { RainbowKitProvider, darkTheme, cssStringFromTheme } from "@rainbow-me/rainbowkit";
import classNames from "classnames";
import { WagmiConfig } from "wagmi";
// Constants
import { LATO, ROBOTO } from "@/UI/constants/fonts";

// Utils
import { chains, appInfo, wagmiConfig } from "@/UI/utils/RainbowKit";
import mixPanel from "@/services/mixpanel";

// Lib
import { useAppStore } from "@/UI/lib/zustand/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Layouts
import Header from "@/UI/layouts/Header/Header";
import ReadyState from "@/UI/utils/ReadyState";

// Hooks
import useToast from "@/UI/hooks/useToast";

// Components
import Footer from "@/UI/layouts/Footer/Footer";
import Toast from "@/UI/components/Toast/Toast";
import Avatar from "@/UI/components/Icons/Avatar";
import Announcements from "@/UI/layouts/Announcements/Announcements";
import CrossChainStatusPanel from "@/UI/components/CollateralPanel/CrossChainStatusPanel";
import { useSearchParams } from "next/navigation";
import Plug from "@/UI/components/Plug/Plug";

// Styles
import "@rainbow-me/rainbowkit/styles.css";
import "@/UI/stylesheets/vendor/_prism-onedark.scss";
import "@/UI/stylesheets/_global.scss";
import AppWrapper from "@/UI/layouts/AppWrapper/AppWrapper";
import { OnboardingProvider } from "@/UI/providers/onboarding-provider";

const STATUS_MAP: Record<string, string> = {
  NEW: "success",
  FILLED: "success",
  REJECTED: "error",
  CANCEL_REJECTED: "info",
};

const TITLE_MAP: Record<string, string> = {
  NEW: "Order Placed",
  FILLED: "Order Executed",
  REJECTED: "Order Rejected",
  CANCEL_REJECTED: "Order Cancelled",
};

const MESSAGE_MAP: Record<string, string> = {
  NEW: "We have received your order",
  FILLED: "Position details will be updated shortly",
  REJECTED: "Order Rejected, please try again",
  CANCEL_REJECTED: "We have received your request",
};

type Props = { nonce?: string };
const queryClient = new QueryClient();

const Ithaca = ({ Component, pageProps, nonce, router }: AppProps & Props) => {
  const { toastList, showToast } = useToast();
  const { newToast } = useAppStore();
  const searchParams = useSearchParams();
  const [isTxnPanelOpen, setIsTxnPanelOpen] = useState<boolean>(false);
  const [contentAllowed, setContentAllowed] = useState<boolean>(true);

  useEffect(() => {
    const ALLOWED = process.env.NEXT_PUBLIC_POINTS_ALLOWED;
    if (router.asPath.includes("/points/") && ALLOWED === "false") {
      const allowed = searchParams.get("allowed");
      setContentAllowed(allowed !== null);
    }
  }, [searchParams, router, router.asPath]);

  useEffect(() => {
    if (newToast) {
      showToast(
        {
          id: Math.floor(Math.random() * 1000),
          title: TITLE_MAP[newToast.orderStatus],
          message: newToast.ordRejReason || MESSAGE_MAP[newToast.orderStatus],
          type: STATUS_MAP[newToast.orderStatus],
          netPrice: newToast.netPrice,
          viewOrder: newToast.orderStatus === "NEW" || newToast.orderStatus === "FILLED",
        },
        "top-right"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newToast]);

  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={null}
          modalSize='compact'
          appInfo={appInfo}
          chains={chains}
          avatar={() => (
            <div className='customUsetAvatar'>
              <Avatar />
            </div>
          )}
        >
          <style
            nonce={nonce}
            dangerouslySetInnerHTML={{
              __html: `
            :root {
              ${cssStringFromTheme(
                darkTheme({
                  accentColor: "rgba(94, 225, 146, 0.60)",
                  accentColorForeground: "white",
                  borderRadius: "large",
                  overlayBlur: "small",
                })
              )}
            }
          `,
            }}
          />
          <AppWrapper className={classNames(`${LATO.className} ${ROBOTO.className}`)}>
            <OnboardingProvider>
              <Toast toastList={toastList} position={"top-right"} />
              <Announcements />
              <Header isTxnPanelOpen={isTxnPanelOpen} setIsTxnPanelOpen={setIsTxnPanelOpen} />
              <ReadyState>{contentAllowed ? <Component {...pageProps} /> : <Plug />}</ReadyState>
              <CrossChainStatusPanel isTxnPanelOpen={isTxnPanelOpen} setIsTxnPanelOpen={setIsTxnPanelOpen} />
              <Footer />
            </OnboardingProvider>
          </AppWrapper>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
};

function MyApp({ Component, pageProps, router, nonce }: AppProps & Props) {
  const { initIthacaProtocol, ithacaSDK, isAuthenticated, isMaintenanceEnabled, isLoading } = useAppStore();
  const nonceRef = useRef(nonce);
  const [pageLoadTime, setPageLoadTime] = useState<number>(Date.now());

  useEffect(() => {
    const handleRouteChange = () => {
      setPageLoadTime(Date.now());
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  useEffect(() => {
    if (isAuthenticated) {
      // POINTS_EVENTS: Page view - service connected
      mixPanel.track("Page view", {
        path: router.pathname,
      });

      const handleUnload = () => {
        const timeSpent = Date.now() - pageLoadTime;
        // POINTS_EVENTS: Page view time - service connected
        mixPanel.track("Page view time", {
          path: router.pathname,
          spentTime: timeSpent,
        });
      };

      router.events.on("routeChangeComplete", handleUnload);

      return () => {
        router.events.off("routeChangeComplete", handleUnload);
      };
    }
  }, [isAuthenticated, pageLoadTime]);

  useEffect(() => {
    if (nonce) {
      nonceRef.current = nonce;
    }
  }, [nonce]);

  useEffect(() => {
    initIthacaProtocol();
  }, [initIthacaProtocol]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated && !isLoading) {
        ithacaSDK.auth.heartbeat();
      }
    }, 10000);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAuthenticated, isLoading]);

  if (isMaintenanceEnabled) {
    return (
      <AppWrapper>
        <Plug />
      </AppWrapper>
    );
  }

  return <Ithaca Component={Component} pageProps={pageProps} nonce={nonceRef.current} router={router} />;
}

MyApp.getInitialProps = async (Context: AppContext): Promise<Props & AppInitialProps> => {
  const props = await App.getInitialProps(Context);
  const { ctx } = Context;
  const nonce = ctx.req?.headers?.["x-nonce"] as string | undefined;

  return {
    ...props,
    nonce,
  };
};

export default MyApp;
