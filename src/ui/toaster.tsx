import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface TypeProp {
  type: "info" | "error" | "success";
  message: string;
}

export default function toaster({ type, message }: TypeProp) {
  switch (type) {
    case "success":
      toast.success(message);
      break;
    case "error":
      toast.error(message);
      break;
    case "info":
      toast.info(message);
      break;
    default:
      toast(message);
  }
}

export function ToasterContainer() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={10000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false} 
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
  );
}
