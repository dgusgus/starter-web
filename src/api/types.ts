// Tipos de la API (espejo de los DTOs del backend: starter-api).
// Si cambias un DTO allá, actualiza el tipo aquí. (Nivel 2: generarlos desde OpenAPI.)

export type Rol = "ADMIN" | "USUARIO";

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ItemResponse<T> {
  data: T;
}

export interface ListResponse<T> {
  data: T[];
  meta: PageMeta;
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
}
