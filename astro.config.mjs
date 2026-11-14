// @ts-check
import { existsSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import katex from 'katex';

/** Returns the dark variant of a figure in public/, if the build made one. */
const darkFigure = (/** @type {string} */ src) => {
  const dark = src.replace(/\.svg$/, '.dark.svg');
  return src.endsWith('.svg') && existsSync(`public${dark}`) ? dark : null;
};

/** Renders $…$ math inside raw-HTML figure captions, which remark-math does not see. */
const rehypeCaptionMath = () => (/** @type {any} */ tree) => {
  const walk = (/** @type {any} */ node) => {
    if (node.type === 'raw' && node.value.includes('<figcaption')) {
      node.value = node.value.replace(/<figcaption>[\s\S]*?<\/figcaption>/g, (/** @type {string} */ cap) =>
        cap.replace(/\$([^$]+)\$/g, (_, /** @type {string} */ m) => katex.renderToString(m, { throwOnError: false })),
      );
    }
    node.children?.forEach(walk);
  };
  walk(tree);
};

/** Wraps SVG figures that have a dark variant in a <picture> with a dark-mode source. */
const rehypeDarkFigures = () => (/** @type {any} */ tree) => {
  const media = '(prefers-color-scheme: dark)';
  const walk = (/** @type {any} */ node) => {
    if (node.type === 'raw') {
      node.value = node.value.replace(/<img\s[^>]*src="([^"]+\.svg)"[^>]*>/g, (/** @type {string} */ img, /** @type {string} */ src) => {
        const dark = darkFigure(src);
        return dark ? `<picture><source srcset="${dark}" media="${media}">${img}</picture>` : img;
      });
    }
    if (!node.children) return;
    node.children = node.children.map((/** @type {any} */ child) => {
      walk(child);
      const src = child.name === 'img' && child.attributes?.find((/** @type {any} */ a) => a.name === 'src')?.value;
      const dark = typeof src === 'string' && darkFigure(src);
      if (!dark) return child;
      const attr = (/** @type {string} */ name, /** @type {string} */ value) => ({ type: 'mdxJsxAttribute', name, value });
      const source = { type: child.type, name: 'source', attributes: [attr('srcset', dark), attr('media', media)], children: [] };
      return { type: child.type, name: 'picture', attributes: [], children: [source, child] };
    });
  };
  walk(tree);
};

export default defineConfig({
  site: 'https://juliusarolovitch.github.io',
  markdown: {
    processor: unified({ remarkPlugins: [remarkMath], rehypePlugins: [rehypeCaptionMath, rehypeDarkFigures, rehypeKatex] }),
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
  integrations: [mdx()],
});
