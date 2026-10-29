import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const read = name => readFile(new URL(name, root), 'utf8');
const [html, css, physics, game] = await Promise.all(['index.html', 'style.css', 'physics.js', 'game.js'].map(read));
// Bundle our local modules into a classic script: file:// browsers block module imports.
const code = physics.replace(/^export /gm, '') + '\n' + game.replace(/^import .*;\n/, '');
const bundled = html
 .replace('<link rel="stylesheet" href="style.css">', () => `<style>\n${css}\n</style>`)
 .replace('<script type="module" src="game.js"></script>', () => `<script>\n(()=>{\n${code.replace(/<\/script/gi, '<\\/script')}\n})();\n</script>`);
await writeFile(new URL('StickJump.html', root), bundled);
console.log('Built StickJump.html — open directly in a browser; no server or internet needed.');
