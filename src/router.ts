import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

// The hub serves index.html for any unknown path, so /node/{id} survives a reload.
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/node/:id(\\d+)', name: 'node', component: () => import('@/views/NodeView.vue'), props: r => ({ id: Number(r.params.id) }) },
    { path: '/:rest(.*)*', redirect: '/' },
  ],
  scrollBehavior: (_to, _from, saved) => saved ?? { top: 0 },
})
