export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: true,

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'SafeBin',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'A secure website for storing text online for free and easy sharing' },
      { name: 'author', content: 'github.com/zeerx7'},
      { name: 'theme-color', content: '#fffff'}
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    ]
  },

  // https://v2.nuxt.com/docs/configuration-glossary/configuration-global-name/
  globals: {
    id: "__paste",  // replacing __nuxt
    context: '__paste__', // replacing __NUXT__
  },

  router: {
    extendRoutes(routes, resolve) {
      routes.push({
        path: '*',
        component: resolve(__dirname, 'pages/p/_id.vue'),
        meta: {
          ssr: true, // Ubah status code menjadi 200 dari sisi server
        },
      })
    },
  },
  serverMiddleware: ['~/api/index'],

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~/node_modules/bootstrap/scss/bootstrap.scss',
    '~/node_modules/font-awesome/css/font-awesome.min.css'
    // {src:"~/node_modules/bootstrap/dist/css/bootstrap.min.css", mode: "client"},
    // {src:"~/node_modules/font-awesome/css/font-awesome.min.css", mode: "client"},
    // {src:"static/css/style.css", mode: "client"}
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: '~/plugins/function.js', mode: 'server' },
    { src: "~/node_modules/bootstrap/dist/js/bootstrap.bundle.min.js", mode: "client" },
    { src: '~/plugins/toast.js', mode: 'client' }
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // 'nuxt-purgecss',
    ['nuxt-highlightjs', {
      style: 'obsidian'
    }]
  ],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    extractCSS: true,
    publicPath: '/__/',
    html: {
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true,
      },
    },
  },
}
