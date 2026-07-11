/* Build-time social-card renderer.
 *
 * satori turns a flexbox layout into SVG, resvg rasterizes it to PNG. Called by
 * prerender.ts to emit a distinct 1200×630 card per note and project, styled on
 * the site palette with the real Fraunces / Schibsted Grotesk / Space Mono fonts
 * from resume/fonts. Kept dependency-heavy work out of prerender.ts.
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const font = (f: string) => readFileSync(resolve(__dirname, '../resume/fonts', f))

const FONTS = [
  { name: 'Fraunces', data: font('Fraunces-Bold.ttf'), weight: 700 as const, style: 'normal' as const },
  { name: 'Fraunces', data: font('Fraunces-Regular.ttf'), weight: 400 as const, style: 'normal' as const },
  { name: 'Schibsted Grotesk', data: font('SchibstedGrotesk-Bold.ttf'), weight: 700 as const, style: 'normal' as const },
  { name: 'Schibsted Grotesk', data: font('SchibstedGrotesk-Regular.ttf'), weight: 400 as const, style: 'normal' as const },
  { name: 'Space Mono', data: font('SpaceMono-Regular.ttf'), weight: 400 as const, style: 'normal' as const },
  { name: 'Space Mono', data: font('SpaceMono-Bold.ttf'), weight: 700 as const, style: 'normal' as const },
]

const INK = '#211b14'
const INK_SOFT = '#5a4f41'
const CREAM = '#f4ecd8'
export const TONE_HEX: Record<string, string> = {
  coral: '#f4502a',
  cobalt: '#2d4df5',
  lime: '#c8f02c',
  sun: '#ffc23d',
  pink: '#ff9ece',
}

// tiny hyperscript so we can build the tree without JSX in a .ts script
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const h = (type: string, style: Record<string, unknown>, children?: any): any => ({
  type,
  props: { style, children },
})

const clamp = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s)

export type OgOpts = {
  kicker: string
  title: string
  dek: string
  tone: string
  tags: string[]
}

export async function renderOgCard({ kicker, title, dek, tone, tags }: OgOpts): Promise<Buffer> {
  const accent = TONE_HEX[tone] ?? TONE_HEX.coral
  const titleSize = title.length > 42 ? 56 : title.length > 26 ? 66 : 78

  const card = h(
    'div',
    {
      width: '1200px',
      height: '630px',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: CREAM,
      border: `8px solid ${INK}`,
      boxSizing: 'border-box',
      fontFamily: 'Schibsted Grotesk',
    },
    [
      // tone strip across the top
      h('div', { width: '100%', height: '18px', backgroundColor: accent, display: 'flex' }),
      h(
        'div',
        {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexGrow: 1,
          padding: '58px 70px',
        },
        [
          // upper block: kicker · title · dek
          h('div', { display: 'flex', flexDirection: 'column' }, [
            h('div', { display: 'flex', alignItems: 'center', marginBottom: '30px' }, [
              h('div', {
                width: '30px',
                height: '30px',
                backgroundColor: accent,
                border: `3px solid ${INK}`,
                marginRight: '18px',
                display: 'flex',
              }),
              h(
                'div',
                {
                  fontFamily: 'Space Mono',
                  fontSize: '26px',
                  letterSpacing: '6px',
                  color: INK_SOFT,
                },
                kicker.toUpperCase(),
              ),
            ]),
            h(
              'div',
              {
                fontFamily: 'Fraunces',
                fontWeight: 700,
                fontSize: `${titleSize}px`,
                lineHeight: 1.04,
                letterSpacing: '-1px',
                color: INK,
                maxWidth: '1010px',
              },
              title,
            ),
            h(
              'div',
              {
                fontSize: '30px',
                lineHeight: 1.34,
                color: INK_SOFT,
                marginTop: '26px',
                maxWidth: '980px',
              },
              clamp(dek, 120),
            ),
          ]),
          // lower block: name/site · tags
          h('div', { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }, [
            h('div', { display: 'flex', flexDirection: 'column' }, [
              h(
                'div',
                { fontFamily: 'Fraunces', fontWeight: 700, fontSize: '34px', color: INK },
                'Gabriel Harlan',
              ),
              h(
                'div',
                { fontFamily: 'Space Mono', fontSize: '22px', color: INK_SOFT, marginTop: '6px' },
                'gabrielharlan.is-a.dev',
              ),
            ]),
            h(
              'div',
              { display: 'flex' },
              tags.slice(0, 3).map((t) =>
                h(
                  'div',
                  {
                    fontFamily: 'Space Mono',
                    fontSize: '20px',
                    color: INK,
                    border: `3px solid ${INK}`,
                    borderRadius: '100px',
                    padding: '7px 18px',
                    marginLeft: '12px',
                    display: 'flex',
                  },
                  t,
                ),
              ),
            ),
          ]),
        ],
      ),
    ],
  )

  const svg = await satori(card, { width: 1200, height: 630, fonts: FONTS })
  return Buffer.from(new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng())
}
