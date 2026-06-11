export type CartItem = {
  productId: string;
  name: string;
  price: string;
  image: string;
  selectedSize: string;
  sizes: string[];
  quantity: number;
  category?: string;
};

export type CreatePreorderState = {
  status: "idle" | "success" | "error";
  message: string;
  preorderId?: string;
  orderReference?: string;
  paymentStatus?: string;
  fieldErrors?: Partial<{
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    fulfillmentType: string;
    customerLocation: string;
    items: string;
    discountCode: string;
    paymentProof: string;
    auth: string;
  }>;
};

export const initialPreorderState: CreatePreorderState = {
  status: "idle",
  message: "",
};
