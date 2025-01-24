
let alphabet;
const symbolSets = {
   "animalSet": "🐶|🐕|🐩|🐺|🐱|🐈|🐯|🐅|🐆|🦓|🐴|🦄|🐖|🐷|🐽|🐏|🐑|🐐".split("|"),
   "handHex": "0👐1☝2✌️3🤟4🖖5🖐6☝🤚7✌🤚8🖖🤚9🖐🤚A🤙B👌C🤲D👉E✊F🤞".split(/[0-9A-F]/).filter(Boolean),
   //                  A     B     C     D     E     F     G     H     I     J     K     L     M     N     O     P     Q     R     S     T     U     V     W     X     Y     Z
   "ASLSpellingSet": ["🖐️", "🤚", "✋", "🤟", "👌", "🤞", "👍", "✊", "👈", "👉", "🖖", "🖕", "👋", "🤙", "🤜", "🤛", "✌️", "🤟", "🤘", "🖖", "🖐️", "🤚", "✋", "🤞", "👌", "👍"],
   "basicEmojis": "😭|😂|🥺|🤣|❤️✨|🙏|😍|🥰|😊|😘|😲|🚀|💪|💐|🦋|🤸|🕳️|👤".split('|'),
   "passwordSet": "🐯|🙃|🇨🇭|🏋️|🚀|😇|📸|💪|🙏|🔆|🔇|😍|🤔|🤥|🤩|🌝|🌛|🌜|🌚|🎲|🏁|🎟️|🎫|🚸|😎|🌌|↖️🌈😇|🎨|⚠|📷|💳|🌹|❤️|🧡|💛|💧|⬇️🔥|💚|💙|💜|🤎|🖤|🤍|👍🏻|👍🏼|👍🏽|👍🏾|👍🏿|🦞|🦐|🦑|‍|🐞|🦗|🦟|✳|✴|🤐|😯|🤑|🙁|😖|😟|😦|😧|😨|🤯|😵|🤬|🤒|🤕|🤢|🤮|🥴|🤠|🥵|🥶|😶‍🌫|👹|👺|🤡|😺|😸|😼|😽|🙀|😿|😾|🧐|🤓|🥱|😶‍🌫️|🕳️|👁️‍🗨️|🗨️|🗯️|💭|💤|🤳|🦵|🦿|🦶|🦻|🧠|🫀|🫁|🦷|🫦|🩸|🩹|🩺|🩼|🩻|🧑‍🦽|🧑‍🦼|🙋‍♂️|🙋‍♀️".split('|'),
   "mathSymbols": ["∇", "∅", "∞", "∩", "∪", "∫", "∑", "⊕", "⊗", "⊥","∺"],
   "foodIcons": "🥥|🥕|🥔|🥒|🌶️|🥬|🧄|🧅|🍠|🍯|🥖|🍚|🍜|🍟|🍳|🍦|🍰|🍬|🍮|🍹|🥃|🥤|🥦|🥨|🥯|🥐|🍧|🍗|🍖|🥟|🍘|🍥|🥘|🍲|🥣|🍽️|🥄|🍵|🍶|🥂|🥜|🥚|🥙|🧆|🍢|🍡|🍤|🍛|🥩|🥓|🥫".split('|'),
   "countryFlags": "🇦🇨|🇦🇩|🇦🇪|🇦🇫|🇦🇬|🇦🇮|🇦🇱|🇦🇲|🇦🇴|🇦🇶|🇦🇷|🇦🇸|🇦🇹|🇦🇺|🇦🇼|🇦🇽|🇦🇿|🇧🇦|🇧🇧|🇧🇩|🇧🇪|🇧🇫|🇧🇬|🇧🇭|🇧🇮|🇧🇯|🇧🇱|🇧🇲|🇧🇳|🇧🇴|🇧🇶|🇧🇷|🇧🇸|🇧🇹|🇧🇻|🇧🇼|🇧🇾|🇧🇿|🇨🇦|🇨🇨|🇨🇩|🇨🇫|🇨🇬|🇨🇭|🇨🇮|🇨🇰|🇨🇱|🇨🇲|🇨🇳|🇨🇴|🇨🇵|🇨🇷|🇨🇺|🇨🇻|🇨🇼|🇨🇽|🇨🇾|🇨🇿|🇩🇪|🇩🇬|🇩🇯|🇩🇰|🇩🇲|🇩🇴|🇩🇿|🇪🇦|🇪🇨|🇪🇪|🇪🇬|🇪🇭|🇪🇷|🇪🇸|🇪🇹|🇪🇺|🇫🇮|🇫🇯|🇫🇰|🇫🇲|🇫🇴|🇫🇷|🇬🇦|🇬🇧|🇬🇩|🇬🇪|🇬🇫|🇬🇬|🇬🇭|🇬🇮|🇬🇱|🇬🇲|🇬🇳|🇬🇵|🇬🇶|🇬🇷|🇬🇸|🇬🇹|🇬🇺|🇬🇼|🇬🇾|🇭🇰|🇭🇲|🇭🇳|🇭🇷|🇭🇹|🇭🇺|🇮🇨|🇮🇩|🇮🇪|🇮🇱|🇮🇲|🇮🇳|🇮🇴|🇮🇶|🇮🇷|🇮🇸|🇮🇹|🇯🇪|🇯🇲|🇯🇴|🇯🇵|🇰🇪|🇰🇬|🇰🇭|🇰🇮|🇰🇲|🇰🇳|🇰🇵|🇰🇷|🇰🇼|🇰🇾|🇰🇿|🇱🇦|🇱🇧|🇱🇨|🇱🇮|🇱🇰|🇱🇷|🇱🇸|🇱🇹|🇱🇺|🇱🇻|🇱🇾|🇲🇦|🇲🇨|🇲🇩|🇲🇪|🇲🇫|🇲🇬|🇲🇭|🇲🇰|🇲🇱|🇲🇲|🇲🇳|🇲🇴|🇲🇵|🇲🇶|🇲🇷|🇲🇸|🇲🇹|🇲🇺|🇲🇻|🇲🇼|🇲🇽|🇲🇾|🇲🇿|🇳🇦|🇳🇨|🇳🇪|🇳🇫|🇳🇬|🇳🇮|🇳🇱|🇳🇴|🇳🇵|🇳🇷|🇳🇺|🇳🇿|🇴🇲|🇵🇦|🇵🇪|🇵🇫|🇵🇬|🇵🇭|🇵🇰|🇵🇱|🇵🇲|🇵🇳|🇵🇷|🇵🇸|🇵🇹|🇵🇼|🇵🇾|🇶🇦|🇷🇪|🇷🇴|🇷🇸|🇷🇺|🇷🇼|🇸🇦|🇸🇧|🇸🇨|🇸🇩|🇸🇪|🇸🇬|🇸🇭|🇸🇮|🇸🇯|🇸🇰|🇸🇱|🇸🇲|🇸🇳|🇸🇴|🇸🇷|🇸🇸|🇸🇹|🇸🇻|🇸🇽|🇸🇾|🇸🇿|🇹🇦|🇹🇨|🇹🇩|🇹🇫|🇹🇬|🇹🇭|🇹🇯|🇹🇰|🇹🇱|🇹🇲|🇹🇳|🇹🇴|🇹🇷|🇹🇹|🇹🇻|🇹🇼|🇹🇿|🇺🇦|🇺🇬|🇺🇲|🇺🇳|🇺🇸|🇺🇾|🇺🇿|🇻🇦|🇻🇨|🇻🇪|🇻🇬|🇻🇮|🇻🇳|🇻🇺|🇼🇫|🇼🇸|🇽🇰|🇾🇪|🇾🇹|🇿🇦|🇿🇲|🇿🇼|🏳".split('|'),
   "countryLetters": [
      "🇦 ", "🇧 ", "🇨 ", "🇩 ", "🇪 ", "🇫 ", "🇬 ", "🇭 ", "🇮 ", "🇯 ",
      "🇰 ", "🇱 ", "🇲 ", "🇳 ", "🇴 ", "🇵 ", "🇶 ", "🇷 ", "🇸 ", "🇹 ",
      "🇺 ", "🇻 ", "🇼 ", "🇽 ", "🇾 ", "🇿 ", "🏳️ <200d>⭐"
   ],
   "braille": "⠁⠃⠉⠙⠑⠋⠛⠓⠊⠚⠅⠇⠍⠝⠕⠏⠟⠗⠎⠞⠥⠧⠺⠭⠽⠵".split('')
};

const combinedSets = Object.values(symbolSets).flat().map(char => char.normalize('NFC'));

// Use a Map to count occurrences of each character
const charCount = combinedSets.reduce((map, char) => {
    map.set(char, (map.get(char) || 0) + 1);
    return map;
}, new Map());

// Filter characters that appear more than once
const duplicates = [...charCount].filter(([char, count]) => count > 1).map(([char]) => char);

console.debug({ combinedSets });
console.debug({ duplicates });

const uniquifySets = [...new Set(combinedSets)];
console.debug({uniquifySets});

// Call the function to compute and apply the release tag
document.addEventListener('DOMContentLoaded', async function() {

    alphabet = await getRandomUniqueAlphabet('this is an unsecure seed', 128); // /!\ unsecured
    console.debug({alphabet});

    const aritySpan = document.getElementById('arity');
    if (aritySpan) {
        aritySpan.textContent = `${alphabet.length} symbols`;
    }
});







export function mojiString(hashBuffer,length = 5, charset = alphabet) {
   const bytes = new Uint8Array(hashBuffer);
   let value = bytes.reduce((acc, byte) => (acc << BigInt(8)) | BigInt(byte), BigInt(0));
   const base = BigInt(charset.length);

   let result = [];
   while (value > 0n && result.length < length) {
      const index = Number(value % base);
      result.push(charset[index]);
      value /= BigInt(base);
   }

   return result.join('');
}

export async function getRandomUniqueAlphabet (seed, n, alphabets = combinedSets) {

    const random = await (async (seed) => {
        if (window.crypto && window.crypto.subtle) {
            const encoder = new TextEncoder();
            const key = await crypto.subtle.importKey(
                "raw",
                encoder.encode(seed),
                { name: "HMAC", hash: "SHA-256" },
                false,
                ["sign"]
            );

            let counter = 0;
            return async () => {
                const counterBytes = new Uint8Array(4);
                new DataView(counterBytes.buffer).setUint32(0, counter++, false);

                const hash = await crypto.subtle.sign("HMAC", key, counterBytes);
                const hashArray = new Uint8Array(hash);

                let randomValue = 0;
                for (let i = 0; i < 4; i++) {
                    randomValue = (randomValue * 256 + hashArray[i]) / 4294967296;
                }

                return randomValue;
            };
        } else {
            console.warn("crypto.subtle not available; falling back to non-cryptographic seeded random generator.");

            return ((seed) => {
                let value = seed;
                return () => {
                    value = (value * 9301 + 49297) % 233280;
                    return value / 233280;
                };
            })(seed.charCodeAt(0));
        }
    })(seed);
    console.log({random});

    const asyncRandom = typeof random === 'function' && random.constructor.name === 'AsyncFunction';

    const shuffledAlphabets = await Promise.all(
        combinedSets.map(async (value) => ({
            value,
            sort: asyncRandom ? await random() : random()
        }))
    );
    shuffledAlphabets.sort((a, b) => a.sort - b.sort);
    console.log({shuffledAlphabets});

    const uniqueCharacters = [...new Set(shuffledAlphabets.map(({ value }) => value))];

    if (uniqueCharacters.length < n) {
        throw new Error(`Not enough unique characters available for the requested count: ${n}.`);
    }

    return uniqueCharacters.slice(0, n);
}


