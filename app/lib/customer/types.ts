export type CustomerSessionUser = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  billingAddress: string | null;
};

export type CustomerAuthState = {
  status: "idle" | "error";
  message: string;
};

export const initialCustomerAuthState: CustomerAuthState = {
  status: "idle",
  message: "",
};
