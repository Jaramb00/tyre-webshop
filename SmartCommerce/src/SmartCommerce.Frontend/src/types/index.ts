export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  roles: string[];
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  emailConfirmed: boolean;
  lastLoginAt?: string;
  roles: string[];
}

export interface ProductListDto {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  imageUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  averageRating: number;
  reviewCount: number;
  stockQuantity?: number;
  isLowStock: boolean;
  categoryName: string;
  brandName: string;
}

export interface ProductDto extends ProductListDto {
  description: string;
  shortDescription?: string;
  sku: string;
  imageUrls: string[];
  status: string;
  isOutOfStock: boolean;
  categoryId: string;
  brandId: string;
  createdAt: string;
}

export interface ProductSearchParams {
  search?: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  inStock?: boolean;
  sortBy?: string;
  sortDescending?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CartItemDto {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImageUrl?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  isAvailable: boolean;
  maxQuantity?: number;
}

export interface CartDto {
  id: string;
  items: CartItemDto[];
  subTotal: number;
  totalItems: number;
}

export interface Address {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
}

export interface OrderSummaryDto {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  itemCount: number;
  createdAt: string;
  deliveredAt?: string;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  currency: string;
  notes?: string;
  createdAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  shippingAddress: Address;
  billingAddress: Address;
  items: OrderItemDto[];
  payment?: PaymentSummaryDto;
  shipment?: ShipmentSummaryDto;
}

export interface OrderItemDto {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productImageUrl?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PaymentSummaryDto {
  id: string;
  status: string;
  method: string;
  amount: number;
  currency: string;
  paidAt?: string;
}

export interface ShipmentSummaryDto {
  id: string;
  trackingNumber?: string;
  carrier?: string;
  status: string;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
}
