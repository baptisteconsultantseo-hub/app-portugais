import { useEffect, useMemo, useRef, useState } from 'react';
import { buildAll, PRON, ORDER, TAGS, BLOCKS, TENSE_ADV, txt, cap, fold, FILTERS } from './verbs';

const LS = 'ptconj.v1';
const SHOW_FALSE_FRIEND = true;

function loadSaved() {
  try {
    return JSON.parse(window.localStorage.getItem(LS) || '{}') || {};
  } catch {
    return {};
  }
}

function SearchIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#006633" strokeWidth="2.2">
      <circle cx="10.5" cy="10.5" r="7" />
      <path d="M16 16l5 5" />
    </svg>
  );
}
function BackIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#006633" strokeWidth="2.4">
      <path d="M14 5l-7 7 7 7" />
    </svg>
  );
}
function PrevIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#006633" strokeWidth="2.4">
      <path d="M14 5l-7 7 7 7" />
    </svg>
  );
}
function NextIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#006633" strokeWidth="2.4">
      <path d="M10 5l7 7-7 7" />
    </svg>
  );
}
function IrregularDot({ style }) {
  return <span style={{ display: 'inline-block', width: 4, height: 4, borderRadius: 99, background: '#B22222', ...style }} />;
}

export default function App() {
  const all = useMemo(() => buildAll(), []);
  const alpha = useMemo(() => all.slice().sort((a, b) => a.infinitif.localeCompare(b.infinitif, 'pt')), [all]);

  const saved = useMemo(loadSaved, []);
  const restored = saved.verb ? all.find((v) => v.infinitif === saved.verb) : null;

  const [view, setView] = useState(restored ? 'verb' : 'cloud');
  const [verb, setVerb] = useState(restored || null);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState(saved.mode === 'list' ? 'list' : 'cloud');
  const [filter, setFilter] = useState(FILTERS.includes(saved.filter) ? saved.filter : 'Tous');
  const [toast, setToast] = useState(null);

  const appRef = useRef(null);
  const toastTimer = useRef(null);
  const holdTimer = useRef(null);

  useEffect(() => () => {
    clearTimeout(toastTimer.current);
    clearTimeout(holdTimer.current);
  }, []);

  function save(patch) {
    const s = Object.assign({ filter, mode, verb: verb ? verb.infinitif : null }, patch);
    try { window.localStorage.setItem(LS, JSON.stringify(s)); } catch {}
  }

  function scrollTop() {
    requestAnimationFrame(() => {
      if (appRef.current) appRef.current.scrollTop = 0;
      window.scrollTo(0, 0);
    });
  }

  function open(v, keepScroll) {
    setView('verb');
    setVerb(v);
    save({ verb: v.infinitif });
    if (!keepScroll) scrollTop();
  }
  function back() {
    setView('cloud');
    setVerb(null);
    save({ verb: null });
    scrollTop();
  }
  function step(dir) {
    const i = alpha.indexOf(verb);
    const n = alpha[(i + dir + alpha.length) % alpha.length];
    open(n);
  }
  function flash(msg) {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 1500);
  }
  function copyBlock(label, key) {
    if (!verb) return;
    const lines = PRON.map((p, i) => p + ' ' + txt(verb.conj[key][i]));
    const text = verb.infinitif + ' — ' + label + '\n' + lines.join('\n');
    const done = () => flash('Conjugaison copiée');
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, done);
      else done();
    } catch {
      done();
    }
  }

  const q = fold(query.trim());
  const list = all.filter((v) => {
    if (filter === 'Réguliers' && v.irregular) return false;
    if (filter === 'Irréguliers' && !v.irregular) return false;
    return !q || fold(v.infinitif).includes(q) || fold(v.fr).includes(q);
  });
  const cloud = list.map((v) => {
    const size = Math.round(15 + (v.freq - 4) * 3.1);
    const color = v.freq >= 8 ? '#004422' : v.freq >= 6 ? '#006633' : '#6B7280';
    return { v, size, color };
  });
  const listSet = new Set(list);
  const rows = alpha.filter((v) => listSet.has(v));
  const countLabel = list.length + (list.length > 1 ? ' verbes' : ' verbe');

  const ai = verb ? alpha.indexOf(verb) : 0;
  const prevVerb = verb ? alpha[(ai - 1 + alpha.length) % alpha.length] : null;
  const nextVerb = verb ? alpha[(ai + 1) % alpha.length] : null;

  return (
    <div className="pt-app-shell">
      <div className="pt-app" ref={appRef}>
        {view === 'cloud' && (
          <div style={{ animation: 'ptFade .08s ease-out' }}>
            <div
              style={{
                position: 'sticky', top: 'var(--content-top)', zIndex: 5, background: '#FFFFFF',
                padding: '8px 22px 12px', borderBottom: '1px solid rgba(0,102,51,0.09)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '4px 0 14px' }}>
                <div style={{ font: "600 11px/1 'Public Sans',sans-serif", letterSpacing: '0.14em', textTransform: 'uppercase', color: '#006633' }}>
                  Conjugação PT-PT
                </div>
                <div style={{ font: "400 10px/1 'Public Sans',sans-serif", letterSpacing: '0.04em', color: '#6B7280' }}>{countLabel}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, paddingBottom: 12, borderBottom: '1px solid rgba(0,102,51,0.16)' }}>
                <SearchIcon />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Verbe ou traduction…"
                  style={{ flex: 1, border: 'none', padding: 0, fontSize: 16, fontWeight: 400, color: '#1F2937', background: 'transparent' }}
                />
                {query.length > 0 && (
                  <div
                    onClick={() => setQuery('')}
                    style={{ font: "400 11px/1 'Public Sans',sans-serif", color: '#6B7280', cursor: 'pointer', padding: '2px 4px' }}
                  >
                    effacer
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 12 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {FILTERS.map((label) => (
                    <div
                      key={label}
                      onClick={() => { setFilter(label); save({ filter: label }); }}
                      style={{
                        font: "500 11px/1 'Public Sans',sans-serif", letterSpacing: '0.04em', cursor: 'pointer',
                        padding: '7px 12px', borderRadius: 99,
                        background: filter === label ? '#006633' : '#F1F8F4',
                        color: filter === label ? '#FFFFFF' : '#006633',
                      }}
                    >
                      {label}
                    </div>
                  ))}
                </div>
                <div
                  onClick={() => { const m = mode === 'cloud' ? 'list' : 'cloud'; setMode(m); save({ mode: m }); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', padding: '7px 10px',
                    borderRadius: 99, border: '1px solid rgba(0,102,51,0.2)', font: "500 10px/1 'Public Sans',sans-serif",
                    letterSpacing: '0.06em', textTransform: 'uppercase', color: '#006633',
                  }}
                >
                  {mode === 'cloud' ? 'Liste' : 'Nuage'}
                </div>
              </div>
            </div>

            {mode === 'cloud' && (
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'center', gap: '0px 11px', padding: '20px 18px 26px' }}>
                  {cloud.map(({ v, size, color }) => (
                    <div
                      key={v.infinitif}
                      onClick={() => open(v)}
                      style={{ font: `400 ${size}px/1.05 "Instrument Serif",serif`, color, cursor: 'pointer', padding: '10px 4px', transition: 'opacity .12s' }}
                    >
                      {v.infinitif}
                      {v.irregular && <IrregularDot style={{ verticalAlign: 'super', marginLeft: 2 }} />}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '0 26px 46px', font: "400 10px/1 'Public Sans',sans-serif", color: '#6B7280' }}>
                  <IrregularDot />irrégulier · la taille indique la fréquence
                </div>
              </div>
            )}

            {mode === 'list' && (
              <div style={{ padding: '6px 22px 48px' }}>
                {rows.map((v) => (
                  <div
                    key={v.infinitif}
                    onClick={() => open(v)}
                    style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '14px 0', borderBottom: '1px solid rgba(0,102,51,0.08)', cursor: 'pointer' }}
                  >
                    <span style={{ font: "400 19px/1 'Instrument Serif',serif", color: '#004422' }}>{v.infinitif}</span>
                    {v.irregular && <IrregularDot style={{ alignSelf: 'center' }} />}
                    <span style={{ flex: 1, font: "400 12px/1 'Public Sans',sans-serif", color: '#6B7280', textAlign: 'right' }}>{v.fr}</span>
                  </div>
                ))}
              </div>
            )}

            {list.length === 0 && (
              <div style={{ padding: '24px 26px 40px', textAlign: 'center', font: "400 13px/1.5 'Public Sans',sans-serif", color: '#6B7280' }}>
                Aucun verbe ne correspond.
              </div>
            )}
          </div>
        )}

        {view === 'verb' && verb && (
          <VerbCard
            verb={verb}
            all={all}
            prevVerb={prevVerb}
            nextVerb={nextVerb}
            onBack={back}
            onOpen={open}
            onPrev={() => step(-1)}
            onNext={() => step(1)}
            holdTimer={holdTimer}
            copyBlock={copyBlock}
          />
        )}

        {toast && (
          <div style={{ position: 'sticky', bottom: 0, height: 0, overflow: 'visible', zIndex: 30 }}>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 44, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ background: '#004422', color: '#FFFFFF', font: "500 11px/1 'Public Sans',sans-serif", letterSpacing: '0.04em', padding: '11px 16px', borderRadius: 99, animation: 'ptToast 1.6s ease-out forwards' }}>
                {toast}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VerbCard({ verb: v, all, prevVerb, nextVerb, onBack, onOpen, onPrev, onNext, holdTimer, copyBlock }) {
  const tagStyle = {
    font: "600 10px/1 'Public Sans',sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase',
    padding: '5px 9px', borderRadius: 99,
    background: v.irregular ? '#FEF3E2' : '#F1F8F4',
    color: v.irregular ? '#B22222' : '#006633',
  };
  const model = v.model ? all.find((x) => x.infinitif === v.model) : null;

  return (
    <div style={{ animation: 'ptFade .08s ease-out' }}>
      <div
        style={{
          position: 'sticky', top: 'var(--content-top)', zIndex: 5, background: '#FFFFFF',
          padding: '10px 22px 14px', borderBottom: '1px solid rgba(0,102,51,0.09)',
        }}
      >
        <div
          onClick={onBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '4px 0',
            font: "500 11px/1 'Public Sans',sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase', color: '#006633',
          }}
        >
          <BackIcon />Tous les verbes
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, paddingTop: 12 }}>
          <div style={{ font: "400 40px/1 'Instrument Serif',serif", color: '#004422' }}>{v.infinitif}</div>
          <div style={{ font: "400 15px/1 'Instrument Serif',serif", fontStyle: 'italic', color: '#6B7280' }}>{v.fr}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 11 }}>
          <span style={tagStyle}>{TAGS[v.categorie]}</span>
          {model && (
            <div onClick={() => onOpen(model)} style={{ font: "400 11px/1 'Public Sans',sans-serif", color: '#6B7280', cursor: 'pointer' }}>
              se conjugue comme <span style={{ color: '#006633', fontWeight: 600, borderBottom: '1px solid rgba(0,102,51,0.3)' }}>{v.model}</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '0 22px 24px' }}>
        {v.note && (
          <div style={{ marginTop: 16, padding: '11px 13px', background: '#EAF4FB', borderRadius: 10, font: "400 12px/1.45 'Public Sans',sans-serif", color: '#1F2937' }}>
            {v.note}
          </div>
        )}

        {BLOCKS.map(([key, label, hint]) => {
          const amb = key === 'presente' || key === 'pps' ? v.ambNos : false;
          const regular = v.irregular && !!v.regTenses[key];
          const warn = key === 'composto' && SHOW_FALSE_FRIEND;
          const exGood = cap(txt(v.conj.composto[0])) + '.';
          const exGoodFr = '« ' + v.fr + ' » de façon répétée, jusqu’à aujourd’hui.';
          const exBad = cap(txt(v.conj.pps[0])) + '.';
          const exBadFr = 'voilà le « j’ai fait » français : action terminée, au Pretérito Perfeito Simples.';

          return (
            <div
              key={key}
              onPointerDown={() => { clearTimeout(holdTimer.current); holdTimer.current = setTimeout(() => copyBlock(label, key), 550); }}
              onPointerUp={() => clearTimeout(holdTimer.current)}
              onPointerLeave={() => clearTimeout(holdTimer.current)}
              style={{ paddingTop: 26 }}
            >
              {warn && (
                <div style={{ marginBottom: 18, padding: '13px 14px', background: '#FEF3E2', borderRadius: 12 }}>
                  <div style={{ font: "700 11px/1 'Public Sans',sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase', color: '#B22222' }}>
                    Attention faux ami
                  </div>
                  <div style={{ paddingTop: 7, font: "400 12px/1.5 'Public Sans',sans-serif", color: '#1F2937' }}>
                    Ce temps ne se traduit pas par le passé composé français. Il exprime une action habituelle ou continue commencée dans le passé et qui dure encore aujourd’hui.
                  </div>
                  <div style={{ paddingTop: 9, display: 'flex', flexDirection: 'column', gap: 5, font: "400 12px/1.45 'Public Sans',sans-serif", color: '#1F2937' }}>
                    <div><span style={{ color: '#006633', fontWeight: 600 }}>{exGood}</span> → {exGoodFr}</div>
                    <div><span style={{ color: '#B22222', fontWeight: 600 }}>{exBad}</span> → {exBadFr}</div>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, paddingBottom: 10, borderBottom: '1px solid rgba(0,102,51,0.18)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
                  <div style={{ font: "600 11px/1.2 'Public Sans',sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', color: '#006633' }}>{label}</div>
                  {regular && (
                    <div style={{ font: "500 9px/1 'Public Sans',sans-serif", letterSpacing: '0.06em', textTransform: 'uppercase', color: '#006633', background: '#F1F8F4', padding: '4px 6px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                      régulier
                    </div>
                  )}
                </div>
                <div style={{ font: "400 10px/1.2 'Public Sans',sans-serif", fontStyle: 'italic', color: '#6B7280', textAlign: 'right' }}>{hint}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 16, paddingTop: 4 }}>
                {ORDER.map((i) => {
                  const f = v.conj[key][i];
                  const cellAmb = amb && i === 3;
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex', alignItems: 'baseline', gap: 8, padding: '9px 0',
                        borderBottom: '1px solid rgba(0,102,51,0.07)', opacity: i === 4 ? 0.55 : 1,
                      }}
                    >
                      <span style={{ font: "600 11px/1 'Public Sans',sans-serif", letterSpacing: '0.03em', color: '#B8860B', minWidth: 28 }}>{PRON[i]}</span>
                      <span style={{ font: "400 15px/1.2 'Public Sans',sans-serif", color: '#1F2937', letterSpacing: '-0.01em' }}>
                        <span style={{ color: '#6B7280' }}>{f.pre}</span>{f.r}<span style={{ color: '#B22222', fontWeight: 700 }}>{f.t}</span>
                        {cellAmb && <span style={{ color: '#B8860B', fontWeight: 600, fontSize: 11, verticalAlign: 'super', marginLeft: 2 }}>≡</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
              {amb && (
                <div style={{ paddingTop: 8, font: "400 10px/1.4 'Public Sans',sans-serif", color: '#6B7280' }}>
                  <span style={{ color: '#B8860B', fontWeight: 600 }}>≡</span> forme identique au Presente : c’est le contexte qui tranche.
                </div>
              )}
            </div>
          );
        })}

        <ExercisePanel verb={v} key={v.infinitif} />

        <div style={{ display: 'flex', gap: 8, paddingTop: 30 }}>
          <div onClick={onPrev} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 7, padding: '14px 13px', borderRadius: 12, background: '#F1F8F4', cursor: 'pointer', minHeight: 48, boxSizing: 'border-box' }}>
            <PrevIcon /><span style={{ font: "400 16px/1 'Instrument Serif',serif", color: '#004422' }}>{prevVerb ? prevVerb.infinitif : ''}</span>
          </div>
          <div onClick={onNext} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 7, padding: '14px 13px', borderRadius: 12, background: '#F1F8F4', cursor: 'pointer', minHeight: 48, boxSizing: 'border-box' }}>
            <span style={{ font: "400 16px/1 'Instrument Serif',serif", color: '#004422' }}>{nextVerb ? nextVerb.infinitif : ''}</span><NextIcon />
          </div>
        </div>
        <div style={{ padding: '12px 2px 46px', font: "400 10px/1.4 'Public Sans',sans-serif", color: '#6B7280' }}>
          Appui long sur un tableau pour copier la conjugaison.
        </div>
      </div>
    </div>
  );
}

function ExercisePanel({ verb }) {
  const [active, setActive] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState([]);

  function start() {
    const pool = [];
    BLOCKS.forEach(([key]) => ORDER.forEach((i) => pool.push({ key, i })));
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setQuestions(pool.slice(0, 5));
    setQIndex(0);
    setInput('');
    setChecked(false);
    setResults([]);
    setActive(true);
  }

  function check() {
    if (checked || !input.trim()) return;
    const q = questions[qIndex];
    const correct = txt(verb.conj[q.key][q.i]);
    const ok = input.trim().toLowerCase() === correct.toLowerCase();
    setResults((r) => [...r, { ok, correct }]);
    setChecked(true);
  }

  function next() {
    setQIndex(qIndex + 1);
    setInput('');
    setChecked(false);
  }

  const finished = active && qIndex >= questions.length;
  const q = active && !finished ? questions[qIndex] : null;
  const label = q ? BLOCKS.find(([key]) => key === q.key)[1] : null;
  const adv = q ? TENSE_ADV[q.key] : null;
  const last = results[results.length - 1];
  const pillStyle = {
    display: 'inline-block', font: "500 11px/1 'Public Sans',sans-serif", letterSpacing: '0.06em',
    textTransform: 'uppercase', padding: '11px 18px', borderRadius: 99, cursor: 'pointer',
  };

  return (
    <div style={{ paddingTop: 30 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, paddingBottom: 14, borderBottom: '1px solid rgba(0,102,51,0.18)' }}>
        <div style={{ font: "600 11px/1.2 'Public Sans',sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', color: '#006633' }}>
          Entraînement
        </div>
        {active && !finished && (
          <div style={{ font: "400 10px/1.2 'Public Sans',sans-serif", color: '#6B7280' }}>{qIndex + 1} / {questions.length}</div>
        )}
      </div>

      {!active && (
        <div style={{ paddingTop: 14 }}>
          <div style={{ font: "400 12px/1.5 'Public Sans',sans-serif", color: '#6B7280', paddingBottom: 12 }}>
            5 phrases à trou pour t’entraîner sur « {verb.infinitif} », temps et personnes mélangés.
          </div>
          <div onClick={start} style={{ ...pillStyle, color: '#FFFFFF', background: '#006633' }}>
            Commencer
          </div>
        </div>
      )}

      {q && (
        <div style={{ paddingTop: 16 }}>
          <div style={{ font: "500 9px/1 'Public Sans',sans-serif", letterSpacing: '0.06em', textTransform: 'uppercase', color: '#006633', background: '#F1F8F4', display: 'inline-block', padding: '4px 8px', borderRadius: 99 }}>
            {label}
          </div>
          <div style={{ paddingTop: 12, font: "400 17px/1.4 'Instrument Serif',serif", color: '#1F2937' }}>
            {adv}, <span style={{ color: '#B8860B', fontWeight: 600 }}>{PRON[q.i]}</span> ___.
          </div>
          <input
            type="text"
            value={input}
            disabled={checked}
            autoFocus
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { checked ? next() : check(); } }}
            placeholder="conjugue le verbe…"
            style={{ marginTop: 14, width: '100%', boxSizing: 'border-box', border: '1px solid rgba(0,102,51,0.25)', borderRadius: 10, padding: '11px 13px', fontSize: 16, color: '#1F2937', background: checked ? '#FAFAFA' : '#FFFFFF' }}
          />
          {checked && (
            <div style={{ paddingTop: 10, font: "400 13px/1.4 'Public Sans',sans-serif", color: last.ok ? '#006633' : '#B22222' }}>
              {last.ok ? 'Correct !' : <>Réponse : <strong>{last.correct}</strong></>}
            </div>
          )}
          <div style={{ paddingTop: 14 }}>
            {!checked ? (
              <div onClick={check} style={{ ...pillStyle, color: '#006633', background: '#F1F8F4' }}>
                Vérifier
              </div>
            ) : (
              <div onClick={next} style={{ ...pillStyle, color: '#FFFFFF', background: '#006633' }}>
                {qIndex + 1 >= questions.length ? 'Voir le score' : 'Suivant'}
              </div>
            )}
          </div>
        </div>
      )}

      {finished && (
        <div style={{ paddingTop: 16 }}>
          <div style={{ font: "400 30px/1 'Instrument Serif',serif", color: '#004422' }}>
            {results.filter((r) => r.ok).length} / {results.length}
          </div>
          <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {results.map((r, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, font: "400 12px/1.4 'Public Sans',sans-serif", color: '#1F2937' }}>
                <span>{BLOCKS.find(([key]) => key === questions[idx].key)[1]} · {PRON[questions[idx].i]}</span>
                <span style={{ color: r.ok ? '#006633' : '#B22222', fontWeight: 600 }}>{r.correct}</span>
              </div>
            ))}
          </div>
          <div onClick={start} style={{ ...pillStyle, marginTop: 16, color: '#006633', background: '#F1F8F4' }}>
            Recommencer
          </div>
        </div>
      )}
    </div>
  );
}
