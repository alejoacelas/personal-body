export const meta = {
  name: 'food-research',
  description: 'Research meal-replacement fraction + long-term vegan effects; write modular md files with sources',
  phases: [
    { title: 'Research', detail: 'parallel web research across 6 angles' },
    { title: 'Verify', detail: 'adversarial check of key claims per question' },
    { title: 'Write', detail: 'writer agent per deep-dive file' },
    { title: 'Front page', detail: 'rewrite README with short verdicts' },
  ],
}

const DIR = '/Users/alejo/best/me/body/food'

const RESEARCH_SCHEMA = {
  type: 'object',
  properties: {
    topic: { type: 'string' },
    summary: { type: 'string', description: '2-4 sentence high-level takeaway' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          claim: { type: 'string' },
          evidence: { type: 'string', description: 'the study/data behind it, with effect sizes where available' },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
          caveat: { type: 'string' },
        },
        required: ['claim', 'evidence', 'confidence'],
      },
    },
    sources: {
      type: 'array',
      items: {
        type: 'object',
        properties: { title: { type: 'string' }, url: { type: 'string' }, note: { type: 'string' } },
        required: ['title', 'url'],
      },
    },
  },
  required: ['topic', 'summary', 'findings', 'sources'],
}

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    question: { type: 'string' },
    overallConfidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    weakClaims: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          claim: { type: 'string' },
          problem: { type: 'string' },
          correction: { type: 'string' },
        },
        required: ['claim', 'problem'],
      },
    },
    confirmed: { type: 'array', items: { type: 'string' }, description: 'claims that held up under scrutiny' },
  },
  required: ['question', 'overallConfidence'],
}

const researchPreamble = `You are a careful evidence researcher. Use WebSearch and WebFetch heavily. Prefer PRIMARY sources: peer-reviewed studies, meta-analyses, large cohort studies, systematic reviews, and reputable health bodies. Give effect sizes, sample sizes, and follow-up durations wherever you can. NEVER fabricate a URL or a statistic — if you cannot verify a source, omit the claim or mark confidence low. Note healthy-user bias, confounding, and funding sources where relevant. Return raw structured data, not prose for a human.`

const ANGLES = [
  {
    q: 'meal',
    key: 'mr-nutrition',
    prompt: `${researchPreamble}\n\nTOPIC: Nutritional completeness of commercial meal replacements (Huel, Soylent, Mealsquares, Jimmy Joy, Ka'Chava, etc.). What macro/micronutrient bases do they cover? Where are they weak or over-relied-on (fiber type, protein quality/DIAAP, added sugar, micronutrient forms/bioavailability, phytonutrient/polyphenol diversity from whole foods)? Are they "nutritionally complete" as marketed, and per whose standard (RDA vs optimal)?`,
  },
  {
    q: 'meal',
    key: 'mr-fraction',
    prompt: `${researchPreamble}\n\nTOPIC: What fraction of a diet can reasonably be meal replacement, long-term? Look for: expert/dietitian guidance, the ultra-processed-food debate (NOVA classification, Kevin Hall's ultra-processed trial) as it applies to MRs, gut microbiome / fiber diversity concerns, satiety and chewing, jaw/oral health, dependence and diet-skill atrophy, and any studies of people using MRs for a large share of intake. Convert to a concrete reasonable-fraction range with reasoning.`,
  },
  {
    q: 'meal',
    key: 'mr-shortterm',
    prompt: `${researchPreamble}\n\nTOPIC: Short-term effects of substituting meal replacements for regular meals: digestion/GI adaptation, blood-glucose response, satiety and hunger, energy/focus, weight management, adherence, and cost per day vs cooking. What happens in the first days to weeks, and what's a sensible ramp?`,
  },
  {
    q: 'vegan',
    key: 'vg-longevity',
    prompt: `${researchPreamble}\n\nTOPIC: Long-term effect of vegan/vegetarian diets on longevity. Cover the major cohorts: Adventist Health Study 2, EPIC-Oxford, UK Biobank, and meta-analyses on all-cause mortality, cardiovascular disease, cancer, type-2 diabetes. Report hazard ratios / relative risks with confidence intervals. Critically weigh healthy-user bias, socioeconomic confounding, and where vegan differs from vegetarian/pescatarian. Distinguish "plant-based" from strictly vegan where the data allows.`,
  },
  {
    q: 'vegan',
    key: 'vg-energy',
    prompt: `${researchPreamble}\n\nTOPIC: Long-term effect of veganism on daily energy, cognition, and productivity. Cover the nutrients that go wrong long-term: B12, iron (non-heme absorption), omega-3 DHA/EPA, creatine, choline, iodine, zinc, vitamin D, and their documented effects on fatigue, cognition, mood, and athletic/physical performance. What does supplementation fix, and what residual gaps (if any) remain? Include studies on vegan cognition and athletic performance.`,
  },
  {
    q: 'vegan',
    key: 'vg-shortterm',
    prompt: `${researchPreamble}\n\nTOPIC: Short-term effects of switching to a vegan diet: the first weeks — energy changes, GI/fiber adaptation, how fast deficiencies (B12, iron, etc.) actually appear vs body stores, and the minimum supplement stack to start on day one. What is transient transition cost vs a real signal?`,
  },
]

// ---- Phase 1: Research (parallel across all angles) ----
phase('Research')
const bundles = await parallel(
  ANGLES.map((a) => () =>
    agent(a.prompt, {
      label: `research:${a.key}`,
      phase: 'Research',
      schema: RESEARCH_SCHEMA,
      agentType: 'general-purpose',
      effort: 'high',
    }).then((r) => (r ? { ...a, data: r } : null))
  )
)
const good = bundles.filter(Boolean)
log(`Research done: ${good.length}/${ANGLES.length} angles returned`)

const byQ = (q) => good.filter((b) => b.q === q)

// ---- Phase 2: Verify (one adversarial reviewer per question) ----
phase('Verify')
const QUESTIONS = [
  { q: 'meal', name: 'Meal-replacement fraction' },
  { q: 'vegan', name: 'Long-term vegan effects' },
]
const verdicts = await parallel(
  QUESTIONS.map((Q) => () => {
    const bundle = byQ(Q.q).map((b) => b.data)
    return agent(
      `${researchPreamble}\n\nYou are the ADVERSARIAL reviewer for the question: "${Q.name}". Below is the collected research as JSON. Independently spot-check the load-bearing claims with WebSearch/WebFetch. Flag any claim that is overstated, mis-cites its source, ignores confounding, or conflates plant-based with strictly vegan / partial with full meal replacement. List what genuinely holds up.\n\nRESEARCH JSON:\n${JSON.stringify(bundle)}`,
      { label: `verify:${Q.q}`, phase: 'Verify', schema: VERIFY_SCHEMA, agentType: 'general-purpose', effort: 'high' }
    ).then((v) => ({ q: Q.q, name: Q.name, verify: v }))
  })
)
const verifyByQ = (q) => (verdicts.filter(Boolean).find((v) => v.q === q) || {}).verify

// ---- Phase 3: Write deep-dive files ----
phase('Write')
const voice = `VOICE & FORMAT RULES (from the repo owner Alejo's global instructions — follow exactly):
- Plain declarative sentences that state a want or fact and stop. No balancing an em-dash clause and landing on a flourish. No filler.
- Lead with the rule/verdict; explain only where it changes what to do. Apply Paul Graham's density test: cut any word whose removal loses no meaning.
- Bullet parallel items; clean prose for the rest. Hyperlink primary sources inline.
- This is an AI-authored file, so wrap the WHOLE file body in a single pair of <!--ai--> ... <!--/ai--> HTML comments (first line inside, last line inside).
- Markdown. Every non-trivial claim carries an inline linked source. Give effect sizes and confidence honestly; keep the caveats that carry uncertainty — do not sand them off.`

const FILES = [
  {
    q: 'meal',
    path: `${DIR}/meal-replacements.md`,
    title: 'Meal replacements: what fraction of my diet?',
    guidance: `Structure:\n1. **Verdict** — a concrete reasonable-fraction range (e.g. "up to X% of daily calories long-term, more short-term") with the one-line reason.\n2. **Why that number** — completeness of MRs, and the real long-term limiters (phytonutrient diversity, fiber, ultra-processing debate, satiety/chewing, diet-skill dependence).\n3. **Short-term vs long-term** — what changes with time; ramp advice.\n4. **How to do it well** — practical: which meals to replace, what to keep whole-food, what to watch.\n5. **Methodology & caveats** — how this was researched, strength of evidence, healthy-user/UPF-debate caveats.\n6. **Sources** — linked list.`,
  },
  {
    q: 'vegan',
    path: `${DIR}/veganism.md`,
    title: 'Veganism: long-term longevity, energy, and productivity',
    guidance: `Structure (long-term is the priority section):\n1. **Verdict** — net effect on longevity, and on energy/productivity, in a few lines. Separate "diet composition" from "supplementation discipline".\n2. **Longevity** — the cohort evidence with hazard ratios and CIs; what's causal vs healthy-user bias; vegan vs vegetarian vs plant-based.\n3. **Energy & productivity (long-term)** — the nutrient failure modes (B12, iron, omega-3 DHA, creatine, choline, iodine, D) and what supplementation fixes; residual gaps.\n4. **Short-term transition** — first-weeks effects and the day-one supplement stack.\n5. **Methodology & caveats.**\n6. **Sources** — linked list.`,
  },
]

const writeResults = await parallel(
  FILES.map((F) => () => {
    const bundle = byQ(F.q).map((b) => ({ topic: b.data.topic, summary: b.data.summary, findings: b.data.findings, sources: b.data.sources }))
    const verify = verifyByQ(F.q)
    return agent(
      `Write a modular deep-dive markdown file and SAVE it with the Write tool to exactly this path: ${F.path}\n\nTitle (use as H1 after the opening <!--ai-->): "${F.title}"\n\n${voice}\n\n${F.guidance}\n\nBase the file ONLY on the verified research below. Where the adversarial reviewer flagged a claim, soften or drop it. Use the reviewer's "confirmed" list as your high-confidence spine. Deduplicate sources into the final Sources section with working links.\n\nRESEARCH JSON:\n${JSON.stringify(bundle)}\n\nADVERSARIAL REVIEW JSON:\n${JSON.stringify(verify)}\n\nAfter writing the file, return a JSON object with two fields: "verdict" (2-3 sentence plain-voice summary suitable for the front page, no links) and "fraction_or_headline" (the single most important number or takeaway).`,
      { label: `write:${F.q}`, phase: 'Write', agentType: 'general-purpose', effort: 'high', schema: {
        type: 'object',
        properties: { verdict: { type: 'string' }, fraction_or_headline: { type: 'string' } },
        required: ['verdict', 'fraction_or_headline'],
      } }
    ).then((r) => ({ q: F.q, path: F.path, title: F.title, ...r }))
  })
)
const wr = writeResults.filter(Boolean)

// ---- Phase 4: Front page ----
phase('Front page')
const mealV = wr.find((w) => w.q === 'meal') || {}
const veganV = wr.find((w) => w.q === 'vegan') || {}
await agent(
  `Rewrite the front-page README at exactly ${DIR}/README.md using the Write tool. Keep it SHORT and readable — someone should get both verdicts in under a screen, then click through for depth.\n\n${voice}\n\nRequired structure:\n- FIRST line inside <!--ai-->: the standing question, kept as: "What should I eat — and how much of it can a machine decide for me?"\n- One or two sentences on what this folder is.\n- A "## Verdicts" section with two short bulleted answers, each linking to its deep-dive file:\n  - Meal replacements → link to meal-replacements.md. Headline/number: ${JSON.stringify(mealV.fraction_or_headline || '')}. Verdict: ${JSON.stringify(mealV.verdict || '')}\n  - Veganism (long-term) → link to veganism.md. Headline: ${JSON.stringify(veganV.fraction_or_headline || '')}. Verdict: ${JSON.stringify(veganV.verdict || '')}\n- One line noting long-term effects were weighted most heavily.\n- Keep a short "## Neighbors" section: me/body (parent, food is one pillar beside exercise/ergonomics) and me/mind (energy/cognition tie diet to mood/focus).\n\nDo not invent facts beyond the verdicts given. Plain voice, no flourishes.`,
  { label: 'write:README', phase: 'Front page', agentType: 'general-purpose', effort: 'medium' }
)

return {
  filesWritten: wr.map((w) => w.path).concat([`${DIR}/README.md`]),
  mealHeadline: mealV.fraction_or_headline,
  veganHeadline: veganV.fraction_or_headline,
  anglesResearched: good.map((b) => b.key),
}
