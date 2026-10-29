import { http } from "@/api/http";
import type { ItemResponse, ListParams, ListResponse, Producto } from "@/api/types";

export interface ProductoInput {
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  activo: boolean;
}

export interface ProductoListParams extends ListParams {
  activo?: boolean;
}

// MÓDULO DE EJEMPLO: copia esta carpeta (features/products) para una entidad nueva.
export const productsApi = {
  async list(params: ProductoListParams) {
    const { data } = await http.get<ListResponse<Producto>>("/products", { params });
    return data;
  },

  async create(input: ProductoInput) {
    const { data } = await http.post<ItemResponse<Producto>>("/products", input);
    return data.data;
  },

  async update(id: string, input: Partial<ProductoInput>) {
    const { data } = await http.patch<ItemResponse<Producto>>(`/products/${id}`, input);
    return data.data;
  },

  async remove(id: string) {
    await http.delete(`/products/${id}`);
  },
};
