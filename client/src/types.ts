export type Product = {
  _id: string;
  category: string;
  description: string;
  discountPercentage?: number;
  imageUrl: string;
  in_stock?: boolean;
  name: string;
  price: number;
  createdAt: string;
};

export type Category = {
  name: string;
  _id: string;
};

export type BannerImage = {
  _id: string;
  imageUrl: string;
  imageFileId?: string;
};
