import {defineConfig} from 'astro/config';
import mdx from '@astrojs/mdx';
import StaticCMS, { enableNetlifyIdentityWidget } from "@grewety/astro-static-cms";
import sitemap from '@astrojs/sitemap';
import {fileURLToPath} from "node:url";
import path from "node:path";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// https://astro.build/config
export default defineConfig({
    site: "http://localhost:3000",
    integrations: [mdx(), sitemap(),
        StaticCMS({
            minLogLevel: 2,
            injectBeforeInitStaticCMS: [enableNetlifyIdentityWidget()],
            previewStyles: {
                css: [".frame-content { border: #00f; }", ".frame-content { background-color: #fef; }"],
            },
            config: {
                media_folder: "public",
                collections: [
                    // Define a blog post collection
                    {
                        name: 'blog',
                        label: 'Blog Posts',
                        folder: 'src/content/blog',
                        create: true,
                        delete: true,
                        editor: {
                            frame: false,
                        },
                        fields: [
                            /*
                             * Widgets define the data type and interface for entry fields.
                             * Static CMS comes with several built-in widgets.
                             * (https://www.staticcms.org/docs/widgets)
                             */
                            {
                                name: 'title',
                                widget: 'string',
                                label: 'Post Title'
                            }, {
                                name: 'description',
                                widget: 'string',
                                label: 'Short Description'
                            }, {
                                name: 'pubDate',
                                widget: 'date',
                                label: 'Publish Date'
                            }, {
                                name: 'heroImage',
                                widget: 'image',
                                label: 'Teaser/Hero Image'
                            }, {
                                name: 'body',
                                widget: 'markdown',
                                label: 'Post Body'
                            },
                        ],
                    },
                ],
            },
        }),
    ],
});
