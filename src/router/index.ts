import { createRouter, createWebHistory } from "vue-router";
import type { Rol } from "@/api/types";
import { APP_NAME } from "@/lib/format";
import { useAuthStore } from "@/stores/auth";

// Metadatos que cada ruta puede declarar y que el guard lee abajo.
declare module "vue-router" {
  interface RouteMeta {
    title?: string;
    requiresAuth?: boolean;
    guestOnly?: boolean;
    roles?: Rol[];
  }
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      component: () => import("@/layouts/AuthLayout.vue"),
      meta: { guestOnly: true },
      children: [
        {
          path: "",
          name: "login",
          component: () => import("@/features/auth/LoginView.vue"),
          meta: { title: "Iniciar sesión" },
        },
      ],
    },
    {
      path: "/",
      component: () => import("@/layouts/DashboardLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          name: "home",
          component: () => import("@/features/home/HomeView.vue"),
          meta: { title: "Inicio" },
        },
        {
          path: "products",
          name: "products",
          component: () => import("@/features/products/ProductsView.vue"),
          meta: { title: "Productos" },
        },
        {
          path: "users",
          name: "users",
          component: () => import("@/features/users/UsersView.vue"),
          meta: { title: "Usuarios", roles: ["ADMIN"] },
        },
        {
          path: "forbidden",
          name: "forbidden",
          component: () => import("@/features/errors/ForbiddenView.vue"),
          meta: { title: "Sin permiso" },
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/features/errors/NotFoundView.vue"),
      meta: { title: "No encontrado" },
    },
  ],
});

// Guard global: protege rutas por sesión y por rol.
// (La seguridad real la aplica el backend; esto solo mejora la experiencia.)
router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth) {
    if (!auth.isAuthenticated) {
      return { name: "login", query: { redirect: to.fullPath } };
    }
    await auth.loadUser();
    if (!auth.isAuthenticated) return { name: "login" }; // el token ya no servía
    if (to.meta.roles && !auth.hasRole(...to.meta.roles)) return { name: "forbidden" };
  }

  if (to.meta.guestOnly && auth.isAuthenticated) return { name: "home" };
});

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · ${APP_NAME}` : APP_NAME;
});
