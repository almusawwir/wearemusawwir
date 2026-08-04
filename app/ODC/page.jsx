"use client";

import { useState } from "react";

const faqs = [
  {
    question: "What is One Day Crew?",
    answer: "One Day Crew (ODC) is a curated weekly filmmaking community where strangers come together to create 15-30 second microfilms. We meet, split into small crews, shoot, laugh, improvise, grab dinner, and go home with stories worth remembering."
  },
  {
    question: "Do I need filmmaking experience?",
    answer: "Not at all.\nMost people are trying something for the first time.\nCuriosity matters more than experience."
  },
  {
    question: "I don't know acting. Can I still join?",
    answer: "Absolutely.\nYou can act, direct, shoot, write, storyboard, help with production, or simply be part of the crew.\nYou'll naturally find the role that excites you."
  },
  {
    question: "I'm an introvert. Will I fit in?",
    answer: "Definitely.\nYou don't have to be loud.\nYou just need to be willing to participate and collaborate.\nSome of our best crew members are introverts."
  },
  {
    question: "Is this a workshop?",
    answer: "No.\nNobody is standing with a PowerPoint presentation while everyone pretends to learn. 😭\nODC is about creating together.\nYou learn by making."
  },
  {
    question: "What exactly are we making?",
    answer: "Every session we create microfilms, usually 15-30 seconds long.\nThey're written around real locations so we can finish them in a single evening."
  },
  {
    question: "Are the stories already prepared?",
    answer: "Usually, yes.\nWe bring a few ready-to-shoot ideas.\nAs the community grows, members can also submit their own stories to be filmed in future sessions."
  },
  {
    question: "What if I have my own story?",
    answer: "Perfect.\nOnce you're part of ODC, you can submit your own microfilm ideas.\nIf they're suitable for the format, we'll shoot them together."
  },
  {
    question: "What if I'm shy?",
    answer: "Everyone is.\nThe first five minutes are awkward.\nThe next three hours usually aren't."
  },
  {
    question: "Do I have to be on camera?",
    answer: "No.\nBut everyone is encouraged to participate somehow."
  },
  {
    question: "Can I just observe?",
    answer: "Not really.\nODC works because everyone contributes.\nEven if it's something small."
  },
  {
    question: "Is this only for filmmakers?",
    answer: "No.\nIt's for actors, photographers, writers, editors, musicians, designers, storytellers, creators...\nOr anyone curious enough to try."
  },
  {
    question: "What kind of films do we make?",
    answer: "Anything.\nComedy. Cinematic. Poetry. Metaphors. Experimental. Romance. Thrillers. Absurd ideas.\nIf it can be told in 15-30 seconds and shot in real locations, it's fair game."
  },
  {
    question: "Where do you shoot?",
    answer: "Usually around Bangalore's lively public spaces.\nPlaces like:\n• Indiranagar\n• Church Street\n• Koramangala\n• Cubbon Park\n• Cafés\n• Streets\n• Parks\nBasically wherever the story belongs."
  },
  {
    question: "Is equipment provided?",
    answer: "Mostly yes.\nWe usually shoot on phones or lightweight cameras.\nYou don't need to own any equipment."
  },
  {
    question: "How many people join?",
    answer: "Usually around 10-15 people.\nSmall enough that everyone gets involved."
  },
  {
    question: "How long does it last?",
    answer: "Around 8 PM - 11 PM.\nSometimes conversations continue over dinner afterwards."
  },
  {
    question: "Is dinner included?",
    answer: "No.\nDinner is optional.\nMost people simply choose to hang out afterwards."
  },
  {
    question: "Can I smoke or drink?",
    answer: "Not during the session.\nIf you choose to smoke or drink later, please do it privately and don't encourage or involve other crew members."
  },
  {
    question: "What's the vibe like?",
    answer: "Creative.\nChaotic.\nSupportive.\nZero ego.\nLots of laughter."
  },
  {
    question: "Can I bring a friend?",
    answer: "Absolutely.\nThey'll need to complete the vibe check separately."
  },
  {
    question: "Why is there a vibe check?",
    answer: "Because we're building a community, not selling tickets.\nWe care more about the people than the numbers."
  },
  {
    question: "What if I'm not selected?",
    answer: "That's okay.\nSometimes we're simply trying to balance the crew.\nFeel free to apply again."
  },
  {
    question: "Is my ticket confirmed after filling the form?",
    answer: "No.\nYour spot is confirmed only after your vibe check is approved and payment is completed."
  },
  {
    question: "What's the refund policy?",
    answer: "Once your spot is confirmed, tickets are generally non-refundable.\nIf something unavoidable comes up, let us know as early as possible."
  },
  {
    question: "Why is it called One Day Crew?",
    answer: "Because we don't wait for the perfect day to create something meaningful.\nWe simply show up.\nOne day at a time."
  },
  {
    question: "What if I still have questions?",
    answer: "DM us.\nWe'll be happy to help."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-widest text-zinc-500 uppercase mb-3">
            One Day Crew (ODC)
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Frequently Asked Questions 🎬
          </h1>
          <p className="text-lg text-zinc-400">
            Everything you need to know about joining the crew, making microfilms, and showing up to create.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div 
                key={index} 
                className="border border-zinc-800 rounded-2xl bg-[#121212] overflow-hidden transition-colors hover:border-zinc-700"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-50"
                >
                  <span className="text-lg font-medium text-white pr-4">
                    {faq.question}
                  </span>
                  
                  {/* Animated Arrow */}
                  <span 
                    className={`flex-shrink-0 text-zinc-500 transition-transform duration-300 ease-in-out ${
                      isOpen ? "rotate-180 text-white" : ""
                    }`}
                  >
                    <svg 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </span>
                </button>

                {/* CSS Grid hack for smooth height transition */}
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="p-6 pt-0 text-zinc-400 leading-relaxed whitespace-pre-wrap">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Footer Prompt */}
        <div className="mt-16 text-center text-zinc-500">
          <p>We don't chase perfection. We just show up and create.</p>
        </div>
      </div>
    </div>
  );
}