export type AdminLoginState = {
  status: "idle" | "error";
  message: string;
};

export const initialAdminLoginState: AdminLoginState = {
  status: "idle",
  message: "",
};

export type AdminFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialAdminFormState: AdminFormState = {
  status: "idle",
  message: "",
};
