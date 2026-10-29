<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { parseApiError } from "@/api/errors";
import type { Producto } from "@/api/types";
import AppButton from "@/components/ui/AppButton.vue";
import AppInput from "@/components/ui/AppInput.vue";
import AppModal from "@/components/ui/AppModal.vue";
import { useToastStore } from "@/stores/toast";
import { productsApi } from "./products.api";

// `producto` = null → crear; con valor → editar.
const props = defineProps<{ producto: Producto | null }>();
const emit = defineEmits<{ saved: [] }>();
const open = defineModel<boolean>({ required: true });

const toast = useToastStore();
const form = reactive({ nombre: "", descripcion: "", precio: "", stock: "0", activo: true });
const errors = ref<Record<string, string>>({});
const saving = ref(false);

// Cada vez que se abre, el formulario se llena (o se limpia).
watch(open, (isOpen) => {
  if (!isOpen) return;
  const p = props.producto;
  form.nombre = p?.nombre ?? "";
  form.descripcion = p?.descripcion ?? "";
  form.precio = p ? String(p.precio) : "";
  form.stock = p ? String(p.stock) : "0";
  form.activo = p?.activo ?? true;
  errors.value = {};
});

async function submit() {
  const precio = Number(form.precio);
  const stock = Number(form.stock);

  // Validación rápida en el cliente (el backend vuelve a validar todo).
  const found: Record<string, string> = {};
  if (form.nombre.trim().length < 2) found.nombre = "Mínimo 2 caracteres";
  if (form.precio.trim() === "" || Number.isNaN(precio) || precio < 0) {
    found.precio = "Ingresa un precio válido";
  }
  if (!Number.isInteger(stock) || stock < 0) found.stock = "Debe ser un entero mayor o igual a 0";
  errors.value = found;
  if (Object.keys(found).length > 0) return;

  saving.value = true;
  try {
    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      precio,
      stock,
      activo: form.activo,
    };
    if (props.producto) {
      await productsApi.update(props.producto.id, payload);
    } else {
      await productsApi.create(payload);
    }
    toast.success(props.producto ? "Producto actualizado" : "Producto creado");
    open.value = false;
    emit("saved");
  } catch (e) {
    const info = parseApiError(e);
    errors.value = info.fieldErrors; // errores del servidor, por campo
    toast.error(info.message);
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <AppModal v-model="open" :title="producto ? 'Editar producto' : 'Nuevo producto'">
    <form class="space-y-4" novalidate @submit.prevent="submit">
      <AppInput v-model="form.nombre" label="Nombre" :error="errors.nombre" />
      <AppInput
        v-model="form.descripcion"
        label="Descripción (opcional)"
        :error="errors.descripcion"
      />
      <div class="grid grid-cols-2 gap-4">
        <AppInput
          v-model="form.precio"
          label="Precio"
          type="number"
          min="0"
          step="0.01"
          :error="errors.precio"
        />
        <AppInput
          v-model="form.stock"
          label="Stock"
          type="number"
          min="0"
          step="1"
          :error="errors.stock"
        />
      </div>
      <label class="flex items-center gap-2 text-sm">
        <input v-model="form.activo" type="checkbox" class="size-4 rounded border-slate-300" />
        Activo
      </label>

      <div class="flex justify-end gap-2 pt-2">
        <AppButton variant="secondary" @click="open = false">Cancelar</AppButton>
        <AppButton type="submit" :loading="saving">Guardar</AppButton>
      </div>
    </form>
  </AppModal>
</template>
