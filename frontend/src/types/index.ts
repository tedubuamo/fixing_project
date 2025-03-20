export interface PoinType {
  id_poin: number
  type: string
}

export interface AuthUser {
  username: string;
  role: string;
  cluster?: string;
  phone?: string;
}