import { store } from '@/main'
import Vue from 'vue'
import VueRouter, { RouterOptions } from 'vue-router'

Vue.use(VueRouter)

export const createRouter = (basePath?: string): VueRouter => {
  const router = new VueRouter({
    mode: 'history',
    base: basePath || import.meta.env.BASE_URL,
    routes: [
      {
        path: '/alerts',
        name: 'alerts',
        component: async () => import('./views/Alerts.vue'),
        props: (route) => ({
          query: route.query,
          isKiosk: route.query.kiosk,
          hash: route.hash
        }),
        meta: { title: 'Alerts', requiresAuth: true }
      },
      {
        path: '/alert/:id',
        name: 'alert',
        component: async () => import('./views/Alert.vue'),
        props: true,
        meta: { title: 'Alert Detail', requiresAuth: true }
      },
      {
        path: '/incidents',
        name: 'incidents',
        component: async () => import('./views/Incidents.vue'),
        props: (route) => ({
          query: route.query,
          isKiosk: route.query.kiosk,
          hash: route.hash
        }),
        meta: { title: 'Incidents', requiresAuth: true }
      },
      {
        path: '/incidents/:id',
        name: 'incident',
        component: async () => import('./views/Incident.vue'),
        meta: { title: 'Incident Detail', requiresAuth: true }
      },
      {
        path: '/heartbeats',
        name: 'heartbeats',
        component: async () => import('./views/Heartbeats.vue'),
        meta: { title: 'Heartbeats', requiresAuth: true }
      },
      {
        path: '/users',
        name: 'users',
        component: async () => import('./views/Users.vue'),
        meta: { title: 'Users', requiresAuth: true }
      },
      {
        path: '/groups',
        name: 'groups',
        component: async () => import('./views/Groups.vue'),
        meta: { title: 'Groups', requiresAuth: true }
      },
      {
        path: '/customers',
        name: 'customers',
        component: async () => import('./views/Customers.vue'),
        meta: { title: 'Customers', requiresAuth: true }
      },
      {
        path: '/blackouts',
        name: 'blackouts',
        component: async () => import('./views/Blackouts.vue'),
        meta: { title: 'Blackouts', requiresAuth: true }
      },
      {
        path: '/perms',
        name: 'perms',
        component: async () => import('./views/Perms.vue'),
        meta: { title: 'Permissions', requiresAuth: true }
      },
      {
        path: '/keys',
        name: 'apiKeys',
        component: async () => import('./views/ApiKeys.vue'),
        meta: { title: 'API Keys', requiresAuth: true }
      },
      {
        path: '/reports',
        name: 'reports',
        component: async () => import('./views/Reports.vue'),
        meta: { title: 'Reports', requiresAuth: true }
      },
      {
        path: '/profile',
        name: 'profile',
        component: async () => import('./views/Profile.vue'),
        meta: { title: 'Profile', requiresAuth: true }
      },
      {
        path: '/settings',
        name: 'settings',
        component: async () => import('./views/Settings.vue'),
        meta: { title: 'Settings', requiresAuth: true }
      },
      {
        path: '/help',
        name: 'help',
        component: () =>
          window.open('https://docs.alerta.io/?utm_source=app', '_blank')
      },
      {
        path: '/about',
        name: 'about',
        component: async () => import('./views/About.vue'),
        meta: { title: 'About', requiresAuth: true }
      },
      {
        path: '/login',
        name: 'login',
        component: async () => import('./views/Login.vue'),
        meta: { title: 'Login' }
      },
      {
        path: '/signup',
        name: 'signup',
        component: async () => import('./views/Signup.vue'),
        meta: { title: 'Sign Up' }
      },
      {
        path: '/confirm/:token',
        name: 'confirm',
        component: async () => import('./views/Confirm.vue'),
        meta: { title: 'Confirm Email' }
      },
      {
        path: '/forgot',
        name: 'forgot',
        component: async () => import('./views/Forgot.vue'),
        meta: { title: 'Forgot Password' }
      },
      {
        path: '/reset/:token',
        name: 'reset',
        component: async () => import('./views/Reset.vue'),
        meta: { title: 'Reset Password' }
      },
      {
        path: '/logout',
        name: 'logout',
        component: async () => import('./views/Logout.vue'),
        meta: { title: 'Logout' }
      },
      {
        path: '*',
        redirect: (to) => {
          // redirect hashbang mode links to HTML5 mode links
          if (to.fullPath.slice(0, 3) === '/#/') {
            return { path: to.fullPath.slice(2), hash: '' }
          }
          return '/alerts'
        }
      }
    ]
  } as RouterOptions)

  // redirect users not logged in to /login if authentication enabled
  router.beforeEach((to, from, next) => {
    if (
      store.getters.getConfig('auth_required') &&
      to.matched.some((record) => record.meta.requiresAuth)
    ) {
      if (
        !store.getters['auth/isLoggedIn'] &&
        !store.getters.getConfig('allow_readonly')
      ) {
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
      } else {
        next()
      }
    } else {
      next()
    }
  })

  router.beforeEach((to, from, next) => {
    if (to?.meta?.title) {
      document.title = `${to.meta.title} | Alerta`
    }
    next()
  })

  router.beforeEach((to, from, next) => {
    const externalUrl = to.fullPath.replace('/', '')
    if (externalUrl.match(/^(http(s)?|ftp):\/\//)) {
      window.open(externalUrl, '_blank')
    } else {
      next()
    }
  })

  return router
}
