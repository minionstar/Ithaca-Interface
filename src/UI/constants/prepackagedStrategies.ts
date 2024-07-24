export type PrepackagedStrategy = {
  label: string;
  key: string;
  strategies: StrategyLeg[];
};

export type StrategyLeg = {
  product: string;
  type: string;
  side: SIDE;
  size: number;
  strike: number;
  linked: boolean;
};

export enum SIDE {
  BUY = "BUY",
  SELL = "SELL",
}

export const STRUCTURED_STRATEGIES: PrepackagedStrategy[] = [
  {
    label: "Bet (Inside)",
    key: "bet-inside",
    strategies: [
      {
        product: "digital-option",
        type: "BinaryCall",
        side: SIDE.BUY,
        size: 100,
        strike: 0,
        linked: true,
      },
      {
        product: "digital-option",
        type: "BinaryCall",
        side: SIDE.SELL,
        size: 100,
        strike: 2,
        linked: true,
      },
    ],
  },
  {
    label: "Bet (Outside)",
    key: "bet-outside",
    strategies: [
      {
        product: "digital-option",
        type: "BinaryPut",
        side: SIDE.BUY,
        size: 100,
        strike: 0,
        linked: true,
      },
      {
        product: "digital-option",
        type: "BinaryCall",
        side: SIDE.BUY,
        size: 100,
        strike: 2,
        linked: true,
      },
    ],
  },
  {
    label: "Bonus",
    key: "bonus",
    strategies: [
      {
        product: "option",
        type: "Put",
        side: SIDE.BUY,
        size: 1,
        strike: -1,
        linked: true,
      },
      {
        product: "option",
        type: "Put",
        side: SIDE.SELL,
        size: 1,
        strike: -3,
        linked: true,
      },
      {
        product: "digital-option",
        type: "BinaryPut",
        side: SIDE.SELL,
        size: 200,
        strike: -3,
        linked: false,
      },
      {
        product: "Forward",
        type: "NEXT_AUCTION",
        side: SIDE.BUY,
        size: 1,
        strike: -1,
        linked: true,
      },
    ],
  },
  {
    label: "Twin-Win",
    key: "twin-win",
    strategies: [
      {
        product: "option",
        type: "Put",
        side: SIDE.BUY,
        size: 2,
        strike: -1,
        linked: true,
      },
      {
        product: "option",
        type: "Put",
        side: SIDE.SELL,
        size: 2,
        strike: -3,
        linked: true,
      },
      {
        product: "digital-option",
        type: "BinaryPut",
        side: SIDE.SELL,
        size: 400,
        strike: -3,
        linked: false,
      },
      {
        product: "Forward",
        type: "NEXT_AUCTION",
        side: SIDE.BUY,
        size: 1,
        strike: -1,
        linked: false,
      },
    ],
  },
  {
    label: "Up & In Call",
    key: "up-n-in-call",
    strategies: [
      {
        product: "option",
        type: "Call",
        side: SIDE.BUY,
        size: 1,
        strike: 0,
        linked: false,
      },
      {
        product: "digital-option",
        type: "BinaryCall",
        side: SIDE.BUY,
        size: 200,
        strike: 0,
        linked: false,
      },
    ],
  },
  {
    label: "Up & Out Call",
    key: "up-n-out-call",
    strategies: [
      {
        product: "option",
        type: "Call",
        side: SIDE.BUY,
        size: 1,
        strike: -2,
        linked: true,
      },
      {
        product: "option",
        type: "Call",
        side: SIDE.SELL,
        size: 1,
        strike: 0,
        linked: true,
      },
      {
        product: "digital-option",
        type: "BinaryCall",
        side: SIDE.SELL,
        size: 200,
        strike: 0,
        linked: false,
      },
    ],
  },
  {
    label: "Down & In Put",
    key: "down-in-put",
    strategies: [
      {
        product: "option",
        type: "Put",
        side: SIDE.BUY,
        size: 1,
        strike: -3,
        linked: false,
      },
      {
        product: "digital-option",
        type: "BinaryPut",
        side: SIDE.BUY,
        size: 200,
        strike: -3,
        linked: false,
      },
    ],
  },
  {
    label: "Down & Out Put",
    key: "down-out-put",
    strategies: [
      {
        product: "option",
        type: "Put",
        side: SIDE.BUY,
        size: 1,
        strike: -1,
        linked: true,
      },
      {
        product: "option",
        type: "Put",
        side: SIDE.SELL,
        size: 1,
        strike: -3,
        linked: true,
      },
      {
        product: "digital-option",
        type: "BinaryPut",
        side: SIDE.SELL,
        size: 200,
        strike: -3,
        linked: false,
      },
    ],
  },
];

export const LINEAR_STRATEGIES = [
  {
    label: "Call Spread",
    key: "call-spread",
    strategies: [
      {
        product: "option",
        type: "Call",
        side: SIDE.BUY,
        size: 1,
        strike: 1,
        linked: true,
      },
      {
        product: "option",
        type: "Call",
        side: SIDE.SELL,
        size: 1,
        strike: 2,
        linked: true,
      },
    ],
  },
  {
    label: "Put Spread",
    key: "put-spread",
    strategies: [
      {
        product: "option",
        type: "Put",
        side: SIDE.BUY,
        size: 1,
        strike: 0,
        linked: true,
      },
      {
        product: "option",
        type: "Put",
        side: SIDE.SELL,
        size: 1,
        strike: -1,
        linked: true,
      },
    ],
  },
  {
    label: "Risk Reversal",
    key: "risk-reversal",
    strategies: [
      {
        product: "option",
        type: "Call",
        side: SIDE.BUY,
        size: 1,
        strike: 1,
        linked: true,
      },
      {
        product: "option",
        type: "Put",
        side: SIDE.SELL,
        size: 1,
        strike: -1,
        linked: true,
      },
    ],
  },
  {
    label: "Call Ladder",
    key: "call-ladder",
    strategies: [
      {
        product: "option",
        type: "Call",
        side: SIDE.BUY,
        size: 1,
        strike: -1,
        linked: true,
      },
      {
        product: "option",
        type: "Call",
        side: SIDE.SELL,
        size: 1,
        strike: 0,
        linked: true,
      },
      {
        product: "option",
        type: "Call",
        side: SIDE.SELL,
        size: 1,
        strike: 1,
        linked: true,
      },
    ],
  },
  {
    label: "Put Ladder",
    key: "put-ladder",
    strategies: [
      {
        product: "option",
        type: "Put",
        side: SIDE.BUY,
        size: 1,
        strike: 1,
        linked: true,
      },
      {
        product: "option",
        type: "Put",
        side: SIDE.SELL,
        size: 1,
        strike: 0,
        linked: true,
      },
      {
        product: "option",
        type: "Put",
        side: SIDE.SELL,
        size: 1,
        strike: -1,
        linked: true,
      },
    ],
  },
  {
    label: "Straddle",
    key: "straddle",
    strategies: [
      {
        product: "option",
        type: "Call",
        side: SIDE.BUY,
        size: 1,
        strike: 0,
        linked: true,
      },
      {
        product: "option",
        type: "Put",
        side: SIDE.BUY,
        size: 1,
        strike: 0,
        linked: true,
      },
    ],
  },
  {
    label: "Strangle",
    key: "strangle",
    strategies: [
      {
        product: "option",
        type: "Call",
        side: SIDE.BUY,
        size: 1,
        strike: 1,
        linked: true,
      },
      {
        product: "option",
        type: "Put",
        side: SIDE.BUY,
        size: 1,
        strike: -1,
        linked: true,
      },
    ],
  },
  {
    label: "Call Condor",
    key: "call-condor",
    strategies: [
      {
        product: "option",
        type: "Call",
        side: SIDE.BUY,
        size: 1,
        strike: -2,
        linked: true,
      },
      {
        product: "option",
        type: "Call",
        side: SIDE.SELL,
        size: 1,
        strike: -1,
        linked: true,
      },
      {
        product: "option",
        type: "Call",
        side: SIDE.SELL,
        size: 1,
        strike: 1,
        linked: true,
      },
      {
        product: "option",
        type: "Call",
        side: SIDE.BUY,
        size: 1,
        strike: 2,
        linked: true,
      },
    ],
  },
  {
    label: "Put Condor",
    key: "put-condor",
    strategies: [
      {
        product: "option",
        type: "Put",
        side: SIDE.BUY,
        size: 1,
        strike: -2,
        linked: true,
      },
      {
        product: "option",
        type: "Put",
        side: SIDE.SELL,
        size: 1,
        strike: -1,
        linked: true,
      },
      {
        product: "option",
        type: "Put",
        side: SIDE.SELL,
        size: 1,
        strike: 1,
        linked: true,
      },
      {
        product: "option",
        type: "Put",
        side: SIDE.BUY,
        size: 1,
        strike: 2,
        linked: true,
      },
    ],
  },
  {
    label: "Iron Condor",
    key: "iron-condor",
    strategies: [
      {
        product: "option",
        type: "Put",
        side: SIDE.BUY,
        size: 1,
        strike: -2,
        linked: true,
      },
      {
        product: "option",
        type: "Put",
        side: SIDE.SELL,
        size: 1,
        strike: -1,
        linked: true,
      },
      {
        product: "option",
        type: "Call",
        side: SIDE.SELL,
        size: 1,
        strike: 1,
        linked: true,
      },
      {
        product: "option",
        type: "Call",
        side: SIDE.BUY,
        size: 1,
        strike: 2,
        linked: true,
      },
    ],
  },
  {
    label: "Call Butterfly",
    key: "call-butterfly",
    strategies: [
      {
        product: "option",
        type: "Call",
        side: SIDE.BUY,
        size: 1,
        strike: -1,
        linked: true,
      },
      {
        product: "option",
        type: "Call",
        side: SIDE.SELL,
        size: 2,
        strike: 0,
        linked: false,
      },
      {
        product: "option",
        type: "Call",
        side: SIDE.BUY,
        size: 1,
        strike: 1,
        linked: true,
      },
    ],
  },
  {
    label: "Put Butterfly",
    key: "put-butterfly",
    strategies: [
      {
        product: "option",
        type: "Put",
        side: SIDE.BUY,
        size: 1,
        strike: -1,
        linked: true,
      },
      {
        product: "option",
        type: "Put",
        side: SIDE.SELL,
        size: 2,
        strike: 0,
        linked: false,
      },
      {
        product: "option",
        type: "Put",
        side: SIDE.BUY,
        size: 1,
        strike: 1,
        linked: true,
      },
    ],
  },
];
