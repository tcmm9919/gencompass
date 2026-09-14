/**
 * Supplied bibliography dated 2026-09-14: 56 entries, not 56 independent studies.
 * Citation/summary wording is preserved from docs/gencompass-bibliography.md
 * with Markdown emphasis removed for plain-text rendering. URLs are derived only
 * from DOI/PMCID identifiers present in the supplied citation, not inferred titles.
 * The complete bibliography has not been independently verified or validated as
 * evidence for numeric weights. These summaries remain the document author's claims.
 */
export type BibliographyEntry = {
  citation: string;
  summary: string;
  sourceUrl?: string;
};
export type BibliographyCategory = {
  id: string;
  title: string;
  entries: BibliographyEntry[];
};
export const bibliography: BibliographyCategory[] = [
  {
    id: 'onset',
    title: 'Возраст дебюта симптомов',
    entries: [
      {
        citation:
          'Manickam K, McClain MR, Demmer LA, et al. Exome and genome sequencing for pediatric patients with congenital anomalies or intellectual disability: an evidence-based clinical guideline of the American College of Medical Genetics and Genomics (ACMG). Genetics in Medicine, 2021;23(11):2029–2037. doi: 10.1038/s41436-021-01242-6',
        summary:
          'Официальное руководство ACMG использует возраст дебюта как критерий включения: врождённые аномалии с началом до 1 года, задержка развития/интеллектуальная недостаточность с началом до 18 лет.',
        sourceUrl: 'https://doi.org/10.1038/s41436-021-01242-6',
      },
      {
        citation:
          'Van Karnebeek CDM, Stockler S. Treatable inborn errors of metabolism causing intellectual disability: A systematic literature review. Molecular Genetics and Metabolism, 2012;105(3):368–381. doi: 10.1016/j.ymgme.2011.11.191',
        summary:
          'Систематический обзор курабельных врождённых нарушений метаболизма; определяет интеллектуальную недостаточность как задержку развития в возрасте до 5 лет (распространённость 2,5% населения).',
        sourceUrl: 'https://doi.org/10.1016/j.ymgme.2011.11.191',
      },
      {
        citation:
          'Van Karnebeek CDM, et al. Early identification of treatable inborn errors of metabolism in children with intellectual disability: The Treatable Intellectual Disability Endeavor (TIDE) protocol in British Columbia. PMC4235446.',
        summary:
          'Протокол раннего выявления курабельных нарушений метаболизма; прямое клиническое обоснование скрининга детей с задержкой развития именно в раннем возрасте.',
        sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4235446/',
      },
      {
        citation:
          'Demos M, Guella I, DeGuzman C, et al. Diagnostic Yield and Treatment Impact of Targeted Exome Sequencing in Early-Onset Epilepsy. Frontiers in Neurology, 2019;10:434. doi: 10.3389/fneur.2019.00434',
        summary:
          'WES у 180 пациентов с эпилепсией с началом ≤5 лет неясной этиологии: диагноз поставлен у 33%; время от начала эпилепсии до генетического диагноза значительно короче при раннем WES (145 дней против 2882 дней при позднем тестировании).',
        sourceUrl: 'https://doi.org/10.3389/fneur.2019.00434',
      },
      {
        citation:
          'ScienceDirect (2024). Exome and genome sequencing in a heterogeneous population of patients with rare disease: Identifying predictors of a diagnosis.',
        summary:
          'Прямое статистическое подтверждение: пациенты с педиатрическим (в отличие от взрослого) началом симптомов имели значимо более высокие шансы получить диагноз по результатам ES/GS.',
      },
      {
        citation:
          'PMC8409681. Next-generation sequencing in childhood-onset epilepsies: Diagnostic yield and impact on neuronal ceroid lipofuscinosis type 2 (CLN2) disease diagnosis.',
        summary:
          'Молекулярный диагностический выход сильно коррелирует с возрастом дебюта и эпилептическим синдромом; наивысший выход — у пациентов с началом судорог в неонатальном периоде.',
        sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8409681/',
      },
      {
        citation:
          'Malinowski J, Miller DT, Demmer L, et al. Systematic evidence-based review: outcomes from exome and genome sequencing for pediatric patients with congenital anomalies or intellectual disability. Genetics in Medicine, 2020;22:986–1004. doi: 10.1038/s41436-020-0771-z',
        summary:
          'Систематический обзор, лежащий в основе гайдлайна ACMG (см. #1); подтверждает клиническую полезность ES/GS в педиатрической когорте с ранним началом симптомов.',
        sourceUrl: 'https://doi.org/10.1038/s41436-020-0771-z',
      },
    ],
  },
  {
    id: 'family',
    title: 'Семейный анамнез',
    entries: [
      {
        citation:
          'Ismailoglu M, et al. The value of age of onset and family history as predictors of molecular diagnosis in a Swedish cohort of inherited retinal disease. PMC11986402.',
        summary:
          'Логистическая регрессия на 324 пациентах: положительный семейный анамнез удваивает шансы молекулярного диагноза (OR 2.1, 95% ДИ 1.3–3.4).',
        sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11986402/',
      },
      {
        citation:
          'European Journal of Human Genetics, 2025. Determinants of diagnostic yield in a multi-ethnic Asian inherited retinal disease cohort.',
        summary:
          'На 506 пробандах: диагностический выход отрицательно коррелировал с возрастом дебюта и положительно — с числом поражённых родственников; сочетание семейного анамнеза и раннего возраста диагноза давало диагностический выход 69,5% (рост в 3,07 раза).',
      },
      {
        citation:
          'PMC12674980. Diagnostic Yield and Clinical Impact of a Small Genetic Panel for Kidney Disease: A Multicenter, Retrospective European Study.',
        summary:
          'Семейный анамнез — независимый предиктор генетического диагноза (OR 4.7, 95% ДИ 3.2–7.2) наряду с клинической картиной и ранним началом болезни; итоговый предиктивный алгоритм достиг AUC-ROC 0.78.',
        sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12674980/',
      },
      {
        citation: 'Aetna Clinical Policy Bulletin — Genetic Testing.',
        summary:
          'Семейный анамнез, весомо указывающий на генетическую этиологию (включая кровнородственный брак), фигурирует как формальный критерий показания для расширенного генетического тестирования в клинических страховых политиках.',
      },
      {
        citation:
          'Medical Sciences (MDPI), 2025. Diagnostic Yield of Next-Generation Sequencing for Rare Pediatric Genetic Disorders: A Single-Center Experience.',
        summary:
          'Решение о типе тестирования (WES vs целевая панель) принималось с учётом клинической картины, семейного анамнеза и генетической оценки; общий диагностический выход составил 45,99%.',
      },
      {
        citation:
          'Do CB, Hinds DA, Francke U, Eriksson N. Comparison of Family History and SNPs for Predicting Risk of Complex Disease. PLOS Genetics, 2012. doi: 10.1371/journal.pgen.1002973',
        summary:
          'Методологическая основа: семейный анамнез сохраняет клиническую значимость как предиктор риска, особенно для заболеваний высокой распространённости и наследуемости, дополняя, а не заменяя генетическое тестирование.',
        sourceUrl: 'https://doi.org/10.1371/journal.pgen.1002973',
      },
      {
        citation:
          'PMC8207605. Implications of ACMG guidelines to identify high-risk acute lymphoblastic leukemia patients with hereditary cancer susceptibility syndromes (HCSS) in a highly consanguineous population.',
        summary:
          'Позитивный семейный анамнез онкозаболеваний ассоциирован с повышенным риском (OR 2.46) и используется как критерий ACMG для отбора пациентов на генетическое тестирование.',
        sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8207605/',
      },
    ],
  },
  {
    id: 'consanguinity',
    title: 'Кровнородственный брак (консангвинность)',
    entries: [
      {
        citation:
          'Journal of Human Genetics, 2015. Diagnostic exome sequencing for patients with a family history of consanguinity: over 38% of positive results are not autosomal recessive pattern.',
        sourceUrl: 'https://www.nature.com/articles/jhg2015125',
        summary:
          'На 500 случаях DES: диагностический выход у пациентов с консангвинностью (32,5%) статистически не отличался от группы без консангвинности (30,2%); при этом 38,4% позитивных находок не соответствовали аутосомно-рецессивному типу наследования — важная методологическая оговорка для интерпретации критерия.',
      },
      {
        citation:
          'PMC3515342. Challenges in the care for consanguineous couples: an exploratory interview study among general practitioners and midwives.',
        summary:
          'Врачи общей практики рассматривают консангвинность как дополнительный, но не самостоятельный повод для направления к генетику; решающим фактором остаётся позитивный семейный анамнез.',
        sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3515342/',
      },
      {
        citation:
          'GEC-KO (Genetics Education Canada — Knowledge Organization). Consanguinity — Point of Care Tool.',
        summary:
          'Клиническая рекомендация: направление в генетический центр показано при консангвинности в сочетании с позитивным семейным анамнезом врождённых аномалий, интеллектуальной недостаточности или подозрением на генетическое заболевание.',
      },
      {
        citation:
          'Bennett RL, et al. Genetic counseling and screening of consanguineous couples and their offspring: Focused Revision. Journal of Genetic Counseling, 2021. doi: 10.1002/jgc4.1477',
        summary:
          'Актуализированная практическая рекомендация: у консангвинных пар гомозиготные патогенные варианты в генах, обычно ассоциированных с аутосомно-доминантным наследованием, могут давать более тяжёлые или клинически отличные аутосомно-рецессивные фенотипы.',
        sourceUrl: 'https://doi.org/10.1002/jgc4.1477',
      },
      {
        citation:
          'PMC7616538. Genetic Findings in Short Turkish Children Born to Consanguineous Parents.',
        summary:
          'Диагностический выход генетического анализа при низкорослости у детей консангвинных родителей зависит от сопутствующих клинических признаков, а не только от факта родства.',
        sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7616538/',
      },
      {
        citation:
          'PMC8207605. Implications of ACMG guidelines... in a highly consanguineous population.',
        summary:
          'Родительская консангвинность оказалась ведущим критерием ACMG, выполнявшимся у пациентов при отборе на тестирование наследственных синдромов предрасположенности к раку в пакистанской популяции; авторы предлагают пересмотреть вес этого критерия в существующих гайдлайнах.',
        sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8207605/',
      },
      {
        citation:
          'PMC11395515. High Diagnostic Yield and Clinical Utility of NGS in Children with Epilepsy and Neurodevelopmental Delays.',
        summary:
          'Из 45 детей 18 были рождены в консангвинных браках, из них у 14 (77,8%) выявлена генетическая причина эпилепсии/задержки развития — иллюстрация практического взаимодействия консангвинности с другими критериями шкалы (не изолированный фактор).',
        sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11395515/',
      },
    ],
  },
  {
    id: 'multisystem',
    title: 'Мультисистемность поражения',
    entries: [
      {
        citation:
          'PMC13250398 / Wiley Clinical Case Reports, 2026. Understanding the Role of Genetic Testing in Diagnosing a Complex Pediatric Case.',
        summary:
          'Клинический разбор мультисистемного фенотипа (задержка роста, краниофациальные аномалии, алопеция, гипоплазия почек), диагностированного через ES; подчёркивает диагностическую ценность экзомного секвенирования именно при вовлечении множества систем.',
        sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC13250398/',
      },
      {
        citation:
          'PMC13230342 / Archives of Gynecology and Obstetrics, 2026. Diagnostic yield of CMA and ES in fetuses with CNS anomalies.',
        summary:
          'Патогенные/вероятно патогенные варианты выявлялись значимо чаще при мультисистемных, чем при изолированных сложных ЦНС-фенотипах (64,0% против 14,3%, p=0.02).',
        sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC13230342/',
      },
      {
        citation:
          'PMC8989190. Diagnostic yield of patients with ID, GDD and multiple congenital anomalies using karyotype, microarray, WES from Central Brazil.',
        summary:
          'Хромосомный микроматричный анализ (CMA) стал тестом первой линии именно для пациентов с интеллектуальной недостаточностью, задержкой развития, РАС и множественными врождёнными аномалиями (MCA) как группой повышенного диагностического выхода.',
        sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8989190/',
      },
      {
        citation:
          'PMC13494563. A Tiered Genetic Diagnostic Approach in Newborns With Major Congenital Anomalies: Experience From a Tertiary NICU.',
        summary:
          'У новорождённых с множественными врождёнными аномалиями (≥2 систем) WES после негативного CMA дал диагностический выход 41,4%; методология явно определяет "множественные врождённые аномалии" как вовлечение разных органных систем.',
        sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC13494563/',
      },
      {
        citation:
          'PMC12859011. Perinatal genetic diagnostic yield in fetuses with arthrogryposis multiplex congenita (AMC).',
        summary:
          'Классификация AMC по степени системного вовлечения (изолированное поражение конечностей vs. мультисистемное с ЦНС и интеллектуальной недостаточностью) напрямую связана с диагностическим выходом (35–73% при WES).',
        sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12859011/',
      },
      {
        citation:
          'ScienceDirect, 2021. Clinical impact of genomic testing in patients with suspected monogenic kidney disease.',
        summary:
          'В мультидисциплинарной когорте ES выявило моногенную причину у 39% пациентов; отдельно отмечена клиническая ценность выявления мультисистемного характера заболевания для прогноза и семейного консультирования.',
      },
      {
        citation:
          'PMC10700603 / Scientific Reports, 2023. The diagnostic yield of exome sequencing in liver diseases from a curated gene panel.',
        summary:
          'Обнаружение конкордантных фенотипов у пациентов с патогенными вариантами генов печени среди когорты с почечными заболеваниями иллюстрирует, как мультисистемные находки повышают диагностическую значимость секвенирования.',
        sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10700603/',
      },
    ],
  },
  {
    id: 'dysmorphology',
    title: 'Дисморфология',
    entries: [
      {
        citation:
          'CMAJ, 2002. Medical genetics: 2. The diagnostic approach to the child with dysmorphic signs.',
        summary:
          'Классическая методологическая основа дисморфологии: диагноз в большинстве случаев подсказывается общим обликом (гештальтом) пациента и совокупностью малых аномалий развития.',
      },
      {
        citation:
          'Egyptian Journal of Medical Human Genetics, 2024. A cost-efficient algorithm for diagnosing children with dysmorphic features.',
        summary:
          'Программа распознавания лиц (Face2Gene) корректно предположила диагноз синдрома Корнелии де Ланге как первый вариант в 83,7% случаев у пациентов с подтверждёнными патогенными вариантами.',
      },
      {
        citation:
          'Journal of Medical Genetics, 2019. From gestalt to gene: early predictive dysmorphic features of PMM2-CDG.',
        summary:
          'Детальный дисморфологический анализ выявил восемь основных дисморфических признаков с доказанной предиктивной значимостью (p<0.001 по ROC-анализу) для конкретного генетического синдрома.',
      },
      {
        citation:
          'Egyptian Pediatric Association Gazette, 2025. The application of the facial analysis program Face2Gene in a single genetic counseling center.',
        summary:
          'На 151 пациенте с дисморфическими чертами: 100% диагностический выход программы для ряда классических синдромов (Дауна, Прадера-Вилли, Тёрнера и др.), 82% для хромосомных нарушений в целом.',
      },
      {
        citation:
          'PMC10973953. Validation of 3 Computer-Aided Facial Phenotyping Tools (DeepGestalt, GestaltMatcher, D-Score).',
        summary:
          'Сравнительное исследование диагностической точности алгоритмов распознавания дисморфических черт; лучший инструмент достиг AUROC 0.86 — количественное подтверждение объективной диагностической ценности дисморфологии.',
        sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10973953/',
      },
      {
        citation:
          'Annals of Child Neurology, 2023. Lessons Learned from the Point-of-Care Use of a Facial Analysis Technology.',
        summary:
          'На 23 детях с подозрением на краниофациальный дисморфизм общий диагностический выход тестирования, инициированного по результатам оценки лица, составил 60,9%.',
      },
      {
        citation:
          'PMC8336249. Genetic syndromes screening by facial recognition technology: VGG-16 screening model construction and evaluation.',
        summary:
          'Модель на основе нейросети VGG-16, обученная на 456 фотографиях, подтверждает возможность объективного скрининга дисморфических синдромов и обосновывает включение дисморфологии как отдельного количественного критерия шкалы.',
        sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8336249/',
      },
    ],
  },
  {
    id: 'neurodevelopment',
    title: 'Регресс развития / нейроразвитие',
    entries: [
      {
        citation:
          'Journal of Autism and Developmental Disorders, 2025. The Diagnostic Yield of Investigating Developmental Regression in Children: A Systematic Review and Meta-Analysis.',
        summary:
          'Метаанализ 15 исследований (596 детей): диагностический выход генетических/геномных исследований при регрессе развития составил 70% против 28% для метаболических, 13% для нейрофизиологических и 6% для нейровизуализационных исследований — генетическое тестирование оказалось самым результативным.',
      },
      {
        citation:
          'Furley K, Hunter MF, Fahey M, Williams K. Diagnostic findings and yield of investigations for children with developmental regression. American Journal of Medical Genetics Part A, 2024. doi: 10.1002/ajmg.a.63607',
        summary:
          'На 99 детях с регрессом: экзомное секвенирование дало наивысший диагностический выход (51,1%), достигая 63,6% у детей с интеллектуальной недостаточностью; выявлены 8 новых молекулярных находок, ранее не описанных как ассоциированные с регрессом.',
        sourceUrl: 'https://doi.org/10.1002/ajmg.a.63607',
      },
      {
        citation:
          'Pal S, Puri RD, Verma IC, et al. Genetic Etiology in Children with Progressive Neuroregression. Indian Journal of Pediatrics, 2026. doi: 10.1007/s12098-026-06026-x',
        summary:
          'Общий диагностический выход у детей с прогрессирующим неврологическим регрессом составил 79,2%, увеличившись до 81,5% после повторного анализа данных NGS; в 85% случаев этиология была нейрометаболической.',
        sourceUrl: 'https://doi.org/10.1007/s12098-026-06026-x',
      },
      {
        citation:
          'Indian Journal of Pediatrics, 2026 (комментарий к Pal et al.). Neuroregression in Childhood: A Red Flag for Inborn Errors of Metabolism.',
        summary:
          'Подчёркивает статус неврологического регресса как «красного флага», требующего высокого индекса подозрения на врождённые нарушения метаболизма, особенно лизосомные болезни накопления.',
      },
      {
        citation:
          'Lysosomal storage disorders in Indian children with neuroregression attending a genetic center. Indian Pediatrics, 2015.',
        summary:
          'На 432 детях с регрессом навыков: у 309 (71,5%) выявлена лизосомная болезнь накопления как причина — крупнейшая по объёму подтверждающая когорта.',
      },
      {
        citation:
          'UK PIND Programme (Verity CM, et al.). Epidemiology of progressive intellectual and neurological deterioration in UK children.',
        summary:
          'Национальная британская программа обязательного репортирования случаев регресса выявила 2373 ребёнка за 27 лет наблюдения; в недавнем отчёте 61% из 259 диагностированных заболеваний оказались врождёнными нарушениями метаболизма.',
      },
      {
        citation:
          'Journal of Intellectual Disability — Diagnosis and Treatment, 2024. Defining Developmental Regression in Rare Neurodevelopmental Disorders of Genetic Etiology: A Scoping Review.',
        summary:
          'Скоупинг-обзор, систематизирующий определения и клинические паттерны регресса развития при редких генетических нейроразвитийных расстройствах — методологическая база для формализации критерия в шкале.',
      },
    ],
  },
  {
    id: 'treatment',
    title: 'Резистентность к лечению',
    entries: [
      {
        citation:
          "NBK609899 (Jasper's Basic Mechanisms of the Epilepsies). Gene Therapy for Epilepsy.",
        summary:
          'Диагностический выход генетического тестирования систематически выше у пациентов с ранним дебютом судорог, нейроразвитийными коморбидностями, семейным анамнезом эпилепсии и резистентностью к медикаментозному лечению; таргетное NGS-тестирование даёт диагностический выход 30–40% в этой группе.',
      },
      {
        citation:
          'PMC12302900. Genetic testing for diagnosing neurodevelopmental disorders and epilepsy: a systematic review and meta-analysis.',
        summary:
          'Метаанализ 416 исследований (124 937 участников): диагностический выход при лекарственно-резистентных судорогах составил 25,4%, при эпилептической энцефалопатии — 34,7%, при раннем дебюте эпилепсии — 32,3%.',
        sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12302900/',
      },
      {
        citation:
          'PMC11395515. High Diagnostic Yield and Clinical Utility of NGS in Children with Epilepsy and Neurodevelopmental Delays.',
        summary:
          'Диагностический выход NGS составил 72,2% у пациентов с медикаментозно-резистентной эпилепсией и задержками развития против 70,8% у пациентов без резистентности — резистентность в сочетании с задержкой развития даёт наивысшую претестовую вероятность.',
        sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11395515/',
      },
      {
        citation:
          'Acta Neurologica Belgica, 2022. Exploring the genetic etiology of drug-resistant epilepsy: incorporation of exome sequencing into practice.',
        summary:
          'У 24 пациентов с медикаментозно-резистентной эпилепсией WES выявило 11 новых вариантов; подчёркнута клиническая значимость раскрытия генетической этиологии именно в группе резистентных к терапии больных для потенциальной персонализации лечения.',
      },
      {
        citation:
          'An Overview of Drug-Resistant Epilepsies Based on Advances in Genetics: A Cohort Study, 2026.',
        summary:
          'На 413 пациентах с диагнозом медикаментозно-резистентной эпилепсии, прошедших WES, значимые патогенные варианты обнаружены у 56,7% — один из самых высоких показателей диагностического выхода среди всех клинических категорий эпилепсии.',
      },
      {
        citation:
          'PMC5945675. Incorporating epilepsy genetics into clinical practice: a 360° evaluation.',
        summary:
          'Медикаментозная резистентность к терапии эпилепсии — один из формальных критериев включения в протокол генетического тестирования наравне с ранним дебютом (<2 лет) и семейным анамнезом; итоговый диагностический выход составил 34% для дебюта до 2 лет.',
        sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5945675/',
      },
      {
        citation:
          'Diagnostic exome sequencing provides a molecular diagnosis for a significant proportion of patients with epilepsy. Genetics in Medicine, 2016.',
        summary:
          'Выявление генетической причины напрямую влияет на выбор противосудорожных препаратов, особенно при мутациях в генах SCN2A, SCN8A, CDKL5, POLG — обоснование клинической значимости критерия помимо диагностики.',
      },
    ],
  },
  {
    id: 'laboratory',
    title: 'Лабораторные красные флаги',
    entries: [
      {
        citation:
          'American Family Physician, 2006. Inborn Errors of Metabolism in Infancy and Early Childhood: An Update.',
        summary:
          'Неспецифические метаболические отклонения (гипогликемия, метаболический ацидоз, гипераммониемия) должны быть срочно скорректированы даже до установления конкретного диагноза; классическая клиническая основа для выделения лабораторных красных флагов.',
      },
      {
        citation: 'Medscape / Inborn Errors of Metabolism Workup.',
        summary:
          'Большинство острых, угрожающих жизни IEM можно классифицировать уже по результатам первичной лабораторной оценки; при этом лабораторные отклонения могут быть транзиторными — нормальные значения не исключают IEM, что важно для интерпретации критерия в шкале.',
      },
      {
        citation:
          'PMC7691570. A Proposed Diagnostic Algorithm for Inborn Errors of Metabolism Presenting With Movement Disorders.',
        summary:
          'Шестиэтапный диагностический алгоритм, в котором первый шаг ("красные флаги IEM") включает минимальную биохимическую панель как обязательный элемент до перехода к генетическому тестированию.',
        sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7691570/',
      },
      {
        citation:
          'PMC9508208. Biochemical testing for inborn errors of metabolism: experience from a large tertiary neonatal centre.',
        summary:
          'Клинически инициированный метаболический скрининг (глюкоза, аммиак, лактат) на 204 новорождённых дал диагноз IEM в 2,4% случаев при высокой диагностической эффективности относительно низкой распространённости заболеваний в общей популяции.',
        sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9508208/',
      },
      {
        citation:
          'PMC11164447. Screening for inborn errors of metabolism among newborns with metabolic disturbance and/or neurological manifestations without determined cause.',
        summary:
          'На 101 новорождённом с гипогликемией, метаболическим ацидозом, желтухой и другими неспецифическими признаками у части пациентов лабораторный скрининг позволил сформулировать диагностическую гипотезу (мукополисахаридоз, тирозинемия I типа и др.).',
        sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11164447/',
      },
      {
        citation:
          'PMC8898721. Diagnosis of inborn errors of metabolism within the expanded newborn screening in the Madrid region.',
        summary:
          'Крупная региональная программа расширенного неонатального скрининга подтвердила IEM у 222 из 592 970 новорождённых (1 случай на 2670), иллюстрируя масштаб и диагностическую значимость системной лабораторной оценки красных флагов.',
        sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8898721/',
      },
      {
        citation:
          'PMC10058105. Metabolomic Studies in Inborn Errors of Metabolism: Last Years and Future Perspectives.',
        summary:
          'Метаболомика как развивающийся инструмент валидации биохимических биомаркеров IEM подчёркивает необходимость включения лабораторных красных флагов в дифференциальную диагностику наряду с клиническими и генетическими данными.',
        sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10058105/',
      },
    ],
  },
];
