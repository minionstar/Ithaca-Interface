// Components
import Minus from "@/UI/components/Icons/Minus";
import Plus from "@/UI/components/Icons/Plus";

// Types
type SideType = "BUY" | "SELL";

/**
 * Display the corresponding icon based on the side value.
 * @param side - Side value either '+' or '-'
 * @returns - React component representing either Plus or Minus
 */

export const displaySideIcon = (side: SideType): JSX.Element => {
  return side === "BUY" ? <Plus /> : <Minus />;
};
