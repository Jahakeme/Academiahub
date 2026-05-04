export type LaunchSignupState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialLaunchSignupState: LaunchSignupState = {
  status: "idle",
  message: "",
};
