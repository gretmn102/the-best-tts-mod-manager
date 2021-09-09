import * as TtsSaveFile from './tts_save_file'
import { tuple } from 'fp-ts/lib/function'

// TODO: move into `Array` class
function arraysEqual<T>(a:T [], b:T []) {
  if (a === b) return true
  if (a == null || b == null) return false
  if (a.length !== b.length) return false

  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false
  }
  return true
}

function arraysDistinct<T>(myArray:T []) {
  return myArray.filter((v, i, a) => a.indexOf(v) === i)
}

describe('save parser', () => {
  jest.setTimeout(30 * 1000)
  it('should parse all urls', done => {
    TtsSaveFile.parseSave(
      tuple(<TtsSaveFile.Result[] []>[], 0),
      ([state, count], x) => {
        state.push(x)
        return [x, tuple(state, count + 1)]
      },
    )('./src/main/main/save_mocks/0000000.json')
      .then(([state, [extractedUrls2, count]]) => {
        expect(count).toEqual(973)

        try {
          const exp = [
            'http://example.com/0',
            'https://example.com/1',
            'https://example.com/2',
            'https://example.com/3',
            'http://example.com/4',
            'http://example.com/5',
            'http://example.com/6',
            'https://example.com/7',
            'https://example.com/8',
            'https://example.com/9',
            'https://example.com/10',
            'https://example.com/11',
            'https://example.com/12',
            'https://example.com/13',
            'https://example.com/14',
            'https://example.com/15',
            'https://example.com/16',
            'https://example.com/17',
            'https://example.com/18',
            'https://example.com/19',
            'https://example.com/20',
            'https://example.com/21',
            'https://example.com/22',
            'http://example.com/23',
            'http://example.com/24',
            'https://example.com/25',
            'http://example.com/26',
            'http://example.com/27',
            'http://example.com/28',
            'https://example.com/29',
            'https://example.com/30',
            'https://example.com/31',
            'https://example.com/32',
            'http://example.com/33',
            'http://example.com/34',
            'https://example.com/35',
            'https://example.com/36',
            'https://example.com/37',
            'https://example.com/38',
            'https://example.com/39',
            'https://example.com/40',
            'https://example.com/41',
            'https://example.com/42',
            'https://example.com/43',
            'https://example.com/44',
            'https://example.com/45',
            'https://example.com/46',
            'https://example.com/47',
            'https://example.com/48',
            'https://example.com/49',
            'https://example.com/50',
            'https://example.com/51',
            'https://example.com/52',
            'https://example.com/53',
            'https://example.com/54',
            'https://example.com/55',
            'https://example.com/56',
            'https://example.com/57',
            'https://example.com/58',
            'https://example.com/59',
            'https://example.com/60',
            'https://example.com/61',
            'https://example.com/62',
            'https://example.com/63',
            'https://example.com/64',
            'https://example.com/65',
            'https://example.com/66',
            'https://example.com/67',
            'https://example.com/68',
            'https://example.com/69',
            'https://example.com/70',
            'https://example.com/71',
            'https://example.com/72',
            'https://example.com/73',
            'https://example.com/74',
            'https://example.com/75',
            'https://example.com/76',
            'https://example.com/77',
            'http://example.com/78',
            'http://example.com/79',
            'http://example.com/80',
            'http://example.com/81',
            'http://example.com/82',
            'http://example.com/83',
            'http://example.com/84',
            'http://example.com/85',
            'http://example.com/86',
            'http://example.com/87',
            'http://example.com/88',
            'http://example.com/89',
            'http://example.com/90',
            'http://example.com/91',
            'http://example.com/92',
            'http://example.com/93',
            'http://example.com/94',
            'http://example.com/95',
            'http://example.com/96',
            'http://example.com/97',
            'http://example.com/98',
            'http://example.com/99',
            'http://example.com/100',
            'http://example.com/101',
            'http://example.com/102',
            'http://example.com/103',
            'http://example.com/104',
            'http://example.com/105',
            'http://example.com/106',
            'http://example.com/107',
            'http://example.com/108',
            'http://example.com/109',
            'http://example.com/110',
            'http://example.com/111',
            'http://example.com/112',
            'http://example.com/113',
            'http://example.com/114',
            'http://example.com/115',
            'https://example.com/116',
            'https://example.com/117',
            'https://example.com/118',
            'https://example.com/119',
            'https://example.com/120',
            'https://example.com/121',
            'https://example.com/122',
            'https://example.com/123',
            'https://example.com/124',
            'https://example.com/125',
            'https://example.com/126',
            'https://example.com/127',
            'https://example.com/128',
            'https://example.com/129',
            'https://example.com/130',
            'https://example.com/131',
            'https://example.com/132',
            'https://example.com/133',
            'https://example.com/134',
            'https://example.com/135',
            'https://example.com/136',
            'https://example.com/137',
            'https://example.com/138',
            'https://example.com/139',
            'https://example.com/140',
            'http://example.com/141',
            'https://example.com/142',
          ]

          const act = extractedUrls2.flat().map(x => x.url)

          // console.log(`'${act.join(',\n')}'`)

          expect(new Set(act)).toEqual(new Set(exp))
          done()
        } catch (error) {
          done(error)
        }
      })
      .catch(e => { done(e) })
  })
  it('change urls', done => {
    // TODO
    // const actPath = './src/main/main/save_mocks/0000001.json'
    // await fs.promises.writeFile(actPath, JSON.stringify(state, undefined, 2))
    done()
  })
})

describe('extractMultilanguageUrls', () => {
  it('not contains languages', () => {
    const input = 'http://example.com'
    const exp = [
      { lang: TtsSaveFile.defaultLang, url: input },
    ]
    expect(TtsSaveFile.extractMultilanguageUrls(input)).toEqual(exp)
  })
  it('contains languages', () => {
    const input = '{en}http://example.com {ru}http://example.org {fr} http://example.111 {1111} http://example.2222  '
    const exp = [
      { lang: 'en', url: 'http://example.com' },
      { lang: 'ru', url: 'http://example.org' },
      { lang: 'fr', url: 'http://example.111' },
      { lang: '1111', url: 'http://example.2222' },
    ]
    expect(TtsSaveFile.extractMultilanguageUrls(input)).toEqual(exp)
  })
})
