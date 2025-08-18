// app/components/ReusableComponent/showToast.ts
import { toast } from "sonner";

type ToastType = "success" | "error" | "info" | "warning";

export function showToast(type: ToastType, message: string) {
  switch (type) {
    case "success":
      toast.success(message);
      break;
    case "error":
      toast.error(message);
      break;
    case "info":
      toast(message, { duration: 3000 }); // default blue style
      break;
    case "warning":
      toast.warning(message);
      break;
    default:
      toast(message);
  }
}
