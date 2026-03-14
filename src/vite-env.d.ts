/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue' {
  export function ref<T>(value: T): { value: T };
  export function computed<T>(getter: () => T): { value: T };
  export function onMounted(callback: () => void): void;
  export function onUnmounted(callback: () => void): void;
  export function watch<T>(source: T | (() => T), callback: (newValue: T, oldValue: T) => void, options?: any): void;
  export function createApp(options: any): any;
  export function nextTick(callback?: () => void): Promise<void>;
  export function provide<T>(key: string | symbol, value: T): void;
  export function inject<T>(key: string | symbol, defaultValue?: T): T;
  export function reactive<T extends object>(target: T): T;
  export function toRefs<T extends object>(object: T): { [K in keyof T]: { value: T[K] } };
}

declare module 'vue-router' {
  export function createRouter(options: any): any;
  export function createWebHistory(): any;
  export function useRouter(): any;
  export function useRoute(): any;
  export type RouteRecordRaw = any;
  export type NavigationGuardNext = any;
  export type RouteLocationNormalized = any;
  export const RouterView: any;
  export const RouterLink: any;
}
