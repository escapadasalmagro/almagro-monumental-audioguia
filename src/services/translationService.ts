import { LanguageCode, Monument } from '../types';

// In-Memory & Session Storage Cache for Translations
const inMemoryCache = new Map<string, string>();
const SESSION_CACHE_PREFIX = 'almagro_translation_';

/**
 * Generate a deterministic cache key for text + targetLanguage
 */
function getCacheKey(text: string, targetLanguage: LanguageCode): string {
  // Simple hash for short string key
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `${targetLanguage}_${hash}_${text.substring(0, 16).replace(/\s+/g, '_')}`;
}

/**
 * Retrieve translation from memory or session storage
 */
export function getCachedTranslation(
  text: string,
  targetLanguage: LanguageCode
): string | null {
  if (targetLanguage === 'es') return text;

  const key = getCacheKey(text, targetLanguage);
  if (inMemoryCache.has(key)) {
    return inMemoryCache.get(key)!;
  }

  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const stored = window.sessionStorage.getItem(SESSION_CACHE_PREFIX + key);
      if (stored) {
        inMemoryCache.set(key, stored);
        return stored;
      }
    } catch {
      // Ignore sessionStorage issues
    }
  }

  return null;
}

/**
 * Save translation to memory and session storage
 */
export function setCachedTranslation(
  text: string,
  targetLanguage: LanguageCode,
  translatedText: string
): void {
  if (targetLanguage === 'es' || !translatedText) return;

  const key = getCacheKey(text, targetLanguage);
  inMemoryCache.set(key, translatedText);

  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      window.sessionStorage.setItem(SESSION_CACHE_PREFIX + key, translatedText);
    } catch {
      // Ignore sessionStorage quota limits
    }
  }
}

/**
 * High-quality verified dictionary for tourist heritage content
 * Used by the translation engine to provide immediate, natural translations
 */
const HERITAGE_TRANSLATIONS_MAP: Record<string, Partial<Record<LanguageCode, string>>> = {
  // Corral de Comedias
  'El único corral de comedias del Siglo de Oro conservado intacto.': {
    en: 'The only Golden Age theatrical courtyard preserved intact.',
    fr: 'L’unique corral de comédies du Siècle d’Or conservé intact.',
    it: 'L’unico teatro all’aperto del Secolo d’Oro conservato intatto.',
    de: 'Der einzige intakt erhaltene Theaterhof des Goldenen Zeitalters.',
    zh: '西班牙黄金时代唯一完整保存至今的古剧场。',
  },
  'El Corral de Comedias de Almagro es un teatro histórico del siglo XVII, el único que se conserva íntegro de esa época. Declarado Monumento Nacional, sigue acogiendo representaciones teatrales, especialmente durante el Festival Internacional de Teatro Clásico de Almagro.': {
    en: 'The Corral de Comedias of Almagro is a historic 17th-century theater, the only one preserved intact from that era. Declared a National Monument, it continues to host theatrical performances, especially during the International Classical Theatre Festival of Almagro.',
    fr: 'Le Corral de Comedias d’Almagro est un théâtre historique du XVIIe siècle, le seul conservé intact de cette époque. Déclaré Monument National, il continue d’accueillir des représentations théâtrales, en particulier lors du Festival International de Théâtre Classique d’Almagro.',
    it: 'Il Corral de Comedias di Almagro è un teatro storico del XVII secolo, l’unico conservato integro di quell’epoca. Dichiarato Monumento Nazionale, continua a ospitare spettacoli teatrali, specialmente durante il Festival Internazionale del Teatro Classico di Almagro.',
    de: 'Das Corral de Comedias von Almagro ist ein historisches Theater aus dem 17. Jahrhundert und das einzige, das aus dieser Epoche vollständig erhalten ist. Als Nationaldenkmal deklariert, finden hier weiterhin Theateraufführungen statt, insbesondere während des Internationalen Festivals für klassisches Theater in Almagro.',
    zh: '阿尔马格罗露天剧院是一座建于17世纪的历史剧场，是全球唯一一座完好保存了该时代风貌的剧场。被评定为国家级纪念建筑，至今仍举办各类戏剧演出，尤其是享誉世界的阿尔马格罗国际古典戏剧节。',
  },

  // Iglesia de San Agustín
  'Antiguo convento agustino con una impresionante arquitectura barroca.': {
    en: 'Former Augustinian convent featuring impressive baroque architecture.',
    fr: 'Ancien couvent augustin à l’architecture baroque remarquable.',
    it: 'Antico convento agostiniano con un’impressionante architettura barocca.',
    de: 'Ehemaliges Augustinerkloster mit beeindruckender Barockarchitektur.',
    zh: '拥有令人赞叹的巴洛克建筑风格的前奥古斯丁修道院。',
  },
  'La Iglesia de San Agustín, de estilo barroco con influencias clasicistas, fue parte del antiguo convento de los Agustinos. Destaca por su imponente fachada y su retablo mayor. Actualmente, alberga eventos culturales y exposiciones.': {
    en: 'The Church of San Agustín, built in baroque style with classicist influences, was part of the ancient Augustinian convent. Notable for its imposing facade and high altarpiece, it currently hosts cultural events and exhibitions.',
    fr: 'L’Église de Saint-Augustin, de style baroque aux influences classicistes, faisait partie de l’ancien couvent des Augustins. Elle se distingue par sa façade imposante et son retable majeur. Elle accueille aujourd’hui des événements culturels et des expositions.',
    it: 'La Chiesa di Sant’Agostino, in stile barocco con influenze classiciste, faceva parte dell’antico convento degli Agostiniani. Si distingue per l’imponente facciata e la pala d’altare maggiore. Oggi ospita eventi culturali ed esposizioni.',
    de: 'Die Kirche San Agustín im Barockstil mit klassizistischen Einflüssen war Teil des ehemaligen Augustinerklosters. Sie besticht durch ihre imposante Fassade und ihren Hauptaltar. Heute finden hier Kulturveranstaltungen und Ausstellungen statt.',
    zh: '圣奥古斯丁教堂兼具巴洛克与古典主义风格，原为古奥古斯丁修道院的一部分。其宏伟的正立面与主祭坛画尤为瞩目。如今这里用于举办各类文化活动与艺术展览。',
  },

  // Claustro del Convento de la Asunción
  'Uno de los grandes ejemplos del Renacimiento en Almagro.': {
    en: 'One of the finest examples of the Renaissance in Almagro.',
    fr: 'L’un des grands exemples de la Renaissance à Almagro.',
    it: 'Uno dei più insigni esempi del Rinascimento ad Almagro.',
    de: 'Eines der bedeutendsten Beispiele der Renaissance in Almagro.',
    zh: '阿尔马格罗文艺复兴建筑的杰出典范。',
  },
  'El Claustro del Convento de la Asunción de Calatrava es una joya del Renacimiento español. Formaba parte de un importante convento fundado por la Orden de Calatrava. Sus dos plantas de galerías con arcos de medio punto sobre columnas de mármol son de gran belleza.': {
    en: 'The Cloister of the Convent of the Assumption of Calatrava is a masterpiece of the Spanish Renaissance. It formed part of an influential convent founded by the Order of Calatrava. Its two tiers of galleries featuring semicircular arches over marble columns display exceptional grace.',
    fr: 'Le Cloître du Couvent de l’Assomption de Calatrava est un joyau de la Renaissance espagnole. Il faisait partie d’un couvent majeur fondé par l’Ordre de Calatrava. Ses deux étages de galeries aux arcs en plein cintre reposant sur des colonnes de marbre sont d’une grande beauté.',
    it: 'Il Chiostro del Convento dell’Assunzione di Calatrava è un capolavoro del Rinascimento spagnolo. Faceva parte di un importante monastero fondato dall’Ordine di Calatrava. I suoi due livelli di loggiati con archi a tutto sesto su colonne di marmo sono di mirabile armonia.',
    de: 'Der Kreuzgang des Klosters La Asunción de Calatrava ist ein Juwel der spanischen Renaissance. Er gehörte zu einem bedeutenden Konvent des Calatrava-Ordens. Seine zweistöckigen Galerien mit Rundbögen auf Marmorsäulen zeichnen sich durch außergewöhnliche Schönheit aus.',
    zh: '卡拉特拉瓦圣母升天修道院回廊是西班牙文艺复兴时期的艺术明珠，曾隶属于卡拉特拉瓦骑士团创立的重要修道院。其双层拱廊由大理石立柱与半圆拱券构成，格外优雅庄严。',
  },

  // Palacio de Juan de Jedler
  'Antiguo Palacio de los Fúcares': {
    en: 'Former Fugger Palace (Palacio de los Fúcares)',
    fr: 'Ancien Palais des Fúcares',
    it: 'Antico Palazzo dei Fúcares',
    de: 'Ehemaliger Fugger-Palast (Palacio de los Fúcares)',
    zh: '原福格尔宫 (Antiguo Palacio de los Fúcares)',
  },
  'Un destacado ejemplo de arquitectura civil almagreña del siglo XVI.': {
    en: 'A distinguished example of 16th-century civil architecture in Almagro.',
    fr: 'Un exemple remarquable d’architecture civile du XVIe siècle à Almagro.',
    it: 'Un insigne esempio di architettura civile del XVI secolo ad Almagro.',
    de: 'Ein herausragendes Beispiel bürgerlicher Architektur des 16. Jahrhunderts in Almagro.',
    zh: '16世纪阿尔马格罗市民建筑的杰出代表。',
  },
  'La Casa Palacio de los Jedler, conocida también como Palacio de los Fúcares, es un notable ejemplo de la arquitectura civil del siglo XVI, construida por una familia de banqueros alemanes. Presenta una fachada sobria y un patio interior con elementos góticos y renacentistas.': {
    en: 'The Jedler Palace House, also historically known as the Fugger Palace (Palacio de los Fúcares), is a prominent example of 16th-century civil architecture, commissioned by a family of German bankers. It features a sober brick facade and an inner courtyard blending Gothic and Renaissance details.',
    fr: 'Le Palais des Jedler, également connu sous le nom de Palais des Fúcares, est un exemple majeur de l’architecture civile du XVIe siècle, édifié par une famille de banquiers allemands. Il présente une façade sobre et un patio intérieur orné d’éléments gothiques et renaissance.',
    it: 'Il Palazzo dei Jedler, noto anche come Palazzo dei Fúcares, è un notevole esempio di architettura civile del XVI secolo, edificato da una dinastia di banchieri tedeschi. Presenta una facciata sobria e un cortile interno con elementi gotici e rinascimentali.',
    de: 'Das Palais Juan de Jedler, auch als Fugger-Palast bekannt, ist ein bemerkenswertes Beispiel für die Zivilarchitektur des 16. Jahrhunderts, erbaut von der Augsburger Bankiersfamilie. Es verfügt über eine schlichte Fassade und einen Innenhof mit gotischen und Renaissance-Elementen.',
    zh: '耶德勒宫殿（又称福格尔宫）是16世纪民间建筑的卓越代表，由德国富商银行家家族出资建造。建筑外观朴素典雅，内部庭院完美融合了哥特式与文艺复兴时期的装饰元素。',
  },

  // Teatro Municipal
  'Elegante teatro del siglo XIX situado en el centro histórico de Almagro.': {
    en: 'An elegant 19th-century theatre located in the historic center of Almagro.',
    fr: 'Élégant théâtre du XIXe siècle situé dans le centre historique d’Almagro.',
    it: 'Elegante teatro del XIX secolo situato nel centro storico di Almagro.',
    de: 'Elegantes Theater aus dem 19. Jahrhundert im historischen Zentrum von Almagro.',
    zh: '位于阿尔马格罗历史中心的典雅19世纪剧院。',
  },
  'El Teatro Municipal de Almagro, construido en el siglo XIX, es un elegante espacio escénico que complementa la oferta teatral de la ciudad. Con una arquitectura típica de los teatros de la época, acoge diversas representaciones y eventos culturales a lo largo del año.': {
    en: 'The Municipal Theatre of Almagro, built in the 19th century, is an elegant stage venue enriching the city’s rich theatrical heritage. Designed in the traditional Italian neoclassical theater style, it hosts plays and cultural performances throughout the year.',
    fr: 'Le Théâtre Municipal d’Almagro, édifié au XIXe siècle, est un élégant espace scénique complétant l’offre théâtrale de la ville. D’une architecture représentative des théâtres de l’époque, il accueille diverses représentations et événements culturels toute l’année.',
    it: 'Il Teatro Municipale di Almagro, edificato nel XIX secolo, è un elegante spazio scenico che arricchisce la tradizione teatrale della città. Con la caratteristica architettura dei teatri all’italiana dell’epoca, ospita spettacoli ed eventi culturali durante tutto l’anno.',
    de: 'Das Stadttheater von Almagro aus dem 19. Jahrhundert ist eine elegante Bühne, die das Theaterangebot der Stadt bereichert. Mit typischer Theaterarchitektur der Epoche finden hier das ganze Jahr über vielfältige Aufführungen und Kulturveranstaltungen statt.',
    zh: '阿尔马格罗市立剧院建于19世纪，是一座典雅的艺术表演殿堂，丰富了这座戏剧之城的文化底蕴。剧院采用典型的时代剧场建筑格局，全年承办各类话剧与文化艺术盛会。',
  },

  // Museo del Encaje y la Blonda
  'Un espacio dedicado a una de las tradiciones artesanales más características de Almagro.': {
    en: 'A space dedicated to one of the most signature artisan traditions of Almagro.',
    fr: 'Un espace dédié à l’une des traditions artisanales les plus emblématiques d’Almagro.',
    it: 'Uno spazio dedicato a una delle tradizioni artigianali più identitarie di Almagro.',
    de: 'Ein Raum, der einer der charakteristischsten Handwerkstraditionen Almagros gewidmet ist.',
    zh: '展示阿尔马格罗最具代表性的传统手工蕾丝艺术空间。',
  },
  'Un museo dedicado a la tradición del encaje y blonda, mostrando técnicas artesanales y piezas históricas. Almagro es famoso por su encaje de bolillos, y este museo preserva y exhibe esta importante herencia cultural y artesanal.': {
    en: 'A museum dedicated to the heritage of bobbin lace and blonde lace, showcasing master craftsmanship and historic pieces. Almagro is world-renowned for its bobbin lace craft, and this museum preserves and exhibits this precious artisan legacy.',
    fr: 'Un musée dédié à la tradition de la dentelle aux fuseaux et de la blonde, présentant techniques artisanales et chefs-d’œuvre historiques. Almagro est réputée pour sa dentelle, et ce musée préserve et expose cet héritage culturel majeur.',
    it: 'Un museo dedicato alla secolare tradizione del merletto a tombolo e della blonda, che illustra tecniche artigianali e pezzi storici. Almagro è celebre per i suoi merletti, e questa istituzione tutela ed espone questa straordinaria eredità artigiana.',
    de: 'Ein Museum, das der Tradition der Klöppelspitze und der Blonden gewidmet ist und Handwerkstechniken sowie historische Stücke zeigt. Almagro ist berühmt für seine Klöppelspitzen, und dieses Museum bewahrt und präsentiert dieses wertvolle Kulturerbe.',
    zh: '该博物馆专门致力于展示传统梭织蕾丝与金银丝蕾丝（Blonda）的精湛手艺，陈列着众多历史珍品与织造工具。阿尔马格罗以棒槌蕾丝闻名遐迩，本馆致力于守护与弘扬这一珍贵的文化手工艺遗产。',
  },
};

/**
 * PRIMARY DECOUPLED TRANSLATION FUNCTION
 * 
 * Translates arbitrary text from Spanish into targetLanguage.
 * First consults in-session cache. If not cached, performs translation
 * and stores in cache.
 * 
 * In production backend integration, this function calls a secure server endpoint
 * (e.g. `POST /api/translate`) without exposing secrets on the client side.
 */
export async function translateText(
  text: string,
  targetLanguage: LanguageCode
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || targetLanguage === 'es') {
    return text;
  }

  // 1. Check in-session cache
  const cached = getCachedTranslation(trimmed, targetLanguage);
  if (cached) {
    return cached;
  }

  // 2. Simulate realistic asynchronous network / API translation latency (300-500ms)
  await new Promise((resolve) => setTimeout(resolve, 380));

  /*
   * ARCHITECTURE HOOK FOR SECURE BACKEND TRANSLATION SERVICE:
   * 
   * try {
   *   const res = await fetch('/api/translate', {
   *     method: 'POST',
   *     headers: { 'Content-Type': 'application/json' },
   *     body: JSON.stringify({ text: trimmed, sourceLang: 'es', targetLang: targetLanguage }),
   *   });
   *   if (!res.ok) throw new Error('API translation failed');
   *   const data = await res.json();
   *   setCachedTranslation(trimmed, targetLanguage, data.translatedText);
   *   return data.translatedText;
   * } catch (error) { ... }
   */

  // 3. Consult domain dictionary fallback
  const mapped = HERITAGE_TRANSLATIONS_MAP[trimmed]?.[targetLanguage];
  if (mapped) {
    setCachedTranslation(trimmed, targetLanguage, mapped);
    return mapped;
  }

  // 4. If text is not in dictionary and no backend yet, return original Spanish
  return text;
}

export interface TranslatedMonumentContent {
  title: string;
  subtitle?: string;
  shortDescription: string;
  introductoryText: string;
}

/**
 * Translates all informative fields of a monument from its single Spanish source
 */
export async function translateMonument(
  monument: Monument,
  targetLanguage: LanguageCode
): Promise<TranslatedMonumentContent> {
  // If target is Spanish, return the original immediately with zero latency
  if (targetLanguage === 'es') {
    return {
      title: monument.originalText.title,
      subtitle: monument.originalText.subtitle,
      shortDescription: monument.originalText.shortDescription,
      introductoryText: monument.originalText.introductoryText,
    };
  }

  // Translate informative content in parallel
  const [translatedSubtitle, translatedIntro, translatedShort] = await Promise.all([
    monument.originalText.subtitle
      ? translateText(monument.originalText.subtitle, targetLanguage)
      : Promise.resolve(undefined),
    translateText(monument.originalText.introductoryText, targetLanguage),
    translateText(monument.originalText.shortDescription, targetLanguage),
  ]);

  // Keep official Spanish name for monument denomination
  const title = monument.originalText.title;

  return {
    title,
    subtitle: translatedSubtitle,
    shortDescription: translatedShort,
    introductoryText: translatedIntro,
  };
}
