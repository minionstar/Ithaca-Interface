import { useState } from "react";
import { ToastItemProp } from "../constants/toast";

export default function useToast() {
  const [toastList, setToastList] = useState<ToastItemProp[]>([]);
  const [position, setPosition] = useState("top-right");

  const showToast = (newToast: ToastItemProp, position: string) => {
    setToastList([...toastList, newToast]);
    setPosition(position);
  };

  return {
    toastList,
    showToast,
    position,
  };
}
