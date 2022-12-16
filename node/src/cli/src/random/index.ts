import { getRandomValues, randomUUID, randomBytes} from "crypto";


export { randomUUID, getRandomValues }

const codes: number[] = [];
const validChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';

for (let i = 0; i < validChars.length; i++) {
    codes.push(validChars.codePointAt(i)!);
}



export function randomString(length: number, chars: string = validChars): string {
      // useful for generating as password that can be cleared from memory
    // as strings are immutable in javascript
    const set: Uint8Array = new Uint8Array(12);

    let codec = codes;
    if (chars) {
        codec = [];
        for (let i = 0; i < chars.length; i++) {
            codec.push(chars.codePointAt(i)!);
        }
    }

    set.fill(0);
    const bytes = randomBytes(12);

    for (let i = 0; i < 12; i++) {
        const bit = (Math.abs(bytes[i]) % codes.length);
        set[i] = codes[bit];
    }

    return String.fromCodePoint(...set)
}