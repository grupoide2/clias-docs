// @ts-check
import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Documentación CLIAS',
  tagline: 'IA en la Promoción de Automuestreo para la Detección Temprana de VPH',
  favicon: 'img/favicon.ico',

  url: 'https://clias.ucuenca.edu.ec',
  baseUrl: '/docs/',

  organizationName: 'chr1s23',
  projectName: 'clias-docs',
  trailingSlash: false,

  onBrokenLinks: 'warn',

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  themes: ['@docusaurus/theme-mermaid'],

  i18n: {
    defaultLocale: 'es',
    locales: ['es'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: '/',
          editUrl: 'https://github.com/chr1s23/TelemedicinaBE/tree/main/docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/logos/clias.png',
      navbar: {
        title: '',
        logo: {
          alt: 'Logo UCuenca',
          src: 'img/logos/ucuenca.png',
        },
        items: [
          {
            type: 'html',
            position: 'left',
            value: '<img src="/docs/img/logos/clias.png" alt="CLIAS" style="height:40px;margin-left:12px;vertical-align:middle" />',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [],
        copyright: `
          Universidad de Cuenca – Grupo de Investigación en Infraestructura de Datos Espaciales<br/>
          Facultad de Ingeniería. Departamento de Ciencias de la Computación<br/>
          Campus Balzay – Víctor Manuel Albornoz y Av. de los Cerezos (Bloque A) | Teléfono: +593 7 413 4520 ext. 4790<br/>
          Ing. Villie Morocho, PhD. | <a href="mailto:gi.ide@ucuenca.edu.ec" style="color:#e8a838">gi.ide@ucuenca.edu.ec</a><br/><br/>
          © ${new Date().getFullYear()} Universidad de Cuenca
        `,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'java', 'kotlin', 'yaml', 'docker'],
      },
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
    }),
};

export default config;
