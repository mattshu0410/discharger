'use client';

import { cn } from '@/libs/utils';

type DocumentViewProps = {
  className?: string;
};

export function DocumentView({ className }: DocumentViewProps) {
  return (
    <div className={cn(' h-full w-full flex items-center justify-center', className)}>
      <div className="transform scale-50 origin-center">
        <div className="max-w-4xl mx-auto bg-white shadow-lg" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
          {/* Document Header */}
          <div className="border-b-2 border-black pb-4 mb-6 p-8">
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold text-black">TWEED VALLEY HOSPITAL</h1>
              <p className="text-sm text-black">70 Rajah Road, Ocean Shores NSW 2483</p>
              <p className="text-sm text-black">Phone: 07 5506 7000</p>
            </div>
            <div className="border-t border-black pt-4">
              <h2 className="text-xl font-bold text-center text-black">DISCHARGE SUMMARY</h2>
            </div>
          </div>

          {/* Patient Information */}
          <div className="px-8 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm text-black">
              <div>
                <p>
                  <strong>Patient Name:</strong>
                  {' '}
                  Mervyn BRADY
                </p>
                <p>
                  <strong>Age:</strong>
                  {' '}
                  85 years old
                </p>
                <p>
                  <strong>Admission Date:</strong>
                  {' '}
                  10/03/2025
                </p>
                <p>
                  <strong>Medical Service:</strong>
                  {' '}
                  Physician
                </p>
                <p>
                  <strong>AMO:</strong>
                  {' '}
                  Dr. Robert Charles JF Nickels
                </p>
              </div>
              <div>
                <p>
                  <strong>Discharge Date:</strong>
                  {' '}
                  24/03/2025
                </p>
                <p>
                  <strong>LMO:</strong>
                  {' '}
                  Dr. Kevin Yun Wang
                </p>
                <p>
                  <strong>LMO Address:</strong>
                  {' '}
                  Ocean Shores Medical Centre
                </p>
                <p>
                  <strong>Ward:</strong>
                  {' '}
                  TVH Surg 4A2
                </p>
                <p>
                  <strong>Language:</strong>
                  {' '}
                  English
                </p>
              </div>
            </div>
          </div>

          {/* Document Content */}
          <div className="px-8 pb-8 text-sm leading-relaxed space-y-4 text-black text-left">
            <div>
              <h3 className="font-bold text-black mb-2">PRINCIPAL DIAGNOSIS:</h3>
              <p>Pituitary apoplexy</p>
            </div>

            <div>
              <h3 className="font-bold text-black mb-2">INPATIENT MANAGEMENT SUMMARY:</h3>
              <p>
                Patient presented with headache and L CN6 palsy post leuprolide injection (for metastatic prostate cancer) in community.
                MRI Brain showing pituitary apoplexy. Discussed with GCUH Neurosurgery, not for surgical management. Endocrine consulted,
                patient was stress dosed for a few days, but repeat pituitary panel had stable hormones and no requirement for ongoing hormone replacement.
                Not for further leuprolide injections (Pituitary apoplexy is rare side effect of GnRH agonists).
              </p>
            </div>

            <div>
              <h3 className="font-bold text-black mb-2">KEY ISSUES THIS ADMISSION:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Pituitary macroadenoma with associated apoplexy</strong>
                  {' '}
                  - Woke up on 08/03/25 with diplopia and headache. MRB showing pituitary macroadenoma 15x16x23mm with hemorrhage
                </li>
                <li>
                  <strong>Acute onset Left CN6 palsy</strong>
                  {' '}
                  - Diplopia with L lateral gaze, likely due to irritation from apoplexy
                </li>
                <li>
                  <strong>Metastatic prostate cancer</strong>
                  {' '}
                  - PSA 400 (Feb 2025), PSMA scan showing widespread osseous metastatic disease
                </li>
                <li>
                  <strong>R femoral bony lesion</strong>
                  {' '}
                  - Prophylactic nail completed 14/03/2025
                </li>
                <li>
                  <strong>New thrombocytopenia</strong>
                  {' '}
                  - Nadir 72, likely secondary to bone marrow suppression from skeletal mets
                </li>
                <li>
                  <strong>Potential bladder malignancy</strong>
                  {' '}
                  - Incidental finding on CT, urology follow-up arranged
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-black mb-2">DISCHARGE MEDICATIONS:</h3>
              <ul className="list-decimal list-inside space-y-1">
                <li>Felodipine (Felodil XR) 10mg oral daily in morning - for blood pressure</li>
                <li>Macrogol 3350 with electrolytes 2 sachets oral daily PRN - for constipation</li>
                <li>Pantoprazole 40mg oral daily PRN - for indigestion/heartburn</li>
                <li>Paracetamol (Panadol Osteo) 665mg oral TDS - for pain</li>
                <li>Rosuvastatin 40mg oral daily in morning - to lower cholesterol</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-black mb-2">MEDICATIONS CEASED:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Bicalutamide 50mg oral tablet - CEASED</li>
                <li>Leuprorelin 22.5mg/3 months IM injection - CEASED</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-black mb-2">FOLLOW-UP ARRANGEMENTS:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Endocrine OPD with Dr. Haigh - 24th April 2025 (booked)</li>
                <li>GP to organise MRI pituitary + Pituitary panel 2 weeks before above appointment</li>
                <li>GCUH Ophthalmology OPD - referral sent, patient will be contacted</li>
                <li>Medical Oncology and Radiation Oncology OPD - referrals sent</li>
                <li>Urology - Bilateral orchidectomy + Rigid Cystoscopy +/- TURBT booked</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-black mb-2">ALLERGIES:</h3>
              <p>No Known Allergies</p>
            </div>

            <div className="mt-8 pt-4 border-t border-black">
              <div className="flex justify-between">
                <div>
                  <p><strong>Attending Medical Officer:</strong></p>
                  <p>Dr. Robert Charles JF Nickels</p>
                  <p>Respiratory Physician</p>
                  <p>Provider No: 2382337X</p>
                </div>
                <div>
                  <p><strong>Local Medical Officer:</strong></p>
                  <p>Dr. Kevin Yun Wang</p>
                  <p>Ocean Shores Medical Centre</p>
                  <p>Provider No: 482671BF</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
