import React from 'react';
import { PageLayout } from '../components/PageLayout';
import { GrammarBreadcrumb } from '../components/GrammarBreadcrumb';
import { usePageTitle } from '../hooks/usePageTitle';

const PRONOUN_SECTIONS = [
  {
    title: 'Subject Pronouns (Pronombres Personales)',
    description: 'Used as the subject of a sentence — who is performing the action.',
    rows: [
      { spanish: 'yo', english: 'I', person: '1st singular', example: 'Yo hablo espanol.' },
      { spanish: 'tu', english: 'you (informal)', person: '2nd singular', example: 'Tu hablas muy bien.' },
      { spanish: 'el / ella / usted', english: 'he / she / you (formal)', person: '3rd singular', example: 'El vive en Madrid.' },
      { spanish: 'nosotros / nosotras', english: 'we', person: '1st plural', example: 'Nosotros estudiamos juntos.' },
      { spanish: 'vosotros / vosotras', english: 'you all (Spain)', person: '2nd plural', example: 'Vosotros sois amigos.' },
      { spanish: 'ellos / ellas / ustedes', english: 'they / you all (formal)', person: '3rd plural', example: 'Ellos van al parque.' },
    ],
  },
  {
    title: 'Direct Object Pronouns',
    description: 'Replace the direct object (the thing or person receiving the action). Placed before the verb.',
    rows: [
      { spanish: 'me', english: 'me', person: '1st singular', example: 'El me llama. (He calls me.)' },
      { spanish: 'te', english: 'you', person: '2nd singular', example: 'Yo te veo. (I see you.)' },
      { spanish: 'lo / la', english: 'him/it / her/it', person: '3rd singular', example: 'Yo lo compro. (I buy it.)' },
      { spanish: 'nos', english: 'us', person: '1st plural', example: 'Ella nos ayuda. (She helps us.)' },
      { spanish: 'os', english: 'you all', person: '2nd plural', example: 'Yo os invito. (I invite you all.)' },
      { spanish: 'los / las', english: 'them', person: '3rd plural', example: 'Yo los conozco. (I know them.)' },
    ],
  },
  {
    title: 'Indirect Object Pronouns',
    description: 'Indicate to whom or for whom an action is done. Also placed before the verb.',
    rows: [
      { spanish: 'me', english: 'to/for me', person: '1st singular', example: 'El me da el libro. (He gives me the book.)' },
      { spanish: 'te', english: 'to/for you', person: '2nd singular', example: 'Yo te digo la verdad. (I tell you the truth.)' },
      { spanish: 'le', english: 'to/for him/her/you', person: '3rd singular', example: 'Yo le escribo. (I write to him.)' },
      { spanish: 'nos', english: 'to/for us', person: '1st plural', example: 'El nos envia un mensaje. (He sends us a message.)' },
      { spanish: 'os', english: 'to/for you all', person: '2nd plural', example: 'Yo os preparo la cena. (I prepare dinner for you all.)' },
      { spanish: 'les', english: 'to/for them', person: '3rd plural', example: 'Yo les hablo. (I speak to them.)' },
    ],
  },
  {
    title: 'Reflexive Pronouns',
    description: 'Used when the subject and object are the same person — the action reflects back.',
    rows: [
      { spanish: 'me', english: 'myself', person: '1st singular', example: 'Yo me llamo Ana. (I call myself Ana.)' },
      { spanish: 'te', english: 'yourself', person: '2nd singular', example: 'Tu te duchas. (You shower yourself.)' },
      { spanish: 'se', english: 'himself/herself', person: '3rd singular', example: 'Ella se levanta temprano. (She gets up early.)' },
      { spanish: 'nos', english: 'ourselves', person: '1st plural', example: 'Nosotros nos divertimos. (We enjoy ourselves.)' },
      { spanish: 'os', english: 'yourselves', person: '2nd plural', example: 'Vosotros os sentais. (You all sit down.)' },
      { spanish: 'se', english: 'themselves', person: '3rd plural', example: 'Ellos se preparan. (They prepare themselves.)' },
    ],
  },
];

const TIPS = [
  { title: 'Dropping Subject Pronouns', text: 'In Spanish, subject pronouns are often dropped because verb conjugations already indicate the subject. "Hablo espanol" already means "I speak Spanish" without needing "yo".' },
  { title: 'Tu vs Usted', text: '"Tu" is informal (friends, family, peers). "Usted" is formal (strangers, elders, authority). In Latin America, "ustedes" is used for all plural "you", while Spain uses "vosotros" for informal.' },
  { title: 'Le/Les becomes Se', text: 'When an indirect object pronoun (le/les) comes before a direct object pronoun (lo/la/los/las), it changes to "se". Example: "Se lo doy" (I give it to him), not "Le lo doy".' },
];

export function Pronouns() {
  usePageTitle('Pronouns');
  const crumbs = [
    { label: 'Grammar', to: '/grammar' },
    { label: 'Topics', to: '/grammar' },
    { label: 'Pronouns' },
  ];

  return (
    <PageLayout backgroundColor="#FF4D01" navOverrideClass="[&_a]:text-[#FFFDE6] [&_button]:text-[#FFFDE6] [&_svg]:text-[#FFFDE6]">
      <div className="absolute top-0 left-0 right-0 h-[120px] bg-[#FF7032] origin-top-left -skew-y-3 pointer-events-none" />

      <div className="max-w-[700px] mx-auto px-4 sm:px-6 relative z-10">
        <div className="pt-8 pb-20">
          <GrammarBreadcrumb crumbs={crumbs} />

          <h1 className="font-inter font-bold text-[28px] leading-[36px] text-white mb-2">
            Spanish Pronouns
          </h1>
          <p className="font-inter text-[14px] leading-[22px] text-white/80 mb-10">
            Pronouns replace nouns to avoid repetition. Spanish has several types of pronouns, each used differently depending on the role in the sentence.
          </p>

          {PRONOUN_SECTIONS.map((section, si) => (
            <div key={si} className="mb-10">
              <h2 className="font-inter font-bold text-[18px] text-white mb-1">
                {section.title}
              </h2>
              <p className="font-inter text-[13px] leading-[20px] text-white/70 mb-4">
                {section.description}
              </p>

              <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                {/* Table Header */}
                <div className="grid grid-cols-[1fr_1fr_2fr] bg-[#FFE43C] px-4 py-3">
                  <span className="font-inter font-bold text-[13px] text-[#372213]">Spanish</span>
                  <span className="font-inter font-bold text-[13px] text-[#372213]">English</span>
                  <span className="font-inter font-bold text-[13px] text-[#372213]">Example</span>
                </div>

                {section.rows.map((row, ri) => (
                  <div
                    key={ri}
                    className={`grid grid-cols-[1fr_1fr_2fr] px-4 py-3 ${
                      ri < section.rows.length - 1 ? 'border-b border-[#F3F4F6]' : ''
                    }`}
                  >
                    <span className="font-inter font-semibold text-[14px] text-[#FF4D01]">
                      {row.spanish}
                    </span>
                    <span className="font-inter text-[13px] text-[#4B5563]">
                      {row.english}
                    </span>
                    <span className="font-inter italic text-[13px] text-[#6B7280]">
                      {row.example}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Tips Section */}
          <div className="mt-12 mb-8">
            <h2 className="font-inter font-bold text-[20px] text-white mb-4">
              Key Tips
            </h2>
            <div className="flex flex-col gap-3">
              {TIPS.map((tip, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <h3 className="font-inter font-bold text-[14px] text-[#FFE43C] mb-1">{tip.title}</h3>
                  <p className="font-inter text-[13px] leading-[20px] text-white/90">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
