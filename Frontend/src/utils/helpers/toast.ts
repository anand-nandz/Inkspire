import { toast, ToastOptions } from "react-toastify";
import { toastStyles } from "../interfaces/types";

const styleSheet = document.createElement("style");
styleSheet.innerText = toastStyles;
document.head.appendChild(styleSheet);

export const showToastMessage = (message: string, type: 'success' | 'error') => {
  const options: ToastOptions = {
    position: "top-right",
    autoClose: 1500,
    hideProgressBar: false,
    closeOnClick: true,
    rtl: false,
    pauseOnFocusLoss: false,
    draggable: true,
    pauseOnHover: true,
    theme: "dark",
    style: {
      fontSize: '14px',
      padding: '2px 15px',
      minHeight: '45px',
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      border: '2px solid #000000',
    },
  };

  if (type === 'error') {
    toast.error(message, options);
  } else if (type === 'success') {
    toast.success(message, options);
  }
};