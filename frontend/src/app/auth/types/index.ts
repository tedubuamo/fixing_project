export interface LoginFormData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  nomor_telepon: string;
  region: string;
  branch: string;
  cluster: string;
  role?: string;
}

export interface Region {
  id_region: number;
  region: string;
  id_area: number;
}

export interface Branch {
  id_branch: number;
  branch: string;
  id_region: number;
}

export interface Cluster {
  id_cluster: number;
  cluster: string;
  id_branch: number;
}

export interface Area {
  id_area: number;
  area: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  nomor_telepon: string;
  area: string;
  region: string;
  branch: string;
  cluster: string;
  role: string;
} 