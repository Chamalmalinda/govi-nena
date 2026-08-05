import toast from "react-hot-toast";

export function showSuccess(message) {
  return toast.success(message);
}

export function showError(message) {
  return toast.error(message);
}

export function showWarning(message) {
  return toast(message, {
    icon: "⚠️",

    style: {
      background: "#FFFDE7",
      color: "#795548",
      border: "1px solid #FBC02D",
    },
  });
}

export function showInfo(message) {
  return toast(message, {
    icon: "ℹ️",

    style: {
      background: "#F5FAF5",
      color: "#1B5E20",
      border: "1px solid #A5D6A7",
    },
  });
}

export function showLoading(message) {
  return toast.loading(message);
}

export function dismissToast(toastId) {
  toast.dismiss(toastId);
}