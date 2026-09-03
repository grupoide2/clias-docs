// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  mainSidebar: [
    {
      type: 'category',
      label: 'Documentación Oficial',
      collapsible: false,
      link: { type: 'doc', id: 'intro' },
      items: [
        {
          type: 'category',
          label: 'Manual de Administrador (Web)',
          collapsible: true,
          items: [
            'admin/intro',
            'admin/gestionar-usuarios',
            'admin/status-dispositivos',
            'admin/generacion-codigos',
            'admin/servicios-relacionados',
          ],
        },
        {
          type: 'category',
          label: 'Manual de Usuario (App Móvil)',
          collapsible: true,
          items: [
            'user/intro',
            'user/install',
            'user/manual',
            'user/faq',
          ],
        },
        {
          type: 'category',
          label: 'Manual de Desarrollador',
          collapsible: true,
          items: [
            'dev/intro',
            {
              type: 'category',
              label: 'Backend',
              items: [
                'dev/backend/description',
                'dev/backend/setup',
                'dev/backend/db',
                'dev/backend/security',
                'dev/backend/endpoints',
                'dev/backend/migracion-metricas',
                'dev/backend/resources',
                'dev/backend/web-thymeleaf',
              ],
            },
            {
              type: 'category',
              label: 'Chatbot',
              items: [
                'dev/chatbot/description',
                'dev/chatbot/setup',
              ],
            },
            {
              type: 'category',
              label: 'App Móvil (SISA)',
              items: [
                'dev/frontend-app/introduccion-sisa',
                'dev/frontend-app/arquitectura-general',
                'dev/frontend-app/modulos-principales',
                'dev/frontend-app/servicios-apis',
                'dev/frontend-app/notificaciones-push',
                'dev/frontend-app/configuracion-despliegue',
              ],
            },
            {
              type: 'category',
              label: 'Web Admin (Flutter Web)',
              items: [
                'dev/frontend-web/description',
                'dev/frontend-web/structure',
                'dev/frontend-web/setup',
                'dev/frontend-web/enviroment-configuration',
                'dev/frontend-web/security',
                'dev/frontend-web/endpoints',
              ],
            },
            {
              type: 'category',
              label: 'Notificaciones',
              items: [
                'dev/notificaciones/description',
                'dev/notificaciones/envio-manual',
                'dev/notificaciones/movil',
              ],
            },
            'hl7',
            'tiendas-sisa',
          ],
        },
      ],
    },
  ],
};

export default sidebars;
