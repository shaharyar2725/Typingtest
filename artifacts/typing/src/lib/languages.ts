export type LangDir = 'ltr' | 'rtl';

export interface LanguageMeta {
  code: string;
  name: string;
  flag: string;
  dir: LangDir;
  fontStack?: string;
}

export const LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'pt', name: 'Português', flag: '🇵🇹', dir: 'ltr' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl', fontStack: '"Noto Naskh Arabic", "Amiri", serif' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰', dir: 'rtl', fontStack: '"Noto Nastaliq Urdu", "Jameel Noori Nastaleeq", serif' },
];

export const LANGUAGE_BY_CODE: Record<string, LanguageMeta> = Object.fromEntries(
  LANGUAGES.map(l => [l.code, l])
);

// ~120 most-common words per language. Curated for common-typing-test feel.
export const WORD_LISTS: Record<string, string[]> = {
  en: ('the of and to in a is that for it as was with on be by at this not from but have or had they which one you were her all she there when an who would their will what so up if no out about my can only said other than its time some could into them then two more these very our may any new like first do these its our well such most over only its also'.split(' ')),

  es: ('el la de que y a en un ser se no haber por con su para como estar tener le lo todo pero más hacer poder decir este ir otro ese si me ya ver porque dar cuando él muy sin vez mucho saber qué sobre mi alguno mismo yo también hasta año dos querer entre así primero desde grande eso ni nos llegar pasar tiempo ella sí día uno bien poco deber entonces poner cosa tanto hombre parecer nuestro tan donde ahora parte después vida quedar siempre creer hablar llevar dejar nada cada seguir menos nuevo encontrar algo solo pensar tres conocer mientras gran país problema mano lugar caso forma cuenta hijo punto mundo trabajo niño durante mejor agua momento llamar contar volver poco usar fin'.split(' ')),

  fr: ('le de un à être et en avoir que pour dans ce il qui ne sur se pas plus pouvoir par je avec tout faire son mettre autre on mais nous comme ou si leur y dire elle devoir avant deux même prendre aussi celui donner bien où fois vous encore nouveau aller cela sans voir grand ils sa ainsi venir contre temps trop dont du au les des une cette ces son ses notre votre ces tout tous tu ton ta tes mon ma mes vie jour homme monde main vouloir savoir trouver enfant moment chose femme année après très peu chez face état ici mer cas elle quand bon tant rien petit'.split(' ')),

  de: ('der die und in den von zu das mit sich des auf für ist im dem nicht ein eine als auch es an werden aus er hat dass sie nach bei einer um am sind noch wie einem über einen so zum war haben nur oder aber vor zur bis mehr durch man sein wurde sei in einem zwischen wird sehr immer kann jedoch dass sondern sie sie nun jetzt also weil ohne dabei hier da auch schon ihm ihn ihr ihm wenn dann mal was wer wo wir uns mich dich euch ich du tag mensch jahr leben hand frau kind welt geht weg gott zeit'.split(' ')),

  pt: ('de a o que e do da em um para com não uma os no se na por mais as dos como mas foi ao ele das tem à seu sua ou ser quando muito há nos já está eu também só pelo pela até isso ela entre era depois sem mesmo aos seus quem nas me esse eles você essa num nem suas meu às minha numa pelos elas qual nós lhe deles essas esses pelas este fosse dele tu te vocês vos lhes meus minhas teu tua teus tuas nosso nossa nossos nossas dela delas esta estes estas aquele aquela aqueles aquelas isto aquilo'.split(' ')),

  it: ('di a da in con su per tra fra il lo la i gli le un uno una essere avere fare dire potere volere sapere stare dovere vedere andare venire dare bene anche dopo prima ancora già sempre mai oggi ieri domani ora qui là qua dove come quando perché molto poco tanto troppo abbastanza nulla niente qualcuno qualcosa tutti tutto ogni ogni cosa noi voi loro io tu egli ella esso essa giorno notte uomo donna casa città mondo vita tempo anno mese settimana ora minuto secondo bambino bambina amico nemico lavoro scuola libro tavolo cosa parola pensare credere parlare ascoltare camminare correre dormire mangiare bere vivere morire'.split(' ')),

  ru: ('и в не на я что он быть с а как это по но они мы все или вы из у она к за так же только бы для если мне меня тебя его её них своих свой свою своими там тут где когда кто что почему уже еще тоже даже очень ли да нет был была было были есть нет надо нужно можно нельзя хотеть мочь думать знать видеть слышать говорить делать жить работать читать писать идти ходить ехать любить дом город страна мир жизнь время год день ночь утро вечер человек люди ребенок женщина мужчина друг враг рука нога глаз сердце вода хлеб дорога'.split(' ')),

  tr: ('bir bu da de mi ne için ile ama veya ya çok az daha en gibi kadar göre sonra önce burada orada şimdi sonra önce her hep bazen hiç yok var olmak etmek yapmak gelmek gitmek almak vermek bilmek görmek söylemek demek istemek sevmek kalmak bulmak ben sen o biz siz onlar bana sana ona bize size onlara beni seni onu bizi sizi onları evet hayır belki tabii elbette ev şehir ülke dünya hayat zaman yıl ay hafta gün gece sabah akşam adam kadın çocuk arkadaş düşman el ayak göz kalp su ekmek yol kitap masa kapı pencere'.split(' ')),

  ar: ('في من إلى على هذا هذه ذلك تلك التي الذي مع عن بعد قبل عند لا لم لن قد كان كانت يكون أن إن أو لكن إذا حتى ثم أيضا فقط جدا كثير قليل كل بعض أحد أحدهما كيف متى أين لماذا ماذا من أنا أنت هو هي نحن أنتم هم بيت مدينة بلد عالم حياة وقت سنة شهر يوم ليل صباح مساء رجل امرأة طفل صديق عدو يد قدم عين قلب ماء خبز طريق كتاب باب نافذة أم أب أخ أخت ابن ابنة جد جدة عم خال يحب يكره يقول يفعل يذهب يأتي يأخذ يعطي يعلم يرى'.split(' ')),

  ur: ('میں سے کا کی کو ہے ہیں تھا تھی تھے ہو رہا رہی رہے گا گی گے یہ وہ جو کیا کیوں کب کہاں کیسے ہاں نہیں اور یا لیکن مگر بھی صرف بہت کم سب کوئی کچھ کسی ہم تم آپ ان کے گھر شہر ملک دنیا زندگی وقت سال مہینہ ہفتہ دن رات صبح شام آدمی عورت بچہ دوست دشمن ہاتھ پاؤں آنکھ دل پانی روٹی راستہ کتاب میز دروازہ کھڑکی ماں باپ بھائی بہن بیٹا بیٹی دادا دادی چچا ماموں جانا آنا کرنا دینا لینا کہنا سننا دیکھنا سوچنا پیار محبت'.split(' ')),
};

export function getWordList(code: string): string[] {
  return WORD_LISTS[code] ?? WORD_LISTS.en;
}
