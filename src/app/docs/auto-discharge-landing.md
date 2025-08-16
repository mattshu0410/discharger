## Cursor

- Custom cursor that has an arrow that wiggles slightly when moved around fast (physics style) and text box that randomises the following text. Notice the slight glow effect as well.
    - “On 6 red bulls”
    - “10 caffeine shots in”
    - Other similar funny quotes that are self-referential that junior doctors can relate to.

## Hero

- Headline: Discharge in a click.
  - I want you to use https://www.reactbits.dev/text-animations/split-text split text to animate the text.

import SplitText from "./SplitText";

const handleAnimationComplete = () => {
  console.log('All letters have animated!');
};

<SplitText
  text="Hello, GSAP!"
  className="text-2xl font-semibold text-center"
  delay={100}
  duration={0.6}
  ease="power3.out"
  splitType="chars"
  from={{ opacity: 0, y: 40 }}
  to={{ opacity: 1, y: 0 }}
  threshold={0.1}
  rootMargin="-100px"
  textAlign="center"
  onLetterAnimationComplete={handleAnimationComplete}
/>

- Button (”Generate Discharge”)
- Dummy Show example
    1. Dummy Text Field w/ Text inside.
        - To show an example of what might be copy pasted in from EHR
    2. Fake Generating with loading text for roughly 3 seconds
        - “Enslaving medical students…”
        - “Dodging cannulas…”
        - Other similar funny quotes
        - Also use a loading animation with Lottieloader like so

import React from "react";
import catAnimationData 'src/animation/cat-animation.json';
import LottieLoader 'react-lottie-loader';

function App() {
  return (
    <div>
      <LottieLoader animationData={catAnimationData} />
    </div>
  );
}

export default App;

    3. DischargerSummarySection UI w/ copy functionality intact

## Features

- Feature Boxes similar to existing landing page for Discharge Simplifier
- We can use placeholder images for now.

- HIPPA compliant
    - Safeguards sensitive patient information.
- Learns your style
    - Everyone discharges differently. Every time you feedback, Discharger remembers.
- Verifiable citations
    - Understand exactly where AI got it’s information from.

## Time-saved Calculator

- The purpose of this section is a humorous way to show the time saved.
- Hour Counter (Calculate 15 patients * 6 minutes = 90 minutes = 1.5 hours)
  - I want you to use https://www.reactbits.dev/components/counter for the counter. It increments when the slider is changed.

Example Use:
import Counter from './Counter';
<Counter
  value={1}
  places={[100, 10, 1]}
  fontSize={80}
  padding={5}
  gap={10}
  textColor="white"
  fontWeight={900}
/>

- Have a funny example of time with cute emojis
    - 1 Quentin Tarantino movie (2 hours)
    - Taylor Swift Concert (3.5 hours)
    - One full season of The Office (7 hours)
    - Lord of the Rings Marathon (10 hours)
- Draggable slider 1-14 days should snap to whole number days. 

## Resources

### Dummy ED Note

45 F presenting with chronic lower back pain
Progress
- Reports having bilateral lower back pain with radicular left leg pain for months
- Describes shooting pain to toes with occasional toe numbness
- Flares when standing
- No weakness, trauma, heavy lifting, bowel/bladder incontinence, fevers, weight loss
- Has trialled analgesia (unsure of name) without significant benefit
- Relief from topical creams
- Has seen GP and been referred to sports med centre, MRI pending end of April
- Used a mobility scooter during recent Singapore trip due to pain
PMHx
- Meningitis
- Hip OA
Medications
- Vitamins
- Magnesium
Allergies
- NKDA
SHx
- Home with wife
- iADLs
- Nil smoking
- Social EtOH
- Nil IVDU
O/E
- Appears well
- Mobilising independently
- No midline spinal or paraspinal tenderness
- Straight leg raise positive on left lower limb, negative on right
- No erythema/back swelling
- Lower limbs
  - normal tone bilaterally
  - power 5/5 in all domains
  - fine touch sensation intact, no asymmetry
  - reflexes present
  - babinski downgoing
  - pain flares with left ankle dorsiflexion
Impression
- Degenerative spinal changes with sciatica
Plan
- XR
- Analgesia
- Safety net
- LBP clinic

### Discharge Summary

Summary of Progress

Dear Doctor,

Thank you for your ongoing care of Clarence, a 45-year-old female who presented to the
Emergency Department at RNSH on 7/8/25 with chronic back pain and sciatica.
Clarence reported bilateral lower back pain for several months with left lower limb sciatica. They were able to mobilise independently, had no neurological deficits on examination, and had no red flags concerning for serious underlying pathology. They were advised to continue pharmacological and non-pharmacological measures to manage their pain, continue physical activity, follow up with our back pain clinic and have an MRI in late April as an outpatient as previously arranged.

Discharge Plan

1. Discharge home.
2. Please continue the following medications
- Celecoxib 100mg twice daily for 5 days
- Esomeprazole 20mg daily for 5 days
- Panadol 1g four times a day as needed for pain
3. Follow-up with lower back pain clinic on Thursday as per the provided form (Phone: 9650 3542 to confirm appointment).
4. Please seek medical attention and/or present to your nearest emergency department if your
symptoms get worse or you have any other concerns.
- Weakness in legs, unsteadiness when walking, changes to bowel or bladder function, severe pain at night, fevers

Kind Regards,
Dr Matt Hou, Emergency Medicine JMO
On behalf of Dr Kevin Shu, Emergency Medicine Consultant