const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, ImageRun, LevelFormat, PageBreak, Header, Footer, PageNumber,
  TableOfContents,
} = require('docx');

const INK = '171C29', MUTED = '525D70', ACCENT = 'A44914', LINE = 'D7CEBF', SOFT = 'F9E9CF', RAISED = 'F3ECDF', TEAL = '106A60';
const FONT = 'Arial';
const W = 9026; // A4 text width in DXA with 1" margins

// "**bold**" and "*italic*" inline markup
function runs(text, base = {}) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(new TextRun({ text: text.slice(last, m.index), ...base }));
    const t = m[0];
    if (t.startsWith('**')) out.push(new TextRun({ text: t.slice(2, -2), bold: true, ...base }));
    else out.push(new TextRun({ text: t.slice(1, -1), italics: true, ...base }));
    last = m.index + t.length;
  }
  if (last < text.length) out.push(new TextRun({ text: text.slice(last), ...base }));
  return out;
}
const P = (text, opts = {}) => new Paragraph({ children: runs(text, opts.run || {}), spacing: { after: 120, line: 300 }, ...opts.para });
const Lead = (text) => new Paragraph({ children: runs(text, { size: 26, color: INK }), spacing: { after: 160, line: 320 } });
const Small = (text) => new Paragraph({ children: runs(text, { size: 18, color: MUTED }), spacing: { after: 100 } });
const H1 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)], pageBreakBefore: true });
const H1n = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)] });
const H2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] });
const H3 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(text)] });
const Kicker = (text) => new Paragraph({ children: [new TextRun({ text: text.toUpperCase(), bold: true, color: ACCENT, size: 18, characterSpacing: 40 })], spacing: { after: 60 } });
const B = (items) => items.map((t) => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: runs(t), spacing: { after: 80, line: 290 } }));
const N = (items, ref = 'num') => items.map((t) => new Paragraph({ numbering: { reference: ref, level: 0 }, children: runs(t), spacing: { after: 80, line: 290 } }));
const Label = (k, v) => new Paragraph({ children: [new TextRun({ text: k + '  ', bold: true, color: ACCENT }), ...runs(v)], spacing: { after: 100, line: 290 } });
const Quote = (text, note) => new Paragraph({
  children: [new TextRun({ text: '“' + text + '”', bold: true, size: 24 }), ...(note ? [new TextRun({ text: '  ' + note, color: MUTED })] : [])],
  spacing: { after: 100, line: 290 }, indent: { left: 360 },
  border: { left: { style: BorderStyle.SINGLE, size: 18, color: 'F5A623', space: 10 } },
});

const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: LINE };
const borders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
function T(rows, widths, { header = true } = {}) {
  const total = widths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: widths,
    rows: rows.map((r, i) => new TableRow({
      tableHeader: header && i === 0,
      children: r.map((c, j) => new TableCell({
        borders,
        width: { size: widths[j], type: WidthType.DXA },
        shading: header && i === 0 ? { fill: RAISED, type: ShadingType.CLEAR, color: 'auto' } : undefined,
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: String(c).split('\n').map((line) => new Paragraph({ children: runs(line, header && i === 0 ? { bold: true, size: 18, color: MUTED } : { size: 19 }), spacing: { after: 40, line: 270 } })),
      })),
    })),
  });
}
const Gap = () => new Paragraph({ children: [], spacing: { after: 120 } });
function Callout(lines, fill = SOFT) {
  return new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: [W],
    rows: [new TableRow({ children: [new TableCell({
      borders: { top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, left: { style: BorderStyle.SINGLE, size: 24, color: 'F5A623' } },
      width: { size: W, type: WidthType.DXA }, shading: { fill, type: ShadingType.CLEAR, color: 'auto' },
      margins: { top: 140, bottom: 140, left: 220, right: 220 },
      children: lines.map((l) => new Paragraph({ children: runs(l), spacing: { after: 80, line: 290 } })),
    })] })],
  });
}
function Fig(file, w, h, caption) {
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: 'png', data: fs.readFileSync(file), transformation: { width: w, height: h }, altText: { title: caption, description: caption, name: file } })], spacing: { before: 120, after: 80 } }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: runs(caption, { size: 18, color: MUTED, italics: true }), spacing: { after: 200 } }),
  ];
}
// A movement page block
function Movement(name, tree, rows) {
  return [H2(`${name}: ${tree}`), ...rows.map(([k, v]) => Label(k, v))];
}
function Dimension(num, name, tree, q, tue, act, watch) {
  return [
    H3(`${num}  ${name}`),
    new Paragraph({ children: [new TextRun({ text: tree, italics: true, color: TEAL })], spacing: { after: 80 } }),
    Label('Question', q), Label('An ordinary Tuesday', tue), Label('Look and act', act), Label('Watch for', watch),
  ];
}

const children = [];

// ---------- COVER ----------
children.push(
  new Paragraph({ children: [], spacing: { before: 1200 } }),
  Kicker('UnconstrainED Master Framework · Version 3'),
  new Paragraph({ children: [new TextRun({ text: 'The UnconstrainED Tree', bold: true, size: 72, color: INK })], spacing: { after: 120 } }),
  new Paragraph({ children: [new TextRun({ text: 'Prune. Graft. Grow.', bold: true, size: 40, color: ACCENT })], spacing: { after: 360 } }),
  Lead('A framework for strategic change and growth, for schools and every organization that wants technology to extend its people rather than replace them.'),
  ...Fig('tree.png', 380, 380, 'Figure 0. The UnconstrainED Tree: roots, soil, trunk, three limbs, branches and saplings.'),
  Small('Version 3 · 25 September 2026 · Internal working document · Supersedes v0.2. Prepared by UnconstrainED with Claude. Fonts in this file fall back to Arial; figures use the brand faces.'),
);

// ---------- CONTENTS ----------
children.push(H1('Contents'), new TableOfContents('Contents', { hyperlink: true, headingStyleRange: '1-2' }), Small('Right-click and choose Update Field if the contents appear empty.'));

// ---------- 1. THE TREE ON ONE PAGE ----------
children.push(
  H1('1. The tree on one page'),
  Lead('Every organization is a tree its people tend together. Tools, including AI, can help the gardeners. They cannot do the growing.'),
  P('Our own mark already draws the idea: a living trunk with circuitry in its branches. Technology extends an organization’s reach. It never replaces the trunk. The UnconstrainED Tree turns that picture into a working framework.'),
  T([
    ['Part of the tree', 'What it holds in the framework', 'The question it asks'],
    ['The trunk', 'The central question', 'What do we choose to make possible, and for whom?'],
    ['The roots', 'Eight guiding principles', 'Does this work pass our principles?'],
    ['The soil', 'The conditions for change: time, permission, relationships, capability, governance', 'Can people actually do this in ordinary work?'],
    ['Limb 1: Prune', 'Time', 'What can we cut back so new growth has energy?'],
    ['Limb 2: Graft', 'Transformation', 'What new practice will take on our roots?'],
    ['Limb 3: Grow toward', 'Direction', 'Which light are we reaching for, and who will sit in the shade?'],
    ['The ring', 'Six movements that make one growing cycle', 'Listen, Make meaning, Choose, Build capacity, Redesign, Learn and renew'],
    ['The branches', 'Nine dimensions: where to look', 'Which part of practice explains what we see?'],
    ['The saplings', 'New staff, juniors, learners: the future of the tree', 'Are we protecting the pathways by which people grow into expertise?'],
    ['The rings, read later', 'The decision and learning record', 'What did we decide, what happened, and why?'],
  ], [2000, 3326, 3700]),
  Gap(),
  H2('Tell it to a child'),
  Callout(['Our school is a tree we all look after. Every season we cut off the dead twigs so new branches have room, sometimes we add a branch from another tree, and we help it reach for the sun. There is a very old story about a farmer who pulled on his plants to make them grow faster. By morning they had all died. Tools can help us look after the tree. They cannot do the growing.']),
  Gap(),
  H2('Tell it to the room'),
  Callout(['Look at our logo: a living trunk with circuitry in the branches. Technology extends the reach. It never replaces the trunk. Each season we ask three questions. What do we prune? What do we graft? Which light do we grow toward? Each cycle of work leaves a ring you can read later: the good years, the droughts, and what you decided.']),
  Gap(),
  H2('Three promises the tree makes'),
  ...B([
    '**People do the growing.** Tools extend people’s reach; the thinking, judgment and relationships stay human. (Author Before Tool.)',
    '**Freed energy has a destination.** Whatever we prune, we decide where the energy goes, and it goes to human work. We prune tasks, never people. (Redeploy, don’t cut.)',
    '**Growth is cumulative and visible.** Small tests, each cycle a ring, read and acted on. No binders.',
  ]),
);

// ---------- 2. THE TRUNK ----------
children.push(
  H1('2. The trunk: the central question'),
  Lead('What do we choose to make possible, and for whom?'),
  P('Everything in the framework flows through this question, the way everything in a tree flows through its trunk. It sits at the centre of the ring (Figure 1) because every cycle starts and ends with it.'),
  P('The question has two halves and both matter. **"What do we choose to make possible"** insists on a choice: an organization cannot pursue every good thing at once. **"For whom"** insists on a beneficiary: students, families, staff, customers, residents, patients or communities. A direction without a named beneficiary is a slogan.'),
  H2('Why a question and not a vision statement'),
  ...B([
    'A question can be asked on an ordinary Tuesday by anyone in the organization. A vision statement is usually recited.',
    'A question stays open to evidence. When conditions change, the answer can change; the trunk stays the same.',
    'A question invites the people affected into the decision. That is the Collaborative Companion principle in action.',
  ]),
  H2('Growth, defined by the tree’s owners'),
  P('Growth can mean stronger capability, better service, deeper trust, resilience, financial sustainability, or carefully chosen expansion. Each organization defines the benefit and the trade-offs. A tree can grow taller, stronger, wider or more fruitful; it cannot do all four in one season.'),
);

// ---------- 3. THE ROOTS ----------
children.push(
  H1('3. The roots: eight principles'),
  P('Roots are unseen and they hold everything up. The eight principles are how UnconstrainED behaves and how we judge our own work. The names and tests below keep the founding wording. Each completes the sentence “A piece of work passes this principle if…” [S1]'),
  T([
    ['Root', 'The test'],
    ['Collaborative Companion', 'it invites the reader into decisions and offers choices rather than issuing verdicts, mandates, or a single correct path.'],
    ['Provocative and Assumption Challenging', 'it names an assumption, an uncomfortable trade-off, or a question the client has been avoiding, including its own premises.'],
    ['Human First', 'it is explicit about the effect on students, families, staff, and communities, and does not let efficiency, tooling, or capability language stand in for that.'],
    ['Author Before Tool', 'the human does the thinking first and the tool extends it. It fails whenever the tool sets the direction and the person is left editing or approving.'],
    ['Expertise with Humility', 'it says what we actually recommend and why, names the limits, risks, and unknowns, and leaves visible room to disagree.'],
    ['Adaptable and Adaptive', 'it anticipates the range in the room and offers real alternatives, instead of assuming one skill level, one stack, one culture, or one kind of school.'],
    ['Foresight and Sense Making', 'it connects specifics to durable patterns and judgement the reader can reuse after today’s tools change or disappear.'],
    ['Playful and Possibility Minded', 'it feels light where it can afford to be and opens up imagination, rather than defaulting to compliance framing, risk language, or corporate flatness.'],
  ], [2600, 6426]),
  Gap(),
  H2('Roots outside education'),
  P('Human First names students, families, staff and communities. In other sectors, translate it to the people affected: employees, customers, residents, patients, members, partners. Keep the education wording as the source.'),
  P('Author Before Tool assigns humans responsibility for purpose, standards, judgment and consequential choices. It does not require people to do every routine task by hand. When learning is the aim, name the thinking and practice people must do themselves. When automation is appropriate, keep accountable human decisions and useful checks.'),
);

// ---------- 4. THE SOIL ----------
children.push(
  H1('4. The soil: conditions for growth'),
  Lead('A gardener cannot make a tree grow. A gardener can make the soil good.'),
  P('The soil is everything around people that decides whether change can take root: time, permission, relationships, capability, information, incentives and governance. Most change efforts fail in the soil, not in the seed. People can perform a new practice in a workshop and still be unable to do it on a Tuesday because the timetable, the approvals or the workload have not changed.'),
  P('The evidence points the same way across sectors. In workplaces, organizational factors such as leadership modelling and policy explain more of AI’s impact than individual skill. In schools, teachers with formal guidance and protected practice time get more from new tools than those left alone. [See Section 14.]'),
  T([
    ['Soil condition', 'What healthy soil looks like', 'What poor soil looks like'],
    ['Time', 'Protected practice time with an owner and a cost', 'Change added on top of a full week'],
    ['Permission', 'People know which decisions are theirs', 'Every step needs an approval nobody owns'],
    ['Relationships', 'People can ask for help and raise a concern safely', 'Problems go quiet until they are public'],
    ['Capability', 'People can demonstrate the practice in real work', 'Attendance counted as competence'],
    ['Information', 'The right evidence reaches the people deciding', 'Decisions made on anecdote or vendor claims'],
    ['Governance', 'Clear rules on data, safety and accountability', 'Policy on paper, workarounds in practice'],
  ], [1800, 3613, 3613]),
  Gap(),
  P('**Feeding the soil** is the movement called Build capacity (Section 7). It includes skills, and it always includes the conditions around them.'),
);

// ---------- 5. THE THREE LIMBS ----------
children.push(
  H1('5. The three limbs: Prune, Graft, Grow toward'),
  P('Every season, the tree asks three questions together. They replace the three lenses of v0.2 (Time, Transformation, Direction) and map to the Acts in our service portfolio.'),
  T([
    ['Limb', 'Lens', 'The question', 'Portfolio Act'],
    ['Prune', 'Time', 'What can we cut back so new growth has energy?', 'Act I: Comfort, Capacity and Proficiency'],
    ['Graft', 'Transformation', 'What new practice will take on our roots?', 'Act II: Identity, Environment and Skills'],
    ['Grow toward', 'Direction', 'Which light are we reaching for, and who will sit in the shade?', 'Act III: Direction and Renewal (proposed)'],
  ], [1500, 1600, 3526, 2400]),
  Gap(),
  P('The limbs grow together. An engagement that starts with a small time problem still asks about direction from the first conversation, and a strategy engagement still asks what must be pruned to make room.'),

  H2('Limb 1: Prune (Time)'),
  Lead('What can we cut back so new growth has energy?'),
  P('Gardeners prune dead and crowded wood so the tree’s energy goes to the growth they want. In organizations, pruning means removing avoidable effort: duplicate reports, unnecessary approvals, routine drafting, and tasks tools can now do well.'),
  H3('Two rules of pruning'),
  ...B([
    '**Prune tasks, not people.** Capacity released through our work goes to human work and benefit, with pathways protected for new teachers and junior staff. This is our founding commitment, Redeploy, don’t cut. [S1]',
    '**Decide where the energy goes before you cut.** Prune a tree hard without a plan and it throws up suckers: fast, useless shoots that take the energy you freed. Freed time behaves the same way. Without a decision it fills with more email, more meetings and new administration.',
  ]),
  H3('What healthy pruning looks like'),
  ...B([
    'A named task, measured before and after, with setup, checking and rework counted as well as time saved.',
    'A named destination for the released time, such as a weekly student conference block, and a check that it happened.',
    'Some things deliberately kept. Not every constraint is dead wood; some protect people or make worthwhile work possible.',
  ]),

  H2('Limb 2: Graft (Transformation)'),
  Lead('What new practice will take on our roots?'),
  P('Grafting joins a new branch to living rootstock. The new growth lives from the old roots, and it only takes if the two are compatible. In organizations, grafting is how new practice, roles, relationships and systems join what already works.'),
  P('Artist Sam Van Aken grafted dozens of varieties of stone fruit onto single trees, the Tree of 40 Fruit. It is the best picture we have of learning from outside: the best of many orchards, grown on your own roots. [29]'),
  H3('Grafting from other orchards: Look outward'),
  P('Great organizations look outside their own ecosystem before they choose. UnconstrainED brings what leading schools and organizations are doing now, drawn from our experience, our network and our research, and sets it beside what the organization’s own people said. Decision makers see what is out there, what is relevant to them and what is not. Their community’s wants and needs, hopes and fears take on more shape against that landscape, and outside practice only matters where it meets what the community actually said.'),
  ...B([
    '**Compatibility first.** A practice that worked elsewhere is a cutting, not a tree. Ask what rootstock it needs: which conditions, skills and values made it work there.',
    '**Graft small.** Join one branch, watch whether it takes, then decide. See the Graft card (Tool 4).',
    '**Keep the union visible.** Record where each practice came from, so the organization can explain and adapt it later.',
  ]),

  H2('Limb 3: Grow toward (Direction)'),
  Lead('Which light are we reaching for, and who will sit in the shade?'),
  P('Trees grow toward light. Organizations grow toward whatever they give their attention to, whether or not they chose it. The third limb makes the choice explicit: which future the organization wants to help create, and for whom.'),
  P('The shade is the long view. A school is full of people planting trees whose shade they will not sit in. In Paraná, where our first strategy client works, the azure jay is said to plant the araúcaria forest: it buries pine seeds for later and forgets some. [30, to verify]'),
  ...B([
    'Name the beneficiaries and the time frame. "Everyone, eventually" is not a direction.',
    'Say what the organization will stop, keep, improve, create or explore.',
    'Stress-test the choice against a few plausible futures. Light moves; a direction that only works in one future is fragile. [9]',
  ]),
);

// ---------- 6. THE RING ----------
children.push(
  H1('6. The ring: one growing cycle'),
  Lead('Cut through the trunk and you can read the tree’s history in its rings.'),
  ...Fig('ring.png', 560, 423, 'Figure 1. The ring. Six movements make one growing cycle around the central question. Each cycle leaves a ring; listening, the bark, continues throughout.'),
  P('The ring replaces v0.2’s cycle diagram. The six movements are unchanged in substance. What changes is the picture: each loop through the movements adds a ring, and the rings accumulate into a record the organization can read. Good years, droughts and decisions are all visible.'),
  T([
    ['Movement', 'In the tree', 'Produces'],
    ['Listen', 'Walk the orchard with the people who tend it', 'A change brief and a map of who decides'],
    ['Make meaning', 'Read the rings and test the soil', 'An evidence and assumptions map; rival explanations'],
    ['Choose', 'Pick the light to grow toward', 'A chosen direction, priorities and a decision record'],
    ['Build capacity', 'Feed the soil', 'A capacity plan: skills and conditions'],
    ['Redesign', 'Graft a test branch or plant a test row', 'A Graft card and comparable evidence'],
    ['Learn and renew', 'Read the new ring, prune, plan the next season', 'A Ring record: decision and reinvestment'],
  ], [2000, 3513, 3513]),
  Gap(),
  P('**Start anywhere the question needs you.** The ring is a cycle, not a staircase. A team may return to Listen when a new voice changes the question, or to Build capacity when a test shows that the soil, not the idea, is the problem.'),
  P('**The bark is listening.** It surrounds every ring. Listening does not stop after the first movement.'),
);

// ---------- 7. THE SIX MOVEMENTS ----------
children.push(H1('7. The six movements in detail'));
children.push(...Movement('Listen', 'walk the orchard', [
  ['Purpose', 'Understand the experience behind the request before settling on the problem or the solution.'],
  ['Ask', 'Whose ordinary Tuesday should improve? What already works? What has changed outside the organization? What is difficult to say here, and whose experience is missing?'],
  ['Do', 'Observe work, speak with affected people, review existing evidence, and invite accounts that contradict the sponsor’s starting explanation. Include those who bear the burden of change. Explain how contributions will influence decisions and what is outside the group’s authority. [5, 10]'],
  ['Produce', 'A short change brief (Tool 1), a stakeholder and decision-rights map, baseline evidence, strengths to preserve and open questions. Record consent and access arrangements.'],
  ['Ownership', 'A client lead coordinates listening; affected people check that the account represents them; the sponsor clarifies decision authority. UnconstrainED facilitates and challenges omissions.'],
  ['Move on or return', 'Move on when the team can describe the challenge with concrete examples and name the important gaps. Return when a relevant group is missing, the framing is disputed, or a new concern changes the aim.'],
]));
children.push(...Movement('Make meaning', 'read the rings and test the soil', [
  ['Purpose', 'Turn observations into plausible explanations without treating the first explanation as fact.'],
  ['Ask', 'What patterns recur? What conditions make them likely? Is the barrier capability, opportunity, motivation, authority, or a mismatch in purpose? What other explanation fits? [1–3]'],
  ['Do', 'Separate observation, interpretation, assumption and uncertainty. Choose the relevant branches (Section 8). Map the behaviour required and the rules, information, resources, relationships and incentives shaping it. Look at outside conditions: needs, demographics, economics, workforce and technology.'],
  ['Produce', 'An evidence and assumptions map (Tool 2), a Soil test (Tool 3), and two or more plausible explanations where the evidence allows. A few constraints worth investigating and protections worth keeping.'],
  ['Ownership', 'The working group develops interpretations with staff or community representatives and domain experts. The sponsor can challenge an interpretation but should not erase dissent from the record.'],
  ['Move on or return', 'Choose an explanation good enough for the next decision. If the evidence cannot separate explanations, design a small learning activity before a large intervention.'],
]));
children.push(Callout(['**Participation must be workable.** Offer paper, conversation, accessible digital tools and translation. AI accounts, English fluency, reliable connectivity and public speaking should not become entry requirements. Provide protected time and a way to contribute privately. Keep participants’ original words alongside reviewed translations.']), Gap());
children.push(...Movement('Choose', 'pick the light', [
  ['Purpose', 'Make explicit choices about the future the organization wants to help create and the work it will prioritize.'],
  ['Ask', 'Who should benefit, by when, and how? What will we keep, stop, improve, create or explore? Which trade-off are we accepting? What future conditions would make this choice less sensible?'],
  ['Do', 'Compare credible options, including doing less or keeping an existing practice. Look outward: set outside practice beside the community’s own account. Explore a few plausible futures and stress-test the choice. State whose input shaped the decision and who holds final authority. [9, 10]'],
  ['Produce', 'A chosen direction, a small set of priorities, a decision record, outcome and balancing measures, resources and a review date. Keep important disagreement visible.'],
  ['Ownership', 'The accountable decision-maker selects the direction within the organization’s governance. People doing and experiencing the work help define what is feasible and worthwhile.'],
  ['Move on or return', 'Move on when the choice has an owner, a meaningful benefit, credible resources and a way to learn. Return if the purpose is only “use more AI”, the benefits have no beneficiaries, or priorities exceed capacity.'],
]));
children.push(...Movement('Build capacity', 'feed the soil', [
  ['Purpose', 'Enable people to act, through ability and supportive working conditions.'],
  ['Ask', 'Who needs to do what differently? Can they do it, do they have the opportunity, and does it make sense to them? What time, permission, feedback, tools and support do they need? [1, 2]'],
  ['Do', 'Targeted practice, coaching, peer learning and task support. Change workload, access, incentives or decision rights when those are the real barriers. Offer alternatives for different roles and starting points. Protected practice time has an owner and a cost.'],
  ['Produce', 'A capacity plan naming the required behaviours, supports, owners and evidence of demonstrated use. Record what will stop or move to make room.'],
  ['Ownership', 'Line leaders provide the conditions; people doing the work shape the support; internal facilitators build the ability to continue. Outside specialists fill specific gaps.'],
  ['Move on or return', 'Build enough capacity for a credible first test. A certificate or attendance count is not evidence of capability. If people can perform in training but not in normal work, return to the soil before prescribing more training.'],
]));
children.push(...Movement('Redesign', 'graft a test branch', [
  ['Purpose', 'Turn direction into a bounded change in everyday practice.'],
  ['Ask', 'What is the smallest credible test of our explanation? Which part of the work, a relationship, a rule, a service or a resource needs to change? What do we predict?'],
  ['Do', 'Co-design the test with the people who will use and experience it. Record a baseline, scope, duration, owner, measures and limits. Protect valued capabilities and safeguards. The Model for Improvement is a useful method for repeated tests; credit its originators when you use it. [6]'],
  ['Produce', 'A Graft card (Tool 4) and a small body of comparable evidence, including setup, checking, rework and maintenance effort. Ask whether the change removed work or moved it to somebody else.'],
  ['Ownership', 'A local owner runs the test. A decision-maker authorizes resources and boundaries. Affected people can report problems without having to challenge a powerful sponsor in public.'],
  ['Move on or return', 'Stop when a pre-agreed boundary is crossed. Redesign when evidence challenges the prediction. Expand gradually when repeated evidence supports benefit and credible resources. When keeping a practice, document why and what would trigger reconsideration.'],
]));
children.push(...Movement('Learn and renew', 'read the new ring', [
  ['Purpose', 'Use the evidence to choose what happens next and make the organization less dependent on outside support.'],
  ['Ask', 'What changed, for whom, and under what conditions? What surprised us? Was capacity released, who controlled it, and where did it go? What do we keep, adapt, stop or test next?'],
  ['Do', 'Compare outcomes with the prediction and the baseline. Separate implementation problems from a weak idea. Review differences between groups, continuing costs and outside changes. Revisit direction when its assumptions no longer hold. [9, 11]'],
  ['Produce', 'A Ring record (Tool 5): the decision, the reinvestment, updated practices, named internal owners and the next review date.'],
  ['Ownership', 'The client owns the decisions, records, resources and routines. UnconstrainED supports interpretation, challenge and transfer of capability.'],
  ['Move on or return', 'Continue only where the purpose is still worthwhile and the evidence supports a next step. A good ending may be handing over, keeping a practice, or stopping.'],
]));

// ---------- 8. THE BRANCHES ----------
children.push(
  H1('8. The branches: nine places to look'),
  P('The nine dimensions are where to look when a team makes meaning of what it heard. Like branches, they grow from three main limbs of practice: work and learning, people, and systems. They are prompts for inquiry, not a scorecard. A short engagement may need only one or two. [S2]'),
  T([
    ['Limb of practice', 'Branches'],
    ['Work and learning', '1 Design for human judgment · 2 Quality you can trust · 3 Capabilities made real · 4 Contribution and pathways'],
    ['People', '5 Expertise, identity and agency · 6 Relationships, belonging and wellbeing · 7 Literacies and adaptive capability'],
    ['Systems', '8 Governance, safety and stewardship · 9 Strategy, foresight and evidence culture'],
  ], [2400, 6626]),
  Gap(),
  H2('Work and learning'),
  ...Dimension('1', 'Design for human judgment', 'No pulling on seedlings: the growing happens in the learner.', 'Where must people reason, create, decide or learn, and where can support remove unnecessary effort?', 'A person can explain an important judgment, recognize when assistance is unreliable, and get help without surrendering the decision.', 'Look at real tasks, work samples, explanations, error recovery and independent performance where learning matters. Redesign one task to make the required thinking visible.', 'Polished outputs that hide shallow understanding. Tools that give answers where the task was meant to build thinking.'),
  ...Dimension('2', 'Quality you can trust', 'Taste the fruit: attractive is not the same as ripe.', 'What would count as credible evidence of good work, learning or service?', 'People use shared criteria, review a sample together, and can tell an attractive output from a reliable result.', 'Review quality, beneficiary experience and outcomes over time. Combine work samples with observation or explanation, including oral explanation. Test a simpler assurance routine.', 'Compliance paperwork that replaces looking at actual quality. Detector scores used as proof.'),
  ...Dimension('3', 'Capabilities made real', 'No wind, no wood: capability is built through use.', 'Which capabilities does the chosen future require, and where can people practise and demonstrate them?', 'A stated capability such as judgment, collaboration or problem solving appears in assignments, feedback, role expectations and resource decisions.', 'Map a few priority capabilities to real work, practice opportunities and observable demonstrations. Remove contradictory incentives.', 'Graduate or employee profiles that exist only in strategy documents.'),
  ...Dimension('4', 'Contribution and pathways', 'Saplings: how people grow into the tree.', 'How do people connect their development to worthwhile contribution and future opportunities?', 'A learner or employee tackles an authentic problem, gets feedback from someone affected, and can see a next opportunity to contribute.', 'Review access to projects, mentoring, progression and partnerships. Test one supported pathway with a named beneficiary. Protect entry roles where tools could remove the junior work that builds expertise.', 'Prestigious opportunities going repeatedly to people who already have access. A forest with no saplings.'),
  H2('People'),
  ...Dimension('5', 'Expertise, identity and agency', 'The gardeners: who shapes the tree.', 'Can people use informed judgment, develop expertise and shape the changes affecting their work?', 'Someone can question a suggested approach, explain a professional decision, try a supported alternative and get useful feedback.', 'Examine real decision rights, coaching, role expectations and accounts of work. Offer voluntary role reflection or a small role experiment, with clear privacy boundaries. A person’s professional narrative is never a maturity rating. [13]', 'A gap between stated autonomy and actual approvals, workload or incentives.'),
  ...Dimension('6', 'Relationships, belonging and wellbeing', 'The shade and the shared roots.', 'Do relationships and working conditions support trust, participation, sustainable effort and the people served?', 'People have time for a consequential conversation, can ask for help, and can raise a concern without fear of humiliation or retaliation.', 'Combine interviews, workload patterns, observation and carefully interpreted pulse questions. Protect privacy. Test a protected relationship or feedback routine. In schools, keep a specific focus on belonging, relationships, wellbeing and oracy. [5]', 'Wellbeing activities that leave excessive demands untouched.'),
  ...Dimension('7', 'Literacies and adaptive capability', 'The leaves: how the tree reads the light and the weather.', 'What must people understand and practise to judge new information, tools and changing conditions?', 'People can investigate a claim, recognize uncertainty, make a reasoned choice about a tool, and explain its consequences for others.', 'Use realistic tasks and explanations rather than confidence alone. In AI-focused work this includes critical, creative and civic AI fluency: what a system can and cannot do, how outputs are checked, who may be affected, and when assistance should be declined.', 'Vendor fluency mistaken for durable capability.'),
  H2('Systems'),
  ...Dimension('8', 'Governance, safety and stewardship', 'The fence and the gardener’s rules.', 'Who is accountable for choices, resources, information and consequences for people?', 'People know which decisions they can make, which need review, how information may be used, and where to raise or resolve a problem.', 'Inspect decision records, procurement, data access, incident handling and actual practice. Clarify one recurring decision and its route. For AI, use a context-appropriate risk framework such as NIST as an input to local governance; guidance is not legal certification. Build a local annex for jurisdiction-specific rules, such as Brazil’s AI guidance for schools and data-protection law. [14]', 'Policies that exist on paper while routine work bypasses them; controls that add effort without protecting anyone.'),
  ...Dimension('9', 'Strategy, foresight and evidence culture', 'The rings: reading the tree’s own history.', 'Does the organization connect its purpose to choices, resources, evidence and plausible future conditions?', 'A team can explain why an activity matters, what evidence could change its view, and what it has stopped or revised.', 'Trace a priority into budgets, routines, measures and review decisions. Stress-test one choice against plausible futures. Keep an accessible record of learning and dissent. [3, 9]', 'Strategy that accumulates projects without making trade-offs.'),
  H2('A practice profile, not a score'),
  P('Replace maturity scores with a short description of practice for each branch you look at. The same organization may need to strengthen a basic capability in one place and protect an effective practice in another.'),
  T([
    ['Branch examined', 'Current practice and uncertainty', 'Chosen next practice and evidence'],
    ['Example: Relationships, belonging and wellbeing', 'Staff report little time for client conversations. The workload pattern is not yet observed.', 'Protect one weekly conversation block for four weeks; track whether it happens, who takes part, and what clients experience.'],
    ['Complete for this engagement', 'What can we observe? Whose view differs? What remains uncertain?', 'What change is worthwhile here? Who owns it? What evidence and review date will guide the next decision?'],
  ], [2400, 3313, 3313]),
);

// ---------- 9. SAPLINGS ----------
children.push(
  H1('9. The saplings: protecting the future of the tree'),
  Lead('A forest with no saplings is already dying.'),
  P('Every expert was once a junior who did the routine work and learned from it. New teachers, early-career staff, apprentices and students are the saplings of an organization. When tools take over junior work without redesigning it, the organization saves time now and loses its future experts.'),
  P('Labour-market evidence shows this is a live risk: early-career hiring has fallen in some AI-exposed occupations while experienced workers were less affected, and some employers are responding by redesigning junior roles rather than removing them. Treat these signals as reasons to protect pathways deliberately, not as settled forecasts. [See the research annex, docs/research/landscape-2026-09.]'),
  ...B([
    '**Keep the learning in junior work.** When a tool takes a routine task, redesign the role so the junior still practises the judgment the task used to teach.',
    '**Name the saplings in every pruning decision.** Who learned from the work we are removing, and where will they learn now?',
    '**Redeploy, don’t cut.** Released capacity goes to human work, and entry pathways stay open. Make the staffing implications explicit in every engagement scope. [S1]',
  ]),
);

// ---------- 10. ORDINARY TUESDAY ----------
children.push(
  H1('10. The ordinary Tuesday: a walk round the tree'),
  P('Our signature practice starts with one person’s ordinary Tuesday, not the showcase pilot. Walking round the tree on a normal morning shows what the organization is actually growing.'),
  ...N([
    '**Describe today.** What does a real person experience on an ordinary Tuesday? Use observations and mark what is assumed.',
    '**Find the branches.** Which of the nine branches explain that experience? Name a competing explanation.',
    '**Describe a worthwhile future Tuesday.** Who benefits, what is protected, and what trade-off does it need? Which light are we growing toward?',
    '**Prune, graft, grow.** What would we cut back, what would we graft on, and where would the freed energy go?',
    '**Plant a test row.** Design a small test with an owner, a time frame, the authority needed and the evidence to collect.',
    '**Set the ring date.** When will we read the result, and what would make us keep, adapt, stop or expand?',
  ]),
  P('End with a dated decision. Distinctiveness comes from this practice, its tools and its stories.'),
);

// ---------- 11. FORMATS ----------
children.push(
  H1('11. Using the tree: keynotes, workshops, partnerships'),
  P('No engagement needs the whole tree. A keynote uses the trunk, the three limbs and one story. A workshop walks round one tree. A partnership grows rings over time.'),
  H2('A keynote people can retell (30–45 minutes)'),
  H3('The 60-second opening'),
  Callout([
    'About 2,300 years ago, the philosopher Mencius told a story about a farmer from Song who was worried his crops were growing too slowly. So one day he went out and pulled on every seedling, to help them grow. He came home exhausted and proud. The next morning his son ran out to the field. Every plant had withered.',
    'That is the oldest warning about AI in school. The question was never whether we can make things grow faster. It is what we are pulling on, and what we are letting grow.',
    'Look at our logo. The roots and the trunk are alive. The circuitry is in the branches. Technology extends our reach. It never replaces the trunk. Today I want to show you three things every organization does each season: prune, graft and grow toward the light.',
  ]),
  Gap(),
  P('Then tell one person’s ordinary Tuesday, introduce the three limbs, and reveal a change whose results prompted a second decision. Show the ring only after the audience understands the person’s experience. Close by asking each person to name one thing to prune, one thing to graft and one light to grow toward. Check recall a week later: can people redraw the tree and retell the story?'),
  H2('A 90-minute working session: the tree walk'),
  T([
    ['Minutes', 'Activity', 'Output'],
    ['0–10', 'The trunk: purpose, decision rights and the seedling story', 'A shared question and boundaries'],
    ['10–25', 'Listen: hear current experience and look at evidence', 'An ordinary Tuesday account'],
    ['25–35', 'Show the tree; choose two or three branches', 'A focused inquiry'],
    ['35–70', 'The ordinary Tuesday exercise in small groups (Section 10)', 'A draft Graft card and ring date'],
    ['70–83', 'Challenge each test: whose experience is absent, what would change your mind?', 'Missing voices, alternatives and measures'],
    ['83–90', 'Agree owners and the next contact', 'A dated commitment and support needed'],
  ], [1400, 4626, 3000]),
  Gap(),
  P('A workshop succeeds when people can take a supported next step. It cannot promise transformation in 90 minutes. Arrange follow-up before the session ends.'),
  H2('Partnerships: a growing year'),
  P('A partnership repeats the ring around consequential choices. Agree an accountable sponsor, a client lead, local owners, access to affected people, and the decisions reserved to each role. In a small organization one person may hold several roles; the responsibilities still need to be visible.'),
  T([
    ['Period', 'Work and evidence', 'Client ownership'],
    ['First 30 days', 'Listen, set a baseline, clarify the challenge, choose a first test', 'Sponsor agrees purpose and resources; local owner shapes the test'],
    ['Days 31–60', 'Feed the soil and graft a test branch; review benefit, workload and different experiences', 'Local team runs the work and records what happened'],
    ['Days 61–90', 'Read the ring: keep, adapt, stop or expand; check reinvestment and transfer', 'Client leads the review and owns the next cycle'],
    ['Ongoing', 'Short learning checks, periodic decision reviews, revisit direction when signals warrant', 'Internal facilitators keep the record and convene the work'],
  ], [1700, 4163, 3163]),
  Gap(),
  P('These periods are starting options, not requirements. Match the cadence to the feedback available, the organizational calendar and the cost of a wrong choice. Define the handover from the start: which capabilities the client will own, where records live, who convenes reviews, and how outside support reduces. Independence is a legitimate success.'),
  H2('A first application: International School of Curitiba'),
  P('The proposed strategic direction work with the International School of Curitiba follows the ring over 18 months. It is a proposal, not a completed case. [S1]'),
  T([
    ['Proposed period', 'Movement', 'Focus'],
    ['October 2026', 'Launch', 'The trunk: agree the shared question with the Head of School and the Board'],
    ['November 2026 – January 2027', 'Listen', 'Walk the orchard across the whole community'],
    ['February 2027', 'Make meaning', '“What We Heard” report and briefings'],
    ['February – March 2027', 'Look outward (graft)', 'The Landscape Brief: where great schools are now, set beside what the community said'],
    ['March 2027', 'Make meaning, deeper', 'Gaps and Questions brief; sharpened choices'],
    ['April 2027', 'Choose', 'Two days on site to choose the light to grow toward'],
    ['May 2027 – April 2028', 'Build capacity, Redesign, Learn and renew', 'A growing year of tests, reviews and renewal; an optional strategy companion from June 2027'],
  ], [2600, 2200, 4226]),
  Gap(),
  P('Curitiba’s name is usually traced to the Tupi-Guarani for “many pines”, and the araúcaria is the symbol of Paraná. The tree is a natural story for this first client. [31, to verify]'),
);

// ---------- 12. READING THE RINGS: MEASURES ----------
children.push(
  H1('12. Reading the rings: measuring what grew'),
  P('Agree a small set of measures for the chosen change. Separate the outcomes people value from implementation, capability and experience. Use a baseline and repeated observations where possible, and record other changes that could explain the result. A local before-and-after comparison rarely proves causality by itself. [6, 11]'),
  T([
    ['What to read in the ring', 'Useful evidence', 'Mistake to avoid'],
    ['Human and strategic benefit (the fruit)', 'The service, learning, quality, sustainability or experience the organization chose to improve', 'Treating activity or tool use as the benefit'],
    ['Implementation (did the graft take?)', 'Actual use, feasibility, acceptability, cost and persistence', 'Assuming a good idea was actually enacted'],
    ['Capability and judgment (the wood)', 'Demonstration in real work; independent performance where that is the aim', 'Equating confidence or attendance with competence'],
    ['Experience and distribution (the shade)', 'Accounts of agency, relationships, workload, and who benefits or carries extra work', 'Letting an average hide a burdened group'],
    ['Unwanted effects (suckers and rot)', 'Errors, delay, exclusion, loss of learning, shifted work, new maintenance', 'Counting only the intended positive result'],
    ['Durability (next season)', 'Use and benefit under ordinary support, budgets and staff turnover', 'Generalizing from an unusually supported pilot'],
  ], [2600, 3513, 2913]),
  Gap(),
  H2('Accounting for pruned energy'),
  P('Estimate net capacity over a defined period: effort avoided minus setup, learning, checking, coordination, rework and maintenance. State the source of the estimate and its uncertainty. Time saved on one task is not automatically less total workload or better service.'),
  P('Record who controls the released time, where it is meant to go, and whether it got there. Thirty minutes saved on preparation creates relational value only if a useful conversation becomes possible and happens. Ask whether another role quietly absorbed the work. That is the sucker test.'),
  H2('Reflection, with honest claims'),
  P('Role narratives, metaphors (including this one) and job-description exercises can support reflection. Changes in self-description do not by themselves show changed practice or benefit. Keep optional reflection separate from performance assessment, and triangulate willing participants’ accounts with observable practice. Any new survey or score needs its own development and testing. [S1, 13, 15]'),
);

// ---------- 13. TECHNOLOGY ----------
children.push(
  H1('13. Technology in the branches'),
  Lead('Tools extend the reach. They never replace the trunk.'),
  P('Start with the work and the people affected. Specify the purpose, the thinking humans must keep, the assistance that could help, and the standards for checking results. Always include a credible option that uses no new technology. Evidence from AI studies varies by task, design, experience and setting, so local testing is still needed. [16–22]'),
  T([
    ['Decision', 'Practical question'],
    ['Purpose and authority', 'What are we trying to improve, who decides, and who is accountable?'],
    ['Human capability', 'What must people understand or practise to judge the result and recover from error?'],
    ['Task and information', 'What information is needed, may be used, and should stay outside the system?'],
    ['Checking and alternatives', 'How will errors be caught, and how will work continue if the tool is unavailable or unsuitable?'],
    ['Value and continuing cost', 'What benefit remains after review, rework, integration, training and maintenance?'],
  ], [2600, 6426]),
  Gap(),
  H2('The seedling rule'),
  P('Where the purpose is learning, design tools that scaffold the thinking rather than do it. Hints, questions, explanations and teacher-designed guardrails help; answer-giving that replaces practice can raise practice scores while lowering what people can do alone (Section 14). Where the purpose is automation, keep accountable human decisions and useful checks.'),
  H2('An optional strategy companion'),
  P('A strategy companion could help retrieve agreed documents, connect decisions to their sources, prepare review questions and draft summaries: a way of reading the rings. Treat it as an optional service until its purpose and operating model are approved. It is useful only when it makes the organization’s reasoning easier to inspect and carry forward. [S1]'),
  ...B([
    'Start with bounded retrieval and drafting. Show source and date, separate proposals from agreed decisions, and keep unresolved questions and dissent visible.',
    'Assign an accountable owner; define access, retention, correction, evaluation and an export or shutdown route. Test realistic, missing, conflicting and inappropriate requests before use.',
    'Keep consequential decisions with authorized people. The companion never infers consensus, rates professional identity or makes personnel decisions.',
    'Keep usable records outside the companion so the organization keeps its knowledge if the service ends. Use NIST’s generative AI profile as risk guidance, not as proof of safety. [14]',
  ]),
);

// ---------- 14. EVIDENCE ----------
children.push(
  H1('14. What the evidence can and cannot support'),
  P('These studies sharpen design questions. Each result belongs to a particular intervention, population, comparison and period. The design implications are our interpretations, not tests of this framework.'),
  H2('Pulling on seedlings: assisted performance and learning can diverge'),
  P('Bastani and colleagues studied GPT-4 support in mathematics at one Turkish high school. Unrestricted assistance improved practice performance but reduced later unaided exam scores by 5.4 percentage points, about 17% relative to the control mean. A teacher-informed tutor largely removed that penalty but did not produce a detectable improvement over control. The main analytic sample was 839 students; outcomes were short-term. [16]'),
  P('**Design implication:** assess what learners can do alone when independent capability is the aim.'),
  H2('A good graft: a purpose-built tutor'),
  P('Kestin and colleagues used a randomized crossover design across two lessons with 194 Harvard physics students. A purpose-built AI tutoring condition produced larger immediate quiz gains than active-learning instruction. The intervention combined structured activities, expert prompting, videos and self-paced work, so it cannot isolate a generic AI effect, and it does not establish long-term retention. [17]'),
  P('**Design implication:** study the whole learning design and test transfer and durability before generalizing.'),
  H2('Pruning that holds: preparation time'),
  P('An EEF/NFER randomized trial found that ChatGPT with a guide reduced recorded preparation time for Year 7–8 science lessons by 31% (56.2 rather than 81.5 minutes a week). The primary analysis included 211 teachers in 66 schools. A blinded panel found no quality difference in 30 sampled resource sets. It does not show a pupil-learning benefit or a change in total workload. [18]'),
  P('**Design implication:** measure the actual task, the checking cost and where the time goes.'),
  H2('Who gains: novices and experts'),
  P('The final Quarterly Journal of Economics paper on generative AI at work studied 5,172 customer-support agents. A staggered rollout, analysed quasi-experimentally, was associated with a 15% average increase in issues resolved per hour and about 30% for less-experienced workers; the most skilled saw little benefit and small quality declines. It was not a randomized trial and covers one company. [19]'),
  P('METR’s early-2025 randomized study of 16 experienced developers found AI access increased completion time by 19% even though participants believed it sped them up. A February 2026 follow-up gave reasons to expect speed-ups with newer tools but could not produce a reliable updated estimate. The 19% figure is historical. [20, 21]'),
  P('**Design implication:** look at experience, quality and workload by group, and measure actual performance rather than perceived speed.'),
  H2('Feeding the gardener: support for human tutors'),
  P('The November 2025 Tutor CoPilot working paper reports a randomized study of 783 tutors and about 1,000 students. Access increased session exit-ticket passing by 4 percentage points overall and 9 points for students with lower-rated tutors. The tool supported human tutors during their work. Session-level results do not establish year-end gains. [22]'),
  P('**Design implication:** look for assistance that strengthens the human relationship or professional decision, and count the full costs.'),
  H2('Read the studies together'),
  P('The findings fit a context-dependent account: assistance can help a task while changing what people practise, learn or must check. Keep human judgment, examine the design, and measure the outcome that matters. Do not turn any one study into a universal promise or ban. Keep an evidence record for every public claim: source, date, design, population, comparison, outcome, main result and limit. Refresh volatile claims before each public presentation. [4]'),
);

// ---------- 15. TOOLS ----------
children.push(
  H1('15. Five working tools'),
  P('Use these as editable prompts. Keep each record as short as the decision allows. A small team can use one shared page; a larger institution can link the same fields to its governance systems.'),
  H2('Tool 1: The Tree card (change brief)'),
  T([
    ['Field', 'Complete for this change'],
    ['The trunk', 'What do we choose to make possible, and for whom?'],
    ['Ordinary Tuesday', 'Describe one ordinary Tuesday with observations and the people affected.'],
    ['Grow toward', 'What should improve, for whom, by when? Why does it matter?'],
    ['Roots and protections', 'What must be preserved, and why? Which principles are most at stake?'],
    ['Prune', 'What could we stop, reduce or hand to a tool? Where will the freed energy go?'],
    ['Graft', 'What new practice, role or relationship could join what works? From which orchard?'],
    ['Authority and participation', 'Who decides, who owns the work, who contributes, and whose experience is missing?'],
    ['Soil and trade-offs', 'What time, attention, budget or work must move? Who carries the cost?'],
    ['Ring date', 'What do we know now, what would count as worthwhile change, and when will we review?'],
  ], [2400, 6626]),
  Gap(),
  H2('Tool 2: Reading the rings (evidence and assumptions map)'),
  T([
    ['Entry type', 'Record'],
    ['Observation', 'What was directly observed or measured? Source, date, scope and limits.'],
    ['Interpretation', 'What might explain it? Include a credible alternative.'],
    ['Assumption', 'What are we relying on without enough evidence? Why does it matter?'],
    ['Future condition', 'What outside change could alter the decision? What signal will we watch?'],
    ['Missing or different view', 'Whose experience is absent or inconsistent with the current account?'],
    ['Next inquiry', 'What is the smallest useful way to reduce important uncertainty? Who owns it?'],
  ], [2400, 6626]),
  Gap(),
  P('Separate what participants said, what the team inferred and what was decided. A precise source is more useful than a confident label.'),
  H2('Tool 3: The Soil test (behaviour and conditions map)'),
  P('Start with a specific behaviour in context: “When this happens, this person or group needs to do this.” Examine the barriers with the people involved. COM-B provides the diagnostic structure; add authority and system conditions explicitly. [2, 3]'),
  T([
    ['Area', 'Questions'],
    ['Capability', 'What knowledge, skill, judgment or support is needed? What can people already show?'],
    ['Opportunity', 'Is there time, access, permission, equipment, a usable workflow and social support?'],
    ['Motivation and meaning', 'Does the change seem worthwhile? What habits, concerns, losses or incentives matter?'],
    ['System and authority', 'Which rules, information flows, priorities and decision rights create the current pattern?'],
    ['Chosen response', 'Which condition will change, who can change it, and what will show whether it helped?'],
  ], [2400, 6626]),
  Gap(),
  H2('Tool 4: The Graft card (experiment card)'),
  T([
    ['Field', 'Complete before the test'],
    ['Hypothesis', 'If we change ___ for ___, we expect ___ because ___. What result would challenge this?'],
    ['Cutting and rootstock', 'Where does this practice come from? What conditions made it work there, and do we have them?'],
    ['Scope and owner', 'People, work, place, duration, owner and authorizing decision-maker.'],
    ['Baseline and comparison', 'What happens now? What comparison is credible and proportionate?'],
    ['Soil needed', 'What practice, protected time, resources, permissions or support does the test need?'],
    ['Measures', 'Benefit, implementation, capability where relevant, experience and unwanted effects (suckers).'],
    ['Boundaries', 'What must be protected? What would require stopping or escalation?'],
    ['Ring date', 'Review date and criteria for keeping, adapting, stopping or expanding. Who takes part and who decides?'],
  ], [2400, 6626]),
  Gap(),
  H2('Tool 5: The Ring record (decision and reinvestment record)'),
  T([
    ['Field', 'Complete at review'],
    ['Result and confidence', 'What happened compared with the prediction and baseline? What else could explain it?'],
    ['Different experiences', 'Who benefited, who carried extra work, and whose evidence is missing?'],
    ['Decision and rationale', 'Keep, adapt, stop or expand. Reason, dissent, decision-maker, owner and date.'],
    ['Pruned energy', 'What was released after setup, learning, checking, rework and maintenance? How was it estimated?'],
    ['Destination and control', 'Who controls the capacity, what will it support, and when will we check it happened?'],
    ['Saplings', 'Did the change affect how new or junior people learn? What protects their pathway?'],
    ['Next season', 'What budget, support, records and internal capability are needed? When is the next review, and who leads it?'],
  ], [2400, 6626]),
);

// ---------- 16. WORKED EXAMPLES ----------
children.push(
  H1('16. Two worked examples'),
  P('These are fictional illustrations of how to use the framework, not client results.'),
  H2('A school prunes preparation and protects thinking'),
  P('**Listen.** Teachers want more time to discuss learning with students. Preparation takes long, and they worry that attractive AI-assisted work can hide weak understanding. Students want useful help and fair ways to show what they know.'),
  P('**Make meaning and choose.** The team picks three branches: design for human judgment, quality you can trust, and relationships. It chooses two linked aims: prune avoidable preparation effort, and protect evidence of students’ independent reasoning.'),
  P('**Build capacity and redesign.** A department lead and teachers design a four-week test: an approved preparation assistant, human review of materials, and a short explanation task students complete without assistance. The soil includes practice with the assistant, shared examples of acceptable materials and protected review time.'),
  P('**Learn and renew.** The team records preparation and checking effort, samples material quality, examines students’ explanations, and checks whether the planned student conferences happen, which is the destination for the pruned time. If effort falls and conferences happen without weaker evidence of learning, extend the test. If checking eats the gains, redesign or stop. If students produce strong work but cannot explain it, return to the design. More AI use is never the aim.'),
  H2('A small service organization prunes without any new technology'),
  P('**Listen.** A ten-person organization wants better service without exhausting its team. Staff describe an ordinary Tuesday full of duplicate internal reports and waiting for approvals. Clients repeat their story to several people. The sponsor assumes another productivity platform is needed.'),
  P('**Make meaning and choose.** A simple work sample shows two reports use the same information. The team chooses to prune one duplicate report while keeping a safeguarding review that protects clients. Branches: relationships, governance and strategy. No new software.'),
  P('**Redesign and learn.** For three weeks a named owner runs the simpler reporting process and tests a clearer handover. The sponsor reserves the released time for a weekly client follow-up block so it cannot fill with suckers. At review the team asks whether the reduction happened, whether work moved to someone else, and whether clients experienced better continuity. The internal lead continues the review after outside support ends.'),
  P('Both examples use the same trunk, limbs and ring. The scale of redesign and the role of technology differ because the purpose and evidence differ.'),
);

// ---------- 17. STORY BANK ----------
children.push(
  H1('17. The story bank'),
  P('Stories make the tree travel. Use them precisely; the edge comes from true mechanics, never from “grow your people”. Items marked *to verify* need a checked source before public use.'),
  T([
    ['Line', 'The story behind it', 'Use it for', 'Status'],
    ['“The oldest warning about AI in school is 2,300 years old.”', 'Mencius: the farmer of Song who pulled on his seedlings to help them grow; they withered.', 'Design for human judgment; the seedling rule', 'Source: Mencius 2A:2 [32]'],
    ['“Prune tasks, not people.”', 'Pruning redirects a tree’s energy to the growth you want.', 'Time; Redeploy, don’t cut', 'Our commitment [S1]'],
    ['“Cut without a plan and the tree throws up suckers.”', 'Heavy pruning provokes fast, vigorous shoots that waste energy.', 'Where freed time goes', 'Horticultural practice [33]'],
    ['“No wind, no wood.”', 'Trees grown without mechanical stress form weaker wood.', 'Productive struggle; capabilities made real', 'To verify wording [34]'],
    ['“The Tree of 40 Fruit.”', 'Sam Van Aken grafted many stone-fruit varieties onto single trees.', 'Look outward; grafting', '[29]'],
    ['“A forest with no saplings is already dying.”', 'Forests renew through young trees.', 'Protecting entry pathways', 'Metaphor'],
    ['“Every ring is a year you can read.”', 'Tree rings record good years, droughts and fires.', 'Decision records; evidence culture', 'Dendrochronology [35]'],
    ['“The jay plants the forest.”', 'In Paraná the azure jay buries araúcaria seeds and forgets some.', 'Grow toward: planting shade for others', 'To verify [30]'],
    ['“A city named for its pines.”', 'Curitiba’s name is usually traced to the Tupi-Guarani for many pines.', 'Curitiba engagements', 'To verify [31]'],
  ], [2400, 2926, 2000, 1700]),
);

// ---------- 18. GLOSSARY ----------
children.push(
  H1('18. From v0.2 to v3: what changed'),
  P('v0.2 used five metaphor worlds at once: Acts (theatre), movements (music), lenses (optics), Landscape (geography) and authorship (writing). v3 keeps the substance and moves everything into one world, the tree.'),
  T([
    ['v0.2', 'v3', 'Why'],
    ['Central question', 'The trunk', 'Everything flows through it'],
    ['Eight principles', 'The roots (wording preserved)', 'Unseen and load-bearing'],
    ['Three lenses: Time, Transformation, Direction', 'Three limbs: Prune, Graft, Grow toward', 'Verbs people can remember and act on'],
    ['Six movements (cycle diagram)', 'The ring (Figure 1)', 'An ownable picture; cycles accumulate into a readable record'],
    ['Walk alongside and renew → Learn and renew', 'Learn and renew: read the new ring', 'Kept from v0.2'],
    ['Nine dimensions (the Landscape)', 'The branches, on three limbs of practice', 'Where to look; the education Landscape remains the school expression'],
    ['Conditions (spread across sections)', 'The soil', 'Makes conditions a first-class part of the model'],
    ['Redeploy, don’t cut; entry pathways', 'The saplings; prune tasks, not people', 'Makes the commitment visible'],
    ['Look outward (proposal only)', 'Grafting from other orchards', 'Craig’s landscape idea, built into the framework'],
    ['Acts I, II, III', 'Kept as portfolio names, mapped to the three limbs', 'Service lineage preserved'],
    ['Authorship as organizing metaphor', 'Author Before Tool stays as a root principle', 'A principle, not a picture'],
    ['Tools 1–5', 'Tree card, Reading the rings, Soil test, Graft card, Ring record', 'Same fields, tree names, plus saplings and suckers checks'],
  ], [3000, 3213, 2813]),
  Gap(),
  H2('Decisions still to make'),
  ...B([
    'Confirm the framework name. Working title: The UnconstrainED Tree.',
    'Confirm the framework steward, portfolio status of Act III, and which assets are ready to deliver.',
    'Run the recall test: tell the tree in 60 seconds to five children and five professionals; a week later, ask them to retell and redraw it.',
    'Verify the story bank items marked to verify before any public telling.',
    'Commission the illustrated tree for keynotes, built from the brand mark rather than altering it.',
  ]),
  H2('Existing assets to carry forward'),
  T([
    ['Asset', 'Where it grows on the tree', 'Status'],
    ['Act I courses and the Four Ps of prompting (Purpose, Persona, Problem, Parameters)', 'Prune: build capability once purpose and task are clear', 'Confirm current versions'],
    ['Act II catalogue (22 courses) and role reflection', 'Graft: new practice, roles and relationships', 'Confirm delivery readiness'],
    ['AI Data Lab; SCAMPER for assessment', 'Graft and Build capacity', 'Confirm materials; credit underlying methods'],
    ['Cohorts, capstones, retreats, hackathons', 'Redesign: test rows and peer learning', 'Separate participation from measured benefit'],
    ['Empathy interviews, Appreciative Inquiry and SOAR, Three Horizons, Liberating Structures', 'Listen, Make meaning, Choose', 'Select and credit appropriately'],
    ['Strategy and leadership companions', 'Reading the rings', 'Pilot designs; confirm each status'],
    ['Landscape of Great Schools research (September 2026)', 'Grafting from other orchards', 'Verify claims before client use'],
  ], [3600, 3113, 2313]),
);

// ---------- 19. SOURCES ----------
const refs = [
  '[S1] UnconstrainED Transformation Framework, Guiding Document v0.1. Principles, Acts, movements, assets and the proposed Curitiba application.',
  '[S2] Landscape of Great Schools, working framework draft 0.1 (September 2026). The nine school dimensions. Research reports in docs/research/landscape-2026-09.',
  '[1] Weiner 2009. A theory of organizational readiness for change.',
  '[2] Michie and colleagues 2011. The behaviour change wheel (COM-B).',
  '[3] Meadows 1999. Leverage Points: Places to Intervene in a System.',
  '[4] Hughes 2011. Do 70 per cent of all organizational change initiatives really fail?',
  '[5] Edmondson 1999. Psychological Safety and Learning Behavior in Work Teams.',
  '[6] Associates in Process Improvement and IHI. Model for Improvement.',
  '[7] Thibodeau and Boroditsky 2011. Metaphors We Think With.',
  '[8] Tversky 2011. Visualizing Thought.',
  '[9] OECD 2025. Strategic Foresight Toolkit for Resilient Public Policy.',
  '[10] OECD 2022. Guidelines for Citizen Participation Processes.',
  '[11] Proctor and colleagues 2011. Outcomes for Implementation Research.',
  '[12] CRPE 2026. Early Adopter Districts and AI.',
  '[13] Ibarra 1999. Provisional Selves.',
  '[14] NIST 2024. AI Risk Management Framework: Generative AI Profile.',
  '[15] Weiner and colleagues 2017. Psychometric assessment of three implementation outcome measures.',
  '[16] Bastani and colleagues 2025. Generative AI without guardrails can harm learning. PNAS.',
  '[17] Kestin and colleagues 2025. AI tutoring outperforms in-class active learning. Scientific Reports.',
  '[18] EEF and NFER 2024. Using ChatGPT for KS3 science lesson preparation.',
  '[19] Brynjolfsson, Li and Raymond 2025. Generative AI at Work. Quarterly Journal of Economics.',
  '[20] METR 2025. Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity.',
  '[21] METR 2026. Updated evidence on developer productivity (24 February 2026).',
  '[22] Wang and colleagues 2025. Tutor CoPilot. Updated November working paper.',
  '[23]–[28] Kotter; Prosci ADKAR; Cynefin; Three Horizons (International Futures Forum); Theory U (Presencing Institute); Bridges Transition Model. Neighbouring methods; credit when used.',
  '[29] Sam Van Aken. Tree of 40 Fruit (artist’s project, from 2008).',
  '[30] Azure jay (gralha-azul) and araúcaria seed dispersal in Paraná. To verify with an ecological source.',
  '[31] Etymology of Curitiba from Tupi-Guarani. To verify with a municipal or linguistic source.',
  '[32] Mencius, Book 2A, Chapter 2: the man of Song who pulled up his seedlings.',
  '[33] Extension horticulture guidance on water sprouts after heavy pruning. Cite a specific extension service before public use.',
  '[34] Jaffe 1973. Thigmomorphogenesis: the response of plant growth and development to mechanical stimulation. Planta.',
  '[35] Dendrochronology: tree rings as records of climate and events. Cite a standard reference before public use.',
];
children.push(H1('19. Sources'), P('External references were reviewed for v0.2 in September 2026; story sources [29]–[35] are new in v3. Publication dates and evidence limits are part of each claim.'), ...refs.map((r) => new Paragraph({ children: runs(r, { size: 18 }), spacing: { after: 60 } })));

const doc = new Document({
  creator: 'UnconstrainED', title: 'The UnconstrainED Tree: Master Framework v3', description: 'UnconstrainED master framework, version 3',
  styles: {
    default: { document: { run: { font: FONT, size: 21, color: INK } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 40, bold: true, color: INK, font: FONT }, paragraph: { spacing: { before: 120, after: 240 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 28, bold: true, color: ACCENT, font: FONT }, paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 23, bold: true, color: INK, font: FONT }, paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 } },
    ],
  },
  numbering: { config: [
    { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] },
    { reference: 'num', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 360 } } } }] },
  ] },
  sections: [{
    properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'The UnconstrainED Tree · Master Framework v3 · Internal', size: 16, color: MUTED })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], size: 16, color: MUTED })] })] }) },
    children,
  }],
});
Packer.toBuffer(doc).then((buf) => { fs.writeFileSync('UnconstrainED_Master_Framework_v3_The_Tree.docx', buf); console.log('written', buf.length); });
