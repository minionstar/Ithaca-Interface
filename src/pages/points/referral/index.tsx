import { useState, useCallback, useEffect } from "react";
import { useAccount } from "wagmi";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";

// Components
import Panel from "@/UI/layouts/Panel/Panel";
import Button from "@/UI/components/Button/Button";
import WalletIcon from "@/UI/components/Icons/Wallet";
import TwitterIcon from "@/UI/components/Icons/Twitter";
import DiscordIcon from "@/UI/components/Icons/Discord";
import TelegramIcon from "@/UI/components/Icons/Telegram";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Main from "@/UI/layouts/Main/Main";
import Meta from "@/UI/components/Meta/Meta";
import Container from "@/UI/layouts/Container/Container";
import PointsLayout from "@/UI/layouts/PointsLayout/PointsLayout";
import Toast from "@/UI/components/Toast/Toast";
import Input from "@/UI/components/Input/Input";
import Plug from "@/UI/components/Plug/Plug";
import Loader from "@/UI/components/Loader/Loader";

// Utils
import { handlePointsError, openCentredPopup } from "@/UI/utils/Points";
import { useAppStore } from "@/UI/lib/zustand/store";
import useToast from "@/UI/hooks/useToast";

// Services
import {
  JoinTelegram,
  JoinTwitter,
  JoinDiscord,
  DiscordCallback,
  GetUserData,
  TwitterVerify,
} from "@/UI/services/PointsAPI";
import mixPanel from "@/services/mixpanel";
import { fetchSingleConfigKey } from "@/services/environment.service";

// Constants
import { DISCORD_LINK, SocialMediaStatus, TELEGRAM_LINK, TWITTER_LINK } from "@/UI/constants/pointsProgram";

// Styles
import styles from "./referral.module.scss";

const Referral = () => {
  const { isAuthenticated, setUserPointsData, referralCode } = useAppStore();
  const { isConnected } = useAccount();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toastList, showToast } = useToast();
  const [isDBConnected, setIsDBConnected] = useState<boolean | null>(null);
  const [referralToken, setReferralToken] = useState<string>();
  const [twitterPostLink, setTwitterPostLink] = useState<string>("");
  const [twitterIsPosted, setTwitterIsPosted] = useState<boolean>(false);
  const [referralLink, setReferralLink] = useState<string>(
    `https://${window.location.hostname}/points-program?referral=${referralCode}`
  );

  const [actions, setActions] = useState<SocialMediaStatus>({
    wallet: false,
    twitter: false,
    discord: false,
    telegram: false,
  });
  const [isPointsDisabled, setIsPointsDisabled] = useState(true);
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get("referral");
    if (token) setReferralToken(token);
  }, [searchParams]);

  useEffect(() => {
    if (!isConnected || !isAuthenticated || !referralCode) return;

    setReferralLink(`https://${window.location.hostname}/points/referral?referral=${referralCode}`);
  }, [isConnected, isAuthenticated, referralCode]);

  useEffect(() => {
    const discordFragment: string | undefined = router.asPath.split("#")[1];
    if (discordFragment) {
      const keyValuePairs: string[] = discordFragment.split("&");
      const queryParams: Record<string, string> = {};
      for (const pair of keyValuePairs) {
        const [key, value] = pair.split("=");
        queryParams[key] = value;
      }
      const accessToken = queryParams.access_token;
      DiscordCallback(accessToken).then(({ error }) => {
        const newUrl = router.asPath.replace(`#${discordFragment}`, "");
        router.replace(newUrl, undefined, { shallow: true });
        if (error) {
          handlePointsError({
            showToast,
            title: "Discord connection error",
            message: error.message,
          });
        } else {
          openUrl(DISCORD_LINK);
          setActions(prev => ({ ...prev, discord: true }));
          // POINTS_EVENTS: Join community Discord - service connected
          mixPanel.track("Join community Discord");
        }
      });
    }
    const twitterFragmentRegex = /[?&]twitter=([^&]+)&?(?:message=([^&]+))?&?(?:points=([^&]+))?/;
    const twitterFragment: RegExpMatchArray | null = router.asPath.match(twitterFragmentRegex);
    if (twitterFragment) {
      const [, twitter, message, points] = twitterFragment;
      const queryParams: Record<string, string> = {
        twitter: decodeURIComponent(twitter),
        message: message ? decodeURIComponent(message) : "",
        points: points ? decodeURIComponent(points) : "",
      };
      if (queryParams.twitter === "error") {
        handlePointsError({
          showToast,
          title: "Twitter connection error",
          message: queryParams.message,
        });
      } else {
        setTwitterPostLink(
          `I just signed up for @IthacaProtocol and earned ${queryParams.points} points! Ready to start options trading.%0A%0AUse my referral link to sign up:`
        );
      }
      const newUrl = router.asPath.replace(twitterFragmentRegex, "");
      router.replace(newUrl, undefined, { shallow: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, router.asPath]);

  useEffect(() => {
    if (!isConnected || !isAuthenticated || actions.wallet) {
      if (actions.wallet) setIsDBConnected(true);
      return;
    }

    setIsDBConnected(false);
    GetUserData(referralToken).then(({ data, error }) => {
      if (error) {
        handlePointsError({
          showToast,
          title: error.name,
          message: error.message,
        });
      } else if (data) {
        setIsDBConnected(true);
        const { displayName, avatarUrl, isAvatar, referralCode, telegram, twitter, discord } = data.user;
        setActions({
          wallet: true,
          twitter: twitter || false,
          discord: discord || false,
          telegram: telegram || false,
        });
        setUserPointsData({
          displayName: displayName,
          avatarUrl: avatarUrl || "",
          isAvatar: isAvatar,
          referralCode: referralCode,
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, isAuthenticated, referralToken]);

  useEffect(() => {
    fetchSingleConfigKey("DISABLE_POINTS")
      .then(isPointsDisabled => {
        setIsPointsDisabled(!!isPointsDisabled);
        setIsConfigLoading(false);
      })
      .catch(() => {
        setIsPointsDisabled(true);
        setIsConfigLoading(false);
      });
  }, []);

  useAccount({
    onDisconnect: () => {
      setIsDBConnected(null);
      setActions({
        wallet: false,
        twitter: false,
        discord: false,
        telegram: false,
      });
    },
  });

  const openUrl = (url: string, target: string = "_blank") => {
    window.open(url, target);
  };

  const handleTwitterClick = useCallback(async () => {
    if (twitterIsPosted) {
      TwitterVerify().then(({ data, error }) => {
        if (error) {
          handlePointsError({
            showToast,
            title: error.name,
            message: error.message,
          });
        } else if (data) {
          openUrl(TWITTER_LINK);
          setActions(prev => ({ ...prev, twitter: true }));
          // POINTS_EVENTS: Join community Twitter - service connected
          mixPanel.track("Join community Twitter");
        }
      });
    } else if (twitterPostLink) {
      openCentredPopup({
        url: `https://twitter.com/intent/post?text=${twitterPostLink}&url=${referralLink}`,
        width: 640,
        height: 320,
      });
      setTwitterIsPosted(true);
    } else {
      JoinTwitter().then(({ data, error }) => {
        if (error) {
          handlePointsError({
            showToast,
            title: error.name,
            message: error.message,
          });
        } else if (data && data.url) {
          openUrl(data.url, "_self");
        }
      });
    }
  }, [twitterIsPosted, twitterPostLink, showToast, referralLink]);

  const handleDiscordClick = async () => {
    JoinDiscord().then(({ data, error }) => {
      if (error) {
        handlePointsError({
          showToast,
          title: error.name,
          message: error.message,
        });
      } else if (data && data.url) {
        openUrl(data.url, "_self");
      }
    });
  };

  const handleTelegramClick = async () => {
    JoinTelegram().then(({ data, error }) => {
      if (error) {
        handlePointsError({
          showToast,
          title: error.name,
          message: error.message,
        });
      } else if (data && data.url) {
        // POINTS_EVENTS: Join community Telegram - service connected
        mixPanel.track("Join community Telegram");
        openUrl(TELEGRAM_LINK);
        setActions(prev => ({ ...prev, telegram: true }));
      }
    });
  };

  const ActionDescription = useCallback(
    ({ action, text }: { action: boolean; text: string }) => {
      return (
        <div
          className={`${styles.itemName} ${!isDBConnected ? styles.isDisconnected : action ? styles.isConnected : ""}`}
        >
          {text}
        </div>
      );
    },
    [isDBConnected]
  );

  const ActionCompleted = useCallback(({ action }: { action: boolean }) => {
    return action ? <span className={styles.completedTxt}>+ points earned</span> : <></>;
  }, []);

  const ActionButton = useCallback(
    ({ action, text, onBtnClick }: { action: boolean; text: string; onBtnClick: () => void }) => {
      if (action) {
        return (
          <Button title='Completed' variant='outline' className={styles.completedBtn}>
            <>Completed</>
          </Button>
        );
      } else {
        return (
          <Button title='' disabled={!actions.wallet} onClick={onBtnClick}>
            {text}
          </Button>
        );
      }
    },
    [actions]
  );

  if (isConfigLoading) {
    return (
      <Main>
        <Loader type='lg' />
      </Main>
    );
  }

  if (isPointsDisabled) {
    return (
      <Plug>
        <PointsLayout />
      </Plug>
    );
  }

  return (
    <>
      <Meta />
      <Main>
        <Container>
          <PointsLayout />
          <div className={styles.wrapper}>
            <Panel margin={styles.mainPanel}>
              <p>Trade on Ithaca Testnet and complete the actions below to earn Ithaca points.</p>
              <ul className={styles.programChecklist}>
                {/* Connect Wallet */}
                <li className={styles.listItem}>
                  <div className={styles.listIcon}>
                    <WalletIcon />
                  </div>
                  <div className={`${styles.itemName} ${actions.wallet ? styles.isConnected : ""}`}>
                    Connect your wallet
                  </div>
                  <div className={styles.buttonContainer}>
                    <ActionCompleted action={actions.wallet} />
                    <ConnectButton.Custom>
                      {({ openConnectModal }) => {
                        if (actions.wallet) {
                          return (
                            <Button title='Completed' variant='outline' className={styles.completedBtn}>
                              {!isDBConnected ? "Loading" : "Completed"}
                            </Button>
                          );
                        } else {
                          return (
                            <Button title='Connect Wallet' onClick={openConnectModal}>
                              {isDBConnected === null ? "Connect Wallet" : "Loading"}
                            </Button>
                          );
                        }
                      }}
                    </ConnectButton.Custom>
                  </div>
                </li>
                {/* Follow on Twitter */}
                <li className={styles.listItem}>
                  <div className={styles.listIcon}>
                    <TwitterIcon />
                  </div>
                  <ActionDescription
                    action={actions.wallet && actions.twitter}
                    text={"Follow Ithaca and Post on X (Twitter)"}
                  />
                  <div className={styles.buttonContainer}>
                    <ActionCompleted action={actions.wallet && actions.twitter} />
                    <ActionButton
                      action={actions.wallet && actions.twitter}
                      text={twitterIsPosted ? "Verify (3/3)" : twitterPostLink ? "Post (2/3)" : "Follow (1/3)"}
                      onBtnClick={handleTwitterClick}
                    />
                  </div>
                </li>
                {/* Join Discord */}
                <li className={styles.listItem}>
                  <div className={styles.listIcon}>
                    <DiscordIcon />
                  </div>
                  <ActionDescription action={actions.wallet && actions.discord} text={"Join Ithaca Discord"} />
                  <div className={styles.buttonContainer}>
                    <ActionCompleted action={actions.wallet && actions.discord} />
                    <ActionButton
                      action={actions.wallet && actions.discord}
                      text='Join'
                      onBtnClick={handleDiscordClick}
                    />
                  </div>
                </li>
                {/* Join Telegram */}
                <li className={styles.listItem}>
                  <div className={styles.listIcon}>
                    <TelegramIcon />
                  </div>
                  <ActionDescription action={actions.wallet && actions.telegram} text={"Join Ithaca TG"} />
                  <div className={styles.buttonContainer}>
                    <ActionCompleted action={actions.wallet && actions.telegram} />
                    <ActionButton
                      action={actions.wallet && actions.telegram}
                      text='Join'
                      onBtnClick={handleTelegramClick}
                    />
                  </div>
                </li>
                {/* Referral Code */}
                {actions.wallet && (
                  <li className={`${styles.listItem} ${styles.referralLinkSection}`}>
                    <p>Your referral link to share:</p>
                    <div className={styles.rowContainer}>
                      <Input className={styles.inputReferral} label='' type='text' value={referralLink} />
                      <div>
                        <Button
                          variant='secondary'
                          title=''
                          onClick={() => {
                            navigator.clipboard.writeText(referralLink);
                            showToast(
                              {
                                id: new Date().getTime(),
                                title: "Copied",
                                message: referralLink,
                                type: "success",
                              },
                              "top-right"
                            );
                          }}
                        >
                          Copy Link
                        </Button>
                      </div>
                    </div>
                  </li>
                )}
              </ul>
            </Panel>
          </div>
        </Container>
      </Main>
      <Toast toastList={toastList} position='bottom-right' autoDelete={true} />
    </>
  );
};

export default Referral;
