const matching =
  (regex: RegExp) =>
  (string: string): string[] =>
    string.match(regex) || []

// ENTRIES, ARRAY, OBJECT
const entriesArrayToObject = (arrayEntries: string[][]): object =>
  Object.fromEntries(arrayEntries)

const stringToEntries =
  (regex: RegExp | string | '=') => (string: string | 'a=10') => {
    const [key, value] = string.split(regex)
    return [key, value.trim()]
  }

const unlessOneElement = (array: any[], arg: string) =>
  [...array].some((item) => item === arg)

const mapGeneric = (cb: CallableFunction) => (array: any[]) =>
  [...array].map((item) => cb(item))

const splitString = (splitter: RegExp | string) => (text: string) =>
  text.split(splitter)
// MATH
const minus = (a: number, b: number) => a - b

export default {
  matching,
  entriesArrayToObject,
  stringToEntries,
  unlessOneElement,
  mapGeneric,
  splitString,
  minus
}
