export function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

export const SPANISH_DICT: Map<string, string> = new Map([
  ['hola', 'hello'], ['adiós', 'goodbye'], ['adios', 'goodbye'],
  ['gracias', 'thank you'], ['por', 'for/by'], ['favor', 'please'],
  ['si', 'yes'], ['no', 'no'], ['bien', 'well'], ['mal', 'bad'],
  ['buenos', 'good'], ['buenas', 'good'], ['dias', 'days'],
  ['tardes', 'afternoons'], ['noches', 'nights'],
  ['que', 'what/that'], ['qué', 'what'], ['tal', 'how'],
  ['como', 'how/like'], ['cómo', 'how'],
  ['yo', 'I'], ['tu', 'your'], ['tú', 'you'],
  ['el', 'he/the'], ['él', 'he'], ['ella', 'she'],
  ['nosotros', 'we'], ['vosotros', 'you (pl.)'], ['ellos', 'they'],
  ['usted', 'you (formal)'],
  ['soy', 'I am'], ['eres', 'you are'], ['es', 'is'],
  ['somos', 'we are'], ['sois', 'you are (pl.)'], ['son', 'they are'],
  ['estoy', 'I am (temp.)'], ['estas', 'you are (temp.)'],
  ['está', 'is (temp.)'], ['esta', 'is (temp.)'],
  ['estamos', 'we are (temp.)'], ['están', 'they are (temp.)'],
  ['tengo', 'I have'], ['tienes', 'you have'], ['tiene', 'has'],
  ['tenemos', 'we have'], ['tienen', 'they have'],
  ['quiero', 'I want'], ['quieres', 'you want'], ['quiere', 'wants'],
  ['queremos', 'we want'],
  ['puedo', 'I can'], ['puedes', 'you can'], ['puede', 'can'],
  ['podemos', 'we can'],
  ['hablo', 'I speak'], ['hablas', 'you speak'], ['habla', 'speaks'],
  ['hablamos', 'we speak'], ['hablan', 'they speak'],
  ['voy', 'I go'], ['vas', 'you go'], ['va', 'goes'],
  ['vamos', 'we go'], ['van', 'they go'],
  ['necesito', 'I need'], ['necesitas', 'you need'],
  ['agua', 'water'], ['café', 'coffee'], ['cafe', 'coffee'],
  ['leche', 'milk'], ['té', 'tea'], ['te', 'you/tea'],
  ['zumo', 'juice'], ['pan', 'bread'], ['tostada', 'toast'],
  ['churro', 'churro'], ['cerveza', 'beer'], ['vino', 'wine'],
  ['comida', 'food'], ['desayuno', 'breakfast'],
  ['mesa', 'table'], ['cuenta', 'bill'], ['menu', 'menu'],
  ['camarero', 'waiter'], ['restaurante', 'restaurant'],
  ['euro', 'euro'], ['euros', 'euros'],
  ['cuánto', 'how much'], ['cuanto', 'how much'],
  ['cuesta', 'costs'], ['precio', 'price'],
  ['pagar', 'to pay'], ['tarjeta', 'card'], ['efectivo', 'cash'],
  ['dónde', 'where'], ['donde', 'where'],
  ['aquí', 'here'], ['aqui', 'here'],
  ['allí', 'there'], ['alli', 'there'],
  ['cerca', 'near'], ['lejos', 'far'],
  ['derecha', 'right'], ['izquierda', 'left'], ['recto', 'straight'],
  ['calle', 'street'], ['plaza', 'square'],
  ['estación', 'station'], ['estacion', 'station'],
  ['hotel', 'hotel'], ['museo', 'museum'],
  ['familia', 'family'], ['padre', 'father'], ['madre', 'mother'],
  ['hermano', 'brother'], ['hermana', 'sister'],
  ['hijo', 'son'], ['hija', 'daughter'],
  ['grande', 'big'], ['pequeño', 'small'], ['pequeno', 'small'],
  ['bonito', 'pretty'], ['nuevo', 'new'], ['viejo', 'old'],
  ['pero', 'but'], ['porque', 'because'],
  ['también', 'also'], ['tambien', 'also'],
  ['muy', 'very'], ['mucho', 'a lot'], ['poco', 'little'],
  ['algo', 'something'], ['nada', 'nothing'],
  ['siempre', 'always'], ['nunca', 'never'],
  ['con', 'with'], ['de', 'of/from'], ['en', 'in/on'],
  ['para', 'for/to'], ['sobre', 'about/on'],
  ['me', 'me'], ['pone', 'puts/serves'],
  ['llamo', 'I call (myself)'], ['llamas', 'you call (yourself)'],
  ['encanta', 'love(s)'], ['gusta', 'like(s)'], ['interesa', 'interest(s)'],
  ['entiendo', 'I understand'], ['comprendo', 'I understand'],
  ['vale', 'OK'], ['acuerdo', 'agreement'],
  ['perdón', 'sorry'], ['perdon', 'sorry'], ['disculpe', 'excuse me'],
  ['uno', 'one'], ['dos', 'two'], ['tres', 'three'],
  ['cuatro', 'four'], ['cinco', 'five'],
  ['seis', 'six'], ['siete', 'seven'], ['ocho', 'eight'],
  ['nueve', 'nine'], ['diez', 'ten'],
  ['más', 'more'], ['mas', 'more'], ['menos', 'less'],
  ['mejor', 'better'], ['peor', 'worse'],
  ['vengo', 'I come'], ['nombre', 'name'],
  ['mañana', 'tomorrow'], ['manana', 'tomorrow'],
  ['español', 'Spanish'], ['espanol', 'Spanish'],
  ['difícil', 'difficult'], ['dificil', 'difficult'],
  ['fácil', 'easy'], ['facil', 'easy'],
  ['hoy', 'today'], ['ayer', 'yesterday'],
  ['ahora', 'now'], ['después', 'after'], ['despues', 'after'],
  ['antes', 'before'], ['aqui', 'here'],
  ['casa', 'house'], ['trabajo', 'work/job'],
  ['amigo', 'friend'], ['amiga', 'friend (f.)'],
  ['libro', 'book'], ['tiempo', 'time/weather'],
  ['día', 'day'], ['dia', 'day'],
  ['noche', 'night'], ['tarde', 'afternoon'],
  ['hombre', 'man'], ['mujer', 'woman'],
  ['chico', 'boy'], ['chica', 'girl'],
  ['señor', 'sir'], ['señora', 'ma\'am'],
  ['por favor', 'please'], ['lo siento', 'I\'m sorry'],
]);

export function findSpellingError(word: string): { suggestion: string; translation: string } | null {
  const lower = word.toLowerCase().replace(/[^a-záéíóúñü]/g, '');
  if (lower.length < 3) return null;
  if (SPANISH_DICT.has(lower)) return null;

  let bestWord: string | null = null;
  let bestDist = Infinity;

  for (const [candidate] of SPANISH_DICT) {
    if (Math.abs(candidate.length - lower.length) > 2) continue;
    const d = levenshtein(lower, candidate);
    if (d < bestDist) {
      bestDist = d;
      bestWord = candidate;
    }
  }

  if (bestWord && bestDist <= 2 && bestDist > 0) {
    return { suggestion: bestWord, translation: SPANISH_DICT.get(bestWord) || '' };
  }
  return null;
}
