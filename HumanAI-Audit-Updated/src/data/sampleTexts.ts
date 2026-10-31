/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SampleTextItem {
  id: string;
  title: string;
  category: 'Academic' | 'Human Narrative' | 'AI Synthetic Tendency' | 'Corporate Brief' | 'Literary';
  description: string;
  text: string;
}

export const SAMPLE_TEXTS: SampleTextItem[] = [
  {
    id: 'ai-synthetic',
    title: 'AI Synthetic Characteristic Draft',
    category: 'AI Synthetic Tendency',
    description: 'Demonstrates uniform sentence cadence, repetitive transition signposting, and characteristic AI filler phrases.',
    text: `In today's fast-paced world, the emergence of artificial intelligence stands as a testament to human ingenuity and technological progress. It plays a pivotal role in reshaping communication paradigms across contemporary society. Furthermore, machine learning architectures delve into vast quantities of textual data to discern intricate linguistic patterns. In addition, these models generate responsive narratives that mirror authentic human dialogue with remarkable fidelity.

Moreover, the integration of computational linguistics fosters unprecedented operational synergies across diverse commercial sectors. It is important to note that algorithms optimize workflow pipelines while eliminating cognitive bottlenecks. Consequently, organizations can leverage automated synthesis to accelerate strategic decision-making. In conclusion, the technological renaissance serves to expand human capability, illuminating a transformative path toward global prosperity.`
  },
  {
    id: 'human-narrative',
    title: 'Human Conversational Narrative',
    category: 'Human Narrative',
    description: 'Features high burstiness (sentence length variance), organic rhythm, varied starters, and authentic personal tone.',
    text: `The fog cleared slowly off the ridge. I waited by the old wooden gate, shivering slightly despite the wool coat, listening to the creek rush through the ravine below. It had been nearly twelve years.

Nothing looked quite the same. The barn roof had caved in on the south side, spilling weathered cedar beams into a tangle of wild blackberry vines. But the smell remained unmistakable: damp pine needles, woodsmoke from an unseen chimney down the valley, and cold river stone. 

Why had I stayed away so long? Fear, mostly. The simple, stupid conviction that going back meant admitting that everything in the city had fallen apart. Yet standing there in the morning frost, the quiet felt less like a rebuke and more like an open door. I took a deep breath, unhitched the iron latch, and walked down toward the orchard.`
  },
  {
    id: 'academic-paper',
    title: 'Peer-Reviewed Neurobiology Abstract',
    category: 'Academic',
    description: 'High polysyllabic density, specialized scientific vocabulary, passive and active formal constructions.',
    text: `Synaptic plasticity within hippocampal pyramidal neurons underpins mammalian spatial navigation and episodic memory consolidation. While long-term potentiation has been extensively characterized in electrophysiological preparations, the downstream transcriptional cascades modulating post-synaptic receptor stabilization remain partially elusive.

Here, we demonstrate that calcium-calmodulin-dependent kinase II regulates the stoichiometric phosphorylation of glutamate receptor subunits during theta-burst stimulation. Quantitative immunofluorescence microscopy revealed accelerated trafficking of scaffolding proteins to dendritic spines within thirty minutes of induction. Pharmacological inhibition of protein kinase cascades abolished structural spine enlargement without diminishing baseline synaptic transmission. 

These findings indicate that receptor recruitment requires coordinated phosphorylation kinetics. Consequently, targeted modulation of scaffolding complexes may provide therapeutic avenues for mitigating neurodegenerative cognitive deficits.`
  },
  {
    id: 'corporate-memo',
    title: 'Strategic Operations & Tech Roadmap',
    category: 'Corporate Brief',
    description: 'Action-oriented executive prose with balanced paragraphs, moderate complexity, and clear organizational objectives.',
    text: `During the third quarter, our primary engineering initiatives focused on reducing cloud infrastructure latency and improving system availability. The engineering team migrated four legacy microservices to containerized Kubernetes clusters in North America. This architecture transition yielded a 34 percent reduction in database query latency during peak traffic periods.

However, cross-regional data replication continues to encounter intermittent network jitter during scheduled maintenance windows. The infrastructure council has approved an updated caching strategy to insulate client applications against regional failover delays. 

Immediate priorities for the upcoming cycle include finalizing multi-zone failover automated testing, deploying client-side telemetry dashboards, and completing quarterly security compliance audits prior to the holiday freeze.`
  },
  {
    id: 'literary-fiction',
    title: 'Literary Fiction & Atmosphere',
    category: 'Literary',
    description: 'Rich sensory imagery, extreme cadence contrast between brief observations and lyrical descriptions.',
    text: `Night arrived in the harbor like ink poured into tea. Lanterns flickered along the salt-crusted stone wharves, their yellow halos shuddering each time the tide slapped against the pilings. Gulls settled on the rusted stays of forgotten trawlers.

Cold. Bone cold.

An old sailor in an oilskin jacket struck a sulfur match against his boot heel. The flame flared blue, briefly illuminating his creased cheeks and squinting gray eyes, before settling into a warm orange bead against the bowl of his pipe. Smoke curled into the damp air, sharp and sweet, drifting outward over dark water where the lighthouse beam spun its slow, blinding circle.`
  }
];
