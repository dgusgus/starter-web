<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
</script>

<template>
  <section class="space-y-4">
    <h1 class="text-2xl font-semibold tracking-tight">Hola, {{ auth.user?.nombre }}</h1>
    <p class="text-slate-600">
      Esta es la base del frontend. Reemplaza esta vista por el panel de tu proyecto.
    </p>

    <div class="grid gap-4 sm:grid-cols-2">
      <RouterLink
        to="/products"
        class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:ring-indigo-300"
      >
        <h2 class="font-medium">Productos</h2>
        <p class="mt-1 text-sm text-slate-500">Módulo de ejemplo: lista, búsqueda, CRUD.</p>
      </RouterLink>
      <RouterLink
        v-if="auth.isAdmin"
        to="/users"
        class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:ring-indigo-300"
      >
        <h2 class="font-medium">Usuarios</h2>
        <p class="mt-1 text-sm text-slate-500">Solo ADMIN: crear usuarios y asignar roles.</p>
      </RouterLink>
    </div>
  </section>
</template>
