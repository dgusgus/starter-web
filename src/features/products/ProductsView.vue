<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { parseApiError } from "@/api/errors";
import type { PageMeta, Producto } from "@/api/types";
import AppButton from "@/components/ui/AppButton.vue";
import AppPagination from "@/components/ui/AppPagination.vue";
import { debounce } from "@/lib/debounce";
import { formatMoney } from "@/lib/format";
import { useAuthStore } from "@/stores/auth";
import { useToastStore } from "@/stores/toast";
import ProductFormModal from "./ProductFormModal.vue";
import { productsApi } from "./products.api";

const auth = useAuthStore();
const toast = useToastStore();

const items = ref<Producto[]>([]);
const meta = ref<PageMeta | null>(null);
const loading = ref(false);

const page = ref(1);
const search = ref("");
const estado = ref<"" | "true" | "false">("");

const modalOpen = ref(false);
const editing = ref<Producto | null>(null);

async function load() {
  loading.value = true;
  try {
    const res = await productsApi.list({
      page: page.value,
      search: search.value.trim() || undefined,
      activo: estado.value === "" ? undefined : estado.value === "true",
    });
    items.value = res.data;
    meta.value = res.meta;
  } catch (e) {
    toast.error(parseApiError(e).message);
  } finally {
    loading.value = false;
  }
}

// Buscar al escribir, con retraso, y volver a la página 1
const searchSoon = debounce(() => {
  page.value = 1;
  void load();
}, 300);

watch(search, searchSoon);
watch(estado, () => {
  page.value = 1;
  void load();
});

function goTo(p: number) {
  page.value = p;
  void load();
}

function openCreate() {
  editing.value = null;
  modalOpen.value = true;
}

function openEdit(p: Producto) {
  editing.value = p;
  modalOpen.value = true;
}

async function remove(p: Producto) {
  if (!window.confirm(`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`)) return;
  try {
    await productsApi.remove(p.id);
    toast.success("Producto eliminado");
    // Si era el último de la página, retrocede una
    if (items.value.length === 1 && page.value > 1) page.value -= 1;
    await load();
  } catch (e) {
    toast.error(parseApiError(e).message);
  }
}

onMounted(load);
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-semibold tracking-tight">Productos</h1>
      <AppButton v-if="auth.isAdmin" @click="openCreate">Nuevo producto</AppButton>
    </div>

    <div class="flex flex-wrap gap-3">
      <input
        v-model="search"
        type="search"
        placeholder="Buscar por nombre..."
        aria-label="Buscar productos"
        class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:w-72"
      />
      <select
        v-model="estado"
        aria-label="Filtrar por estado"
        class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
      >
        <option value="">Todos</option>
        <option value="true">Activos</option>
        <option value="false">Inactivos</option>
      </select>
    </div>

    <div class="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase">
          <tr>
            <th class="px-4 py-3">Nombre</th>
            <th class="px-4 py-3">Precio</th>
            <th class="px-4 py-3">Stock</th>
            <th class="px-4 py-3">Estado</th>
            <th v-if="auth.isAdmin" class="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="loading && items.length === 0">
            <td colspan="5" class="px-4 py-8 text-center text-slate-500">Cargando...</td>
          </tr>
          <tr v-else-if="items.length === 0">
            <td colspan="5" class="px-4 py-8 text-center text-slate-500">No hay productos.</td>
          </tr>
          <tr v-for="p in items" :key="p.id" class="hover:bg-slate-50">
            <td class="px-4 py-3">
              <p class="font-medium">{{ p.nombre }}</p>
              <p v-if="p.descripcion" class="text-xs text-slate-500">{{ p.descripcion }}</p>
            </td>
            <td class="px-4 py-3">{{ formatMoney(p.precio) }}</td>
            <td class="px-4 py-3">{{ p.stock }}</td>
            <td class="px-4 py-3">
              <span
                class="rounded-full px-2 py-0.5 text-xs font-medium"
                :class="p.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'"
              >
                {{ p.activo ? "Activo" : "Inactivo" }}
              </span>
            </td>
            <td v-if="auth.isAdmin" class="px-4 py-3">
              <div class="flex justify-end gap-2">
                <AppButton variant="ghost" @click="openEdit(p)">Editar</AppButton>
                <AppButton variant="ghost" class="!text-red-600" @click="remove(p)"
                  >Eliminar</AppButton
                >
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AppPagination v-if="meta" :meta="meta" @change="goTo" />

    <ProductFormModal v-model="modalOpen" :producto="editing" @saved="load" />
  </section>
</template>
