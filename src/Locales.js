import glob from 'glob';
import path from 'path'

const Available = ['en', 'de-DE', 'pt-BR', 'it-IT'];
const Locales = {};
Available.map(lang => {
  Locales[lang] = require(`./Locales/${lang}.json`);
});

export default Locales;