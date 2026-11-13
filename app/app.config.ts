export default defineAppConfig({
  ui: {
    // The scales live in app/assets/css/main.css
    colors: {
      primary: 'lake',
      secondary: 'ember',
      neutral: 'stone',
    },
    // Dense, flat tables: the data is the page
    table: {
      slots: {
        root: 'rounded-md ring ring-default',
        thead: 'bg-muted',
        th: 'px-3 py-1.5 text-sm font-medium text-muted',
        td: 'px-3 py-2 text-sm text-default',
        empty: 'py-10',
      },
    },
    // Cards are for stats and grouped settings: flat, bordered, tight
    card: {
      slots: {
        root: 'rounded-md shadow-none',
        header: 'px-4 py-3 sm:px-4',
        body: 'p-4 sm:p-4',
        footer: 'px-4 py-3 sm:px-4',
      },
    },
    modal: {
      slots: {
        content: 'rounded-md',
        title: 'text-base font-semibold',
      },
    },
    slideover: {
      slots: {
        title: 'text-base font-semibold',
      },
    },
    badge: {
      slots: {
        base: 'font-medium',
      },
      defaultVariants: {
        variant: 'subtle',
      },
    },
    dashboardPanel: {
      slots: {
        body: 'p-4 sm:p-6 gap-4 sm:gap-6',
      },
    },
    dashboardSidebar: {
      slots: {
        root: 'bg-muted',
      },
    },
    navigationMenu: {
      slots: {
        label: 'text-xs font-medium text-dimmed',
      },
    },
  },
})
