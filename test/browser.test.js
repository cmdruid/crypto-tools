!(function (e) {
  'use strict'
  const t = /[\p{Lu}]/u,
    s = /[\p{Ll}]/u,
    r = /^[\p{Lu}](?![\p{Lu}])/gu,
    o = /([\p{Alpha}\p{N}_]|$)/u,
    n = /[_.\- ]+/,
    c = new RegExp('^' + n.source),
    a = new RegExp(n.source + o.source, 'gu'),
    i = new RegExp('\\d+' + o.source, 'gu')
  const l = 'src/index.js',
    p = (function (e, o) {
      if ('string' != typeof e && !Array.isArray(e))
        throw new TypeError('Expected the input to be `string | string[]`')
      if (
        ((o = { pascalCase: !1, preserveConsecutiveUppercase: !1, ...o }),
        0 ===
          (e = Array.isArray(e)
            ? e
                .map((e) => e.trim())
                .filter((e) => e.length)
                .join('-')
            : e.trim()).length)
      )
        return ''
      const l =
          !1 === o.locale
            ? (e) => e.toLowerCase()
            : (e) => e.toLocaleLowerCase(o.locale),
        p =
          !1 === o.locale
            ? (e) => e.toUpperCase()
            : (e) => e.toLocaleUpperCase(o.locale)
      return 1 === e.length
        ? n.test(e)
          ? ''
          : o.pascalCase
          ? p(e)
          : l(e)
        : (e !== l(e) &&
            (e = ((e, r, o) => {
              let n = !1,
                c = !1,
                a = !1
              for (let i = 0; i < e.length; i++) {
                const l = e[i]
                n && t.test(l)
                  ? ((e = e.slice(0, i) + '-' + e.slice(i)),
                    (n = !1),
                    (a = c),
                    (c = !0),
                    i++)
                  : c && a && s.test(l)
                  ? ((e = e.slice(0, i - 1) + '-' + e.slice(i - 1)),
                    (a = c),
                    (c = !1),
                    (n = !0))
                  : ((n = r(l) === l && o(l) !== l),
                    (a = c),
                    (c = o(l) === l && r(l) !== l))
              }
              return e
            })(e, l, p)),
          (e = e.replace(c, '')),
          (e = o.preserveConsecutiveUppercase
            ? ((e, t) => ((r.lastIndex = 0), e.replace(r, (e) => t(e))))(e, l)
            : l(e)),
          o.pascalCase && (e = p(e.charAt(0)) + e.slice(1)),
          ((e, t) => (
            (a.lastIndex = 0),
            (i.lastIndex = 0),
            e.replace(a, (e, s) => t(s)).replace(i, (e) => t(e))
          ))(e, p))
    })(
      String('/' + '@cmdcode/crypto-utils')
        .split('/')
        .at(-1)
    )
  e(`Running tests for ${p}`, async (e) => {
    const t = await (async function () {
      if ('undefined' != typeof window) return window[p]
      const e = process?.argv ? process.argv.slice(2, 3) : l
      if (String(e).includes('main'))
        throw new Error('Unable to run tests on a commonJs module!')
      return (
        console.log(`Testing package: ${e}`),
        import('../' + e).then((e) => e.default)
      )
    })()
    for (const s of Object.keys(t))
      try {
        const r = await import(`./src/${s}.test.js`)
        for (const o of Object.keys(r)) {
          const n = t[s][o]
          'function' == typeof n &&
            e.test(`Performing tests for ${s}.${o}:`, (e) => {
              r[o](e, n)
            })
        }
      } catch (e) {
        console.log(`Failed to load tests for ${s}. Skipping ...`)
      }
  })
})(tape)
