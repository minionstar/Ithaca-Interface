import axios, { AxiosError } from "axios";

// Constants
import {
  PointsUserDataType,
  GuildMember,
  GetRewardsProps,
  ResponseType,
  JoinSocialMediaType,
  UpdateUserType,
  GetUserDataType,
  GetUserWalletProofProps,
  GetUserWalletProofData,
  UpdateInfoAfterRedeemProps,
  UpdateInfoAfterRedeemData,
  GetRewardsHistory,
} from "@/UI/constants/pointsProgram";
import {
  Badge,
  GetBadgesLeaderboardDataProps,
  GetBadgesLeaderboardDataResponse,
  GetBadgesProfileData,
} from "@/UI/constants/badges";

// Services
import mixPanel from "@/services/mixpanel";

const RequestHandle = async ({
  method = "POST",
  data,
  path,
  noCache = false,
}: {
  method?: string;
  data?: object;
  path: string;
  noCache?: boolean;
}) => {
  const headers = {
    "Content-Type": "application/json;charset=UTF-8",
    Accept: "application/json, text/plain, */*",
    "Cache-Control": noCache ? "no-cache" : "",
  };

  try {
    const {
      data: { POINTS_URL },
    } = await axios.get<{ API_URL: string; WS_URL: string; POINTS_URL: string }>("/environment/environment.json");

    const requestOptions = {
      method,
      headers,
      ...(data && { body: JSON.stringify(data) }),
    };

    const response = await fetch(`${POINTS_URL}/${path}`, requestOptions);
    const responseData = await response.json();

    if (!response.ok) {
      const error = new Error();
      error.name = responseData.name;
      error.message = responseData.message;
      throw error;
    }

    return { data: responseData };
  } catch (error) {
    return { error: error as AxiosError };
  }
};

const getSessionInfo = (force: boolean = false) => {
  const session = localStorage.getItem("ithaca.session");

  if (session) {
    return JSON.parse(session);
  } else {
    if (force) {
      return "";
    } else {
      throw new Error("No session info");
    }
  }
};

export const AddUser = async (referralToken?: string): Promise<ResponseType<UpdateUserType>> => {
  const session = getSessionInfo();

  const data = {
    walletAddress: session.ethAddress,
    referralCode: referralToken,
  };

  return await RequestHandle({ data: data, path: "users/user" });
};

export const GetUserData = async (
  referralToken?: string,
  force: boolean = false
): Promise<ResponseType<GetUserDataType>> => {
  const session = getSessionInfo();

  const response = await RequestHandle({
    method: "GET",
    path: `users/user?walletAddress=${session.ethAddress}`,
    noCache: true,
  });

  if (!force && response.data && !Object.keys(response?.data?.user).length) {
    const { error } = await AddUser(referralToken);
    if (error) {
      return { error: error };
    } else {
      if (referralToken) {
        // POINTS_EVENTS: Referral wallet connect - service connected
        mixPanel.track("Referral wallet connect", {
          referralToken,
        });
      } else {
        // POINTS_EVENTS: Wallet connect - service connected
        mixPanel.track("Wallet connect");
      }
    }
    return await GetUserData(referralToken);
  }

  return response;
};

export const JoinTwitter = async (): Promise<ResponseType<JoinSocialMediaType>> => {
  const session = getSessionInfo();

  return await RequestHandle({ method: "GET", path: `auth/twitter/login?walletAddress=${session.ethAddress}` });
};

export const TwitterVerify = async () => {
  const session = getSessionInfo();

  return await RequestHandle({
    method: "GET",
    path: `auth/twitter/verify?walletAddress=${session.ethAddress}`,
  });
};

export const JoinDiscord = async (): Promise<ResponseType<JoinSocialMediaType>> => {
  const session = getSessionInfo();

  return await RequestHandle({ method: "GET", path: `auth/discord/login?walletAddress=${session.ethAddress}` });
};

export const DiscordCallback = async (accessToken: string): Promise<ResponseType<GuildMember>> => {
  const session = getSessionInfo();

  return await RequestHandle({
    method: "GET",
    path: `auth/discord/callback?token=${accessToken}&walletAddress=${session.ethAddress}`,
  });
};

export const JoinTelegram = async (): Promise<ResponseType<JoinSocialMediaType>> => {
  const session = getSessionInfo();

  return await RequestHandle({ method: "GET", path: `auth/telegram/login?walletAddress=${session.ethAddress}` });
};

export const UpdateUsername = async ({
  displayName,
  isAvatar,
}: PointsUserDataType): Promise<ResponseType<UpdateUserType>> => {
  const session = getSessionInfo();

  const data = {
    walletAddress: session.ethAddress,
    displayName: displayName,
    isAvatar: isAvatar,
  };

  return await RequestHandle({ method: "PUT", path: `users/user`, data: data });
};

export const GetRewardHistory = async ({
  page,
  pageLimit,
  sortField,
  sortType,
  filterBy,
}: GetRewardsProps): Promise<ResponseType<GetRewardsHistory>> => {
  const session = getSessionInfo();

  const filterType = filterBy === "All" ? {} : { type: filterBy };

  const data = {
    walletAddress: session.ethAddress,
    page: page,
    pageSize: pageLimit,
    sortField: sortField,
    sortType: sortType,
    ...filterType,
  };

  return await RequestHandle({ data: data, path: "rewards/rewardsHistory" });
};

export const GetBadgesProfile = async (): Promise<ResponseType<GetBadgesProfileData>> => {
  const session = getSessionInfo();

  return await RequestHandle({ method: "GET", path: `badges/profile?walletAddress=${session.ethAddress}` });
};

export const GetAllBadges = async (): Promise<ResponseType<Badge[]>> => {
  return await RequestHandle({ method: "GET", path: `badges/all` });
};

export const GetUserWalletProof = async ({
  walletAddress,
  points,
}: GetUserWalletProofProps): Promise<ResponseType<GetUserWalletProofData>> => {
  const data = {
    walletAddress: walletAddress,
    points: points,
  };

  return await RequestHandle({
    method: "GET",
    path: `users/proof?walletAddress=${data.walletAddress}&points=${data.points}`,
  });
};

export const UpdateInfoAfterRedeem = async ({
  walletAddress,
  points,
  hash,
  tokenAmount,
}: UpdateInfoAfterRedeemProps): Promise<ResponseType<UpdateInfoAfterRedeemData>> => {
  const data = {
    walletAddress,
    points,
    hash,
    tokenAmount,
  };

  return await RequestHandle({ data: data, path: "redemption/claim" });
};

export const GetBadgesLeaderboardData = async ({
  page,
  pageLimit,
  sortField,
  sortType,
}: GetBadgesLeaderboardDataProps): Promise<ResponseType<GetBadgesLeaderboardDataResponse>> => {
  const data = {
    page: page,
    pageSize: pageLimit,
    sortField: sortField,
    sortType: sortType,
  };

  return await RequestHandle({ data: data, path: "badges/leaderboard" });
};
