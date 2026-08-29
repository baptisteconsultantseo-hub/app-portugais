// Verb data and conjugation logic, ported from the Claude Design prototype.

const AUX = ['tenho ', 'tens ', 'tem ', 'temos ', 'tendes ', 'têm '];
const FUT = ['ei', 'ás', 'á', 'emos', 'eis', 'ão'];
const END = {
  ar: { pres: ['o', 'as', 'a', 'amos', 'ais', 'am'], pps: ['ei', 'aste', 'ou', 'ámos', 'astes', 'aram'], part: 'ado' },
  er: { pres: ['o', 'es', 'e', 'emos', 'eis', 'em'], pps: ['i', 'este', 'eu', 'emos', 'estes', 'eram'], part: 'ido' },
  ir: { pres: ['o', 'es', 'e', 'imos', 'is', 'em'], pps: ['i', 'iste', 'iu', 'imos', 'istes', 'iram'], part: 'ido' },
};
export const PRON = ['eu', 'tu', 'ele', 'nós', 'vós', 'eles'];
export const ORDER = [0, 3, 1, 4, 2, 5];
const MODEL = { ar: 'falar', er: 'comer', ir: 'partir' };

const REG = [
  ['falar', 'parler', 9], ['gostar', 'aimer', 8], ['estudar', 'étudier', 7], ['trabalhar', 'travailler', 7],
  ['chegar', 'arriver', 7], ['começar', 'commencer', 7], ['ficar', 'rester', 7], ['morar', 'habiter', 6],
  ['passar', 'passer', 6], ['tomar', 'prendre', 6], ['comprar', 'acheter', 6], ['pagar', 'payer', 6],
  ['andar', 'marcher', 5], ['viajar', 'voyager', 5], ['ajudar', 'aider', 5], ['procurar', 'chercher', 5],
  ['cantar', 'chanter', 4], ['amar', 'aimer', 4],
  ['comer', 'manger', 7], ['beber', 'boire', 6], ['viver', 'vivre', 6], ['aprender', 'apprendre', 6],
  ['escrever', 'écrire', 6, 'escrito'], ['entender', 'comprendre', 6], ['correr', 'courir', 5],
  ['vender', 'vendre', 5], ['receber', 'recevoir', 5],
  ['abrir', 'ouvrir', 6, 'aberto'], ['partir', 'partir', 5], ['decidir', 'décider', 5],
  ['assistir', 'assister', 4], ['dividir', 'diviser', 4], ['permitir', 'permettre', 4], ['discutir', 'discuter', 4],
];

const IRR = [
  ['ser', 'être', 10, ['sou', 'és', 'é', 'somos', 'sois', 'são'], ['fui', 'foste', 'foi', 'fomos', 'fostes', 'foram'], null, 'sido', 'ser = état permanent · estar = état temporaire.'],
  ['estar', 'être (état, lieu)', 10, ['estou', 'estás', 'está', 'estamos', 'estais', 'estão'], ['estive', 'estiveste', 'esteve', 'estivemos', 'estivestes', 'estiveram'], null, 'estado', null],
  ['ter', 'avoir', 10, ['tenho', 'tens', 'tem', 'temos', 'tendes', 'têm'], ['tive', 'tiveste', 'teve', 'tivemos', 'tivestes', 'tiveram'], null, 'tido', 'Auxiliaire de tous les temps composés.'],
  ['ir', 'aller', 9, ['vou', 'vais', 'vai', 'vamos', 'ides', 'vão'], ['fui', 'foste', 'foi', 'fomos', 'fostes', 'foram'], null, 'ido', 'Passé simple identique à celui de ser.'],
  ['fazer', 'faire', 9, ['faço', 'fazes', 'faz', 'fazemos', 'fazeis', 'fazem'], ['fiz', 'fizeste', 'fez', 'fizemos', 'fizestes', 'fizeram'], ['farei', 'farás', 'fará', 'faremos', 'fareis', 'farão'], 'feito', null],
  ['poder', 'pouvoir', 9, ['posso', 'podes', 'pode', 'podemos', 'podeis', 'podem'], ['pude', 'pudeste', 'pôde', 'pudemos', 'pudestes', 'puderam'], null, 'podido', null],
  ['querer', 'vouloir', 9, ['quero', 'queres', 'quer', 'queremos', 'quereis', 'querem'], ['quis', 'quiseste', 'quis', 'quisemos', 'quisestes', 'quiseram'], null, 'querido', null],
  ['vir', 'venir', 8, ['venho', 'vens', 'vem', 'vimos', 'vindes', 'vêm'], ['vim', 'vieste', 'veio', 'viemos', 'viestes', 'vieram'], null, 'vindo', null],
  ['dizer', 'dire', 8, ['digo', 'dizes', 'diz', 'dizemos', 'dizeis', 'dizem'], ['disse', 'disseste', 'disse', 'dissemos', 'dissestes', 'disseram'], ['direi', 'dirás', 'dirá', 'diremos', 'direis', 'dirão'], 'dito', null],
  ['dar', 'donner', 8, ['dou', 'dás', 'dá', 'damos', 'dais', 'dão'], ['dei', 'deste', 'deu', 'demos', 'destes', 'deram'], null, 'dado', null],
  ['ver', 'voir', 8, ['vejo', 'vês', 'vê', 'vemos', 'vedes', 'veem'], ['vi', 'viste', 'viu', 'vimos', 'vistes', 'viram'], null, 'visto', null],
  ['saber', 'savoir', 8, ['sei', 'sabes', 'sabe', 'sabemos', 'sabeis', 'sabem'], ['soube', 'soubeste', 'soube', 'soubemos', 'soubestes', 'souberam'], null, 'sabido', null],
  ['pôr', 'mettre', 7, ['ponho', 'pões', 'põe', 'pomos', 'pondes', 'põem'], ['pus', 'puseste', 'pôs', 'pusemos', 'pusestes', 'puseram'], ['porei', 'porás', 'porá', 'poremos', 'poreis', 'porão'], 'posto', '« ponhar » n’existe pas : l’infinitif est pôr.'],
  ['pedir', 'demander', 7, ['peço', 'pedes', 'pede', 'pedimos', 'pedis', 'pedem'], null, null, 'pedido', null],
  ['conseguir', 'réussir à', 7, ['consigo', 'consegues', 'consegue', 'conseguimos', 'conseguis', 'conseguem'], null, null, 'conseguido', null],
  ['conhecer', 'connaître', 7, ['conheço', 'conheces', 'conhece', 'conhecemos', 'conheceis', 'conhecem'], null, null, 'conhecido', 'c → ç devant o.'],
  ['trazer', 'apporter', 6, ['trago', 'trazes', 'traz', 'trazemos', 'trazeis', 'trazem'], ['trouxe', 'trouxeste', 'trouxe', 'trouxemos', 'trouxestes', 'trouxeram'], ['trarei', 'trarás', 'trará', 'traremos', 'trareis', 'trarão'], 'trazido', null],
  ['ouvir', 'entendre', 6, ['ouço', 'ouves', 'ouve', 'ouvimos', 'ouvis', 'ouvem'], null, null, 'ouvido', null],
  ['sair', 'sortir', 6, ['saio', 'sais', 'sai', 'saímos', 'saís', 'saem'], ['saí', 'saíste', 'saiu', 'saímos', 'saístes', 'saíram'], null, 'saído', null],
  ['ler', 'lire', 6, ['leio', 'lês', 'lê', 'lemos', 'ledes', 'leem'], null, null, 'lido', null],
  ['perder', 'perdre', 6, ['perco', 'perdes', 'perde', 'perdemos', 'perdeis', 'perdem'], null, null, 'perdido', null],
  ['sentir', 'sentir', 6, ['sinto', 'sentes', 'sente', 'sentimos', 'sentis', 'sentem'], null, null, 'sentido', 'e → i à la 1re personne.'],
  ['dormir', 'dormir', 6, ['durmo', 'dormes', 'dorme', 'dormimos', 'dormis', 'dormem'], null, null, 'dormido', 'o → u à la 1re personne.'],
  ['haver', 'y avoir', 5, ['hei', 'hás', 'há', 'havemos', 'haveis', 'hão'], ['houve', 'houveste', 'houve', 'houvemos', 'houvestes', 'houveram'], null, 'havido', 'Surtout à la 3e personne : há = il y a.'],
  ['cair', 'tomber', 5, ['caio', 'cais', 'cai', 'caímos', 'caís', 'caem'], ['caí', 'caíste', 'caiu', 'caímos', 'caístes', 'caíram'], null, 'caído', null],
  ['subir', 'monter', 5, ['subo', 'sobes', 'sobe', 'subimos', 'subis', 'sobem'], null, null, 'subido', 'u → o à tu / ele / eles.'],
];

export const TAGS = { regulier_ar: 'Régulier · -AR', regulier_er: 'Régulier · -ER', regulier_ir: 'Régulier · -IR', irregulier: 'Irrégulier' };
export const BLOCKS = [
  ['presente', 'Presente', 'présent'],
  ['pps', 'Pretérito Perfeito Simples', 'action terminée · le vrai « j’ai fait »'],
  ['futuro', 'Futuro', 'futur simple'],
  ['composto', 'Pretérito Perfeito Composto', 'action qui dure encore · pas « j’ai fait »'],
];

function orth(stem) {
  if (stem.endsWith('ç')) return stem.slice(0, -1) + 'c';
  if (stem.endsWith('g')) return stem + 'u';
  if (stem.endsWith('c')) return stem.slice(0, -1) + 'qu';
  return stem;
}
function full(list) { return list.map((f) => ({ pre: '', r: f, t: '' })); }
function regularTense(inf, kind) {
  const g = inf.slice(-2), stem = inf.slice(0, -2), e = END[g];
  if (kind === 'presente') return e.pres.map((t) => ({ pre: '', r: stem, t }));
  return e.pps.map((t, i) => ({ pre: '', r: g === 'ar' && i === 0 ? orth(stem) : stem, t }));
}
function futuroOf(inf) { return FUT.map((t) => ({ pre: '', r: inf, t })); }
function compostoOf(inf, override) {
  const g = inf.slice(-2), stem = inf.slice(0, -2), e = END[g];
  if (override) return AUX.map((a) => ({ pre: a, r: override, t: '' }));
  return AUX.map((a) => ({ pre: a, r: stem, t: e.part }));
}
export function txt(f) { return f.pre + f.r + f.t; }
export function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
export function fold(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }

function decorate(v) {
  v.part = txt(v.conj.composto[0]).replace(AUX[0], '');
  // formes ambiguës : nós identique au Presente et au Pretérito Perfeito Simples
  v.ambNos = txt(v.conj.presente[3]) === txt(v.conj.pps[3]);
  return v;
}

export function buildAll() {
  const out = [];
  REG.forEach(([inf, fr, freq, part]) => {
    const g = inf.slice(-2);
    out.push(decorate({
      infinitif: inf, fr, freq, categorie: 'regulier_' + g, irregular: false, note: null,
      model: inf === MODEL[g] ? null : MODEL[g], regTenses: {},
      conj: {
        presente: regularTense(inf, 'presente'), pps: regularTense(inf, 'pps'),
        futuro: futuroOf(inf), composto: compostoOf(inf, part),
      },
    }));
  });
  IRR.forEach(([inf, fr, freq, pres, pps, fut, part, note]) => {
    out.push(decorate({
      infinitif: inf, fr, freq, categorie: 'irregulier', irregular: true, note,
      model: null, regTenses: { pps: !pps, futuro: !fut },
      conj: {
        presente: full(pres),
        pps: pps ? full(pps) : regularTense(inf, 'pps'),
        futuro: fut ? full(fut) : futuroOf(inf),
        composto: compostoOf(inf, part),
      },
    }));
  });
  let s = 7;
  return out
    .map((v) => { s = (s * 9301 + 49297) % 233280; return { v, k: s }; })
    .sort((a, b) => a.k - b.k)
    .map((o) => o.v);
}

export const FILTERS = ['Tous', 'Réguliers', 'Irréguliers'];

// Adverbe qui ancre chaque temps dans son sens, utilisé pour générer les phrases d'entraînement.
export const TENSE_ADV = {
  presente: 'Normalmente',
  pps: 'Ontem',
  futuro: 'Amanhã',
  composto: 'Ultimamente',
};
