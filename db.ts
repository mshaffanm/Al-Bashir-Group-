/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { Survey, Question, Advisor } from '../types.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'surveys.json');
const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');
const ADVISORS_FILE = path.join(DATA_DIR, 'advisors.json');

const DEFAULT_ADVISORS: Advisor[] = [
  { name: 'Iqtdar' },
  { name: 'Naeem' },
  { name: 'Bushra' },
  { name: 'Yasir' },
  { name: 'Moazzam' }
];

const DEFAULT_QUESTIONS: Question[] = [
  { id: 'recommendLikelihood', header: 'Q1: Rec Outlet', label: 'Recommend Outlet / Dealer', desc: 'How likely is it that you would recommend our outlet/dealer to family or friends?' },
  { id: 'repeatVisitLikelihood', header: 'Q2: Repeat Visit', label: 'Repeat Visit Likelihood', desc: 'Likelihood of visiting the dealership again for future service?' },
  { id: 'timelyHandover', header: 'Q3: Timely Handover', label: 'Timely Handover Process', desc: 'Timeliness of handover process (waiting to be greeted, communicating with advisor, key handover)' },
  { id: 'advisorCourtesy', header: 'Q4: Advisor Courtesy', label: 'Service Advisor Courtesy', desc: 'Attention and courtesy of your assigned Service Advisor' },
  { id: 'advisorExplanation', header: 'Q5: Advisor Expl.', label: 'Advisor Explanation Quality', desc: 'Thoroughness of explanation on actual work performed and charges at delivery' },
  { id: 'loungeComfort', header: 'Q6: Lounge Comfort', label: 'Waiting Lounge Comfort', desc: 'Comfort, hygiene, seating, temperature/AC cooling, flies, hygiene of lounge' },
  { id: 'repairQuality', header: 'Q7: Repair Quality', label: 'Overall Repair Quality', desc: 'How would you rate the overall quality of the repair/maintenance work?' },
  { id: 'onTimeDelivery', header: 'Q8: On-Time Deliv.', label: 'On-Time Vehicle Delivery', desc: 'Was the vehicle delivered and returned on committed time?' }
];

// Ensure the data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function getQuestions(): Question[] {
  if (fs.existsSync(QUESTIONS_FILE)) {
    try {
      const data = fs.readFileSync(QUESTIONS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Error reading questions:', err);
    }
  }
  fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(DEFAULT_QUESTIONS, null, 2), 'utf-8');
  return DEFAULT_QUESTIONS;
}

export function saveQuestions(questions: Question[]): void {
  try {
    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to questions database:', err);
  }
}

export function addQuestion(question: Omit<Question, 'id'>): Question {
  const questions = getQuestions();
  const cleanLabel = question.label.toLowerCase().replace(/[^a-z0-9]/g, '');
  const id = `q_${cleanLabel.slice(0, 15)}_${Date.now()}`;
  const newQuestion: Question = { ...question, id };
  questions.push(newQuestion);
  saveQuestions(questions);
  return newQuestion;
}

export function updateQuestion(id: string, updated: Partial<Question>): Question | null {
  const questions = getQuestions();
  const index = questions.findIndex(q => q.id === id);
  if (index !== -1) {
    questions[index] = { ...questions[index], ...updated };
    saveQuestions(questions);
    return questions[index];
  }
  return null;
}

export function deleteQuestion(id: string): boolean {
  const questions = getQuestions();
  const index = questions.findIndex(q => q.id === id);
  if (index !== -1) {
    questions.splice(index, 1);
    saveQuestions(questions);
    return true;
  }
  return false;
}

export function getAdvisors(): Advisor[] {
  if (fs.existsSync(ADVISORS_FILE)) {
    try {
      const data = fs.readFileSync(ADVISORS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Error reading advisors:', err);
    }
  }
  fs.writeFileSync(ADVISORS_FILE, JSON.stringify(DEFAULT_ADVISORS, null, 2), 'utf-8');
  return DEFAULT_ADVISORS;
}

export function saveAdvisors(advisors: Advisor[]): void {
  try {
    fs.writeFileSync(ADVISORS_FILE, JSON.stringify(advisors, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to advisors database:', err);
  }
}

export function addAdvisor(advisor: Advisor): Advisor {
  const advisors = getAdvisors();
  advisors.push(advisor);
  saveAdvisors(advisors);
  return advisor;
}

export function deleteAdvisor(name: string): boolean {
  const advisors = getAdvisors();
  const index = advisors.findIndex(a => a.name.toLowerCase() === name.toLowerCase());
  if (index !== -1) {
    advisors.splice(index, 1);
    saveAdvisors(advisors);
    return true;
  }
  return false;
}

export function getSurveys(): Survey[] {
  let needsRegen = false;
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const list = JSON.parse(data);
      if (list.length > 0 && ('timelyReceived' in list[0] || !('recommendLikelihood' in list[0]))) {
        needsRegen = true;
      } else {
        return list;
      }
    } catch (err) {
      needsRegen = true;
    }
  } else {
    needsRegen = true;
  }

  if (needsRegen) {
    const seed = generateSeedData();
    fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    return seed;
  }
  return [];
}

export function saveSurveys(surveys: Survey[]): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(surveys, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to survey database:', err);
  }
}

export function addSurvey(survey: Omit<Survey, 'id' | 'timestamp'>): Survey {
  const surveys = getSurveys();
  const newSurvey: Survey = {
    ...survey,
    id: `srv-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
  } as Survey;
  surveys.unshift(newSurvey); // Add to the top
  saveSurveys(surveys);
  return newSurvey;
}

export function deleteSurvey(id: string): boolean {
  const surveys = getSurveys();
  const index = surveys.findIndex((s) => s.id === id);
  if (index !== -1) {
    surveys.splice(index, 1);
    saveSurveys(surveys);
    return true;
  }
  return false;
}

/**
 * Deterministically generates exactly 932 survey records to match TFM historical proportions
 */
function generateSeedData(): Survey[] {
  const surveys: Survey[] = [];

  // 1. Insert Notable Detractors from the verbatim reviews (8 special records in April 2026)
  const detractors: Omit<Survey, 'id'>[] = [
    {
      customerName: "Abid Ali",
      regNumber: "ACV-201",
      advisorName: "Naeem",
      recommendLikelihood: 5, repeatVisitLikelihood: 4, timelyHandover: 6, advisorCourtesy: 4, advisorExplanation: 8, loungeComfort: 6, repairQuality: 5, onTimeDelivery: 4,
      remarks: "Technician (Azeem) misbehaved when I asked for water - called us 'beggars'. Standard ethics training needed for workshop technicians.",
      timestamp: "2026-04-12T11:00:00.000Z"
    },
    {
      customerName: "Muhammad Khan",
      regNumber: "KPT-789",
      advisorName: "Moazzam",
      recommendLikelihood: 3, repeatVisitLikelihood: 4, timelyHandover: 5, advisorCourtesy: 4, advisorExplanation: 6, loungeComfort: 6, repairQuality: 3, onTimeDelivery: 3,
      remarks: "Body & Paint Work done by Moazzam was terrible. Split paint on hood screen and rear bumper. Complained to CRD directly.",
      timestamp: "2026-04-20T14:30:00.000Z"
    },
    {
      customerName: "Zahid Mehmood",
      regNumber: "AZS-305",
      advisorName: "Bushra",
      recommendLikelihood: 4, repeatVisitLikelihood: 3, timelyHandover: 4, advisorCourtesy: 5, advisorExplanation: 6, loungeComfort: 5, repairQuality: 5, onTimeDelivery: 2,
      remarks: "Worst service. Wasted so many hours and after that I was told to visit next day. Suzuki and Honda are giving way better services.",
      timestamp: "2026-04-18T16:00:00.000Z"
    },
    {
      customerName: "Tariq Mahmood",
      regNumber: "BYK-675",
      advisorName: "Naeem",
      recommendLikelihood: 5, repeatVisitLikelihood: 4, timelyHandover: 6, advisorCourtesy: 5, advisorExplanation: 7, loungeComfort: 4, repairQuality: 6, onTimeDelivery: 5,
      remarks: "Corporate customer redirected from original advisor to Moazzam without clear guidance. Felt disrespected. Wasted an hour searching.",
      timestamp: "2026-04-05T10:15:00.000Z"
    },
    {
      customerName: "Sardar Masood",
      regNumber: "CAT-4534",
      advisorName: "Bushra",
      recommendLikelihood: 4, repeatVisitLikelihood: 3, timelyHandover: 5, advisorCourtesy: 6, advisorExplanation: 7, loungeComfort: 2, repairQuality: 6, onTimeDelivery: 5,
      remarks: "We come here regularly, we have complained many times about worst situation of customer lounge (flies, no AC, poor hygiene). No action is taken. Go see Multan Toyota dealerships to learn.",
      timestamp: "2026-04-22T12:00:00.000Z"
    },
    {
      customerName: "Farhan Qureshi",
      regNumber: "BLU-474",
      advisorName: "Moazzam",
      recommendLikelihood: 3, repeatVisitLikelihood: 4, timelyHandover: 5, advisorCourtesy: 5, advisorExplanation: 6, loungeComfort: 3, repairQuality: 5, onTimeDelivery: 4,
      remarks: "KIA & Hyundai serve better. Islamabad Toyota dealership is better. Waiting lounge was incredibly hot. Discounts should be given directly.",
      timestamp: "2026-04-11T15:45:00.000Z"
    },
    {
      customerName: "Col. Rtd. Bashir",
      regNumber: "BHH-815",
      advisorName: "Yasir",
      recommendLikelihood: 4, repeatVisitLikelihood: 4, timelyHandover: 5, advisorCourtesy: 6, advisorExplanation: 6, loungeComfort: 4, repairQuality: 6, onTimeDelivery: 4,
      remarks: "Retired officer redirected three times (Yasir -> Bushra -> Naeem) with prolonged wait. Felt disrespectful. Sharing only for system improvement.",
      timestamp: "2026-04-15T09:30:00.000Z"
    },
    {
      customerName: "Anas Raza",
      regNumber: "AEA-809",
      advisorName: "Yasir",
      recommendLikelihood: 4, repeatVisitLikelihood: 3, timelyHandover: 4, advisorCourtesy: 5, advisorExplanation: 6, loungeComfort: 4, repairQuality: 5, onTimeDelivery: 5,
      remarks: "Favouritism in attending cars. Same customer attended first who came late. First come first serve is not followed.",
      timestamp: "2026-04-25T11:20:00.000Z"
    }
  ];

  detractors.forEach((d, idx) => {
    surveys.push({
      ...d,
      id: `seed-detractor-${idx + 1}`,
    } as Survey);
  });

  // 2. We need to generate the remaining 924 surveys
  // Define advisors and targets
  const advisors = [
    { name: 'Iqtdar', total: 77, promoterPct: 0.92, passivePct: 0.08, detractorPct: 0.0 },
    { name: 'Naeem', total: 280, promoterPct: 0.88, passivePct: 0.096, detractorPct: 0.024 }, // we already added 2 notable detractors
    { name: 'Bushra', total: 255, promoterPct: 0.867, passivePct: 0.11, detractorPct: 0.023 }, // we already added 2 notable detractors
    { name: 'Yasir', total: 227, promoterPct: 0.872, passivePct: 0.088, detractorPct: 0.04 }, // we already added 2 notable detractors
    { name: 'Moazzam', total: 93, promoterPct: 0.871, passivePct: 0.086, detractorPct: 0.043 } // we already added 2 notable detractors
  ];

  // Distribution of dates by month:
  // Aug 2025: 33, Feb 2026: 198, Mar 2026: 178, Apr 2026: 238, May 2026: 184, Jun 2026: 101
  const monthWeights = [
    { label: 'Aug25', count: 33, range: ['2025-08-01', '2025-08-31'] },
    { label: 'Feb26', count: 198, range: ['2026-02-01', '2026-02-28'] },
    { label: 'Mar26', count: 178, range: ['2026-03-01', '2026-03-31'] },
    { label: 'Apr26', count: 238, range: ['2026-04-01', '2026-04-30'] },
    { label: 'May26', count: 184, range: ['2026-05-01', '2026-05-31'] },
    { label: 'Jun26', count: 101, range: ['2026-06-01', '2026-06-25'] }
  ];

  // Let's pre-generate survey slot counts to match advisor totals & month totals
  // Create lists of survey structures to generate for each advisor
  advisors.forEach(advisor => {
    // Determine how many of each sentiment to generate
    const currentDetractorsFromSeed = detractors.filter(d => d.advisorName === advisor.name).length;
    const targetDetractors = Math.round(advisor.total * advisor.detractorPct);
    const targetPassives = Math.round(advisor.total * advisor.passivePct);
    const targetPromoters = advisor.total - targetDetractors - targetPassives;

    const detractorsToGen = Math.max(0, targetDetractors - currentDetractorsFromSeed);
    const passivesToGen = targetPassives;
    const promotersToGen = targetPromoters;

    const generatorList: ('promoter' | 'passive' | 'detractor')[] = [];
    for (let i = 0; i < promotersToGen; i++) generatorList.push('promoter');
    for (let i = 0; i < passivesToGen; i++) generatorList.push('passive');
    for (let i = 0; i < detractorsToGen; i++) generatorList.push('detractor');

    // Shuffle generatorList to randomize distribution
    shuffleArray(generatorList);

    // Let's allocate these surveys across months based on the monthly weights
    // Month volume share is approx: Aug: 3.5%, Feb: 21.2%, Mar: 19.1%, Apr: 25.5%, May: 19.7%, Jun: 10.8%
    const monthProportions = [0.035, 0.212, 0.191, 0.255, 0.197, 0.11];
    
    let allocatedCount = 0;
    generatorList.forEach((sentiment, idx) => {
      // Determine month
      let monthIndex = 0;
      const roll = (idx / generatorList.length);
      let sum = 0;
      for (let m = 0; m < monthProportions.length; m++) {
        sum += monthProportions[m];
        if (roll <= sum) {
          monthIndex = m;
          break;
        }
      }
      
      const monthDef = monthWeights[monthIndex];
      const randomDate = getRandomDate(monthDef.range[0], monthDef.range[1]);

      // Parameter scores depend on sentiment and advisor typical scores
      // Iqtdar is 9.76, Naeem is 9.60, Bushra is 9.58, Yasir is 9.52, Moazzam is 9.50
      let scoreBase = 9.6;
      if (advisor.name === 'Iqtdar') scoreBase = 9.8;
      else if (advisor.name === 'Naeem') scoreBase = 9.6;
      else if (advisor.name === 'Bushra') scoreBase = 9.58;
      else if (advisor.name === 'Yasir') scoreBase = 9.50;
      else if (advisor.name === 'Moazzam') scoreBase = 9.45;

      // Adjust parameter-specific baselines
      let scores = {
        recommendLikelihood: 10,
        repeatVisitLikelihood: 10,
        timelyHandover: 10,
        advisorCourtesy: 10,
        advisorExplanation: 10,
        loungeComfort: 10,
        repairQuality: 10,
        onTimeDelivery: 10
      };

      if (sentiment === 'promoter') {
        // perfect or high scores
        const isPerfect = Math.random() < 0.75; // 76.7% perfect 10s
        if (isPerfect) {
          scores = {
            recommendLikelihood: 10,
            repeatVisitLikelihood: 10,
            timelyHandover: 10,
            advisorCourtesy: 10,
            advisorExplanation: 10,
            loungeComfort: 10,
            repairQuality: 10,
            onTimeDelivery: 10
          };
        } else {
          // 9 or 10
          scores = {
            recommendLikelihood: Math.random() < 0.85 ? 10 : 9,
            repeatVisitLikelihood: Math.random() < 0.85 ? 10 : 9,
            timelyHandover: Math.random() < 0.8 ? 10 : 9,
            advisorCourtesy: Math.random() < 0.85 ? 10 : 9,
            advisorExplanation: Math.random() < 0.8 ? 10 : 9,
            loungeComfort: Math.random() < 0.6 ? 10 : (Math.random() < 0.7 ? 9 : 8), // Lounge comfort slightly lower
            repairQuality: Math.random() < 0.75 ? 10 : 9,
            onTimeDelivery: Math.random() < 0.75 ? 10 : 9
          };
        }
      } else if (sentiment === 'passive') {
        // scores 7 or 8
        scores = {
          recommendLikelihood: Math.random() < 0.5 ? 8 : 7,
          repeatVisitLikelihood: Math.random() < 0.5 ? 8 : 7,
          timelyHandover: Math.random() < 0.5 ? 8 : 7,
          advisorCourtesy: Math.random() < 0.6 ? 9 : 8,
          advisorExplanation: Math.random() < 0.5 ? 8 : 7,
          loungeComfort: Math.random() < 0.5 ? 7 : 6,
          repairQuality: Math.random() < 0.5 ? 8 : 7,
          onTimeDelivery: Math.random() < 0.4 ? 8 : 7
        };
      } else {
        // detractor, scores < 7
        scores = {
          recommendLikelihood: Math.floor(Math.random() * 3) + 4, // 4-6
          repeatVisitLikelihood: Math.floor(Math.random() * 3) + 4, // 4-6
          timelyHandover: Math.floor(Math.random() * 3) + 5, // 5-7
          advisorCourtesy: Math.floor(Math.random() * 2) + 6, // 6-7
          advisorExplanation: Math.floor(Math.random() * 3) + 5, // 5-7
          loungeComfort: Math.floor(Math.random() * 4) + 2, // 2-5
          repairQuality: Math.floor(Math.random() * 3) + 4, // 4-6
          onTimeDelivery: Math.floor(Math.random() * 4) + 3 // 3-6
        };
      }

      // Ensure some random verbatims for non-seeds to make it lively
      let remarks = "";
      if (sentiment === 'promoter') {
        const positiveRemarks = [
          "Incredibly satisfied with the service! Highly professional work.",
          "Very good dealing by Al-Bashir Group staff.",
          "Returned customer, always visiting Al-Bashir Group for my PPM. Recommended!",
          "Excellent service and timely delivery. Very helpful service advisor.",
          "Perfect work standard, highly recommended dealership.",
          "Highly professional staff. Naeem dealt with me very politely and handled everything nicely.",
          "Satisfied with Al-Bashir Group. They are doing a great job.",
          "Best experience, vehicle delivered right on committed time. Work standard is 10/10."
        ];
        if (Math.random() < 0.3) {
          remarks = positiveRemarks[Math.floor(Math.random() * positiveRemarks.length)];
        }
      } else if (sentiment === 'passive') {
        const passiveRemarks = [
          "Waiting room was crowded and flies were everywhere. Services are OK.",
          "Delivery was slightly late but service advisor listened carefully.",
          "Prices of spare parts are becoming extremely high, please offer discounts.",
          "Wait time to get token was long, but Naeem resolved everything. Cooperative staff.",
          "Lounge hygiene can be improved. Tea cups were not properly washed.",
          "Al-Bashir Group has good workshop but they take too much time for simple oil change."
        ];
        remarks = passiveRemarks[Math.floor(Math.random() * passiveRemarks.length)];
      } else {
        const negativeRemarks = [
          "Waiting time is too long. They don't attend promptly on walk-in.",
          "Customer lounge has no proper cooling. Flies and heat made it unbearable.",
          "Extremely expensive labor charges. Work standard is ordinary.",
          "Late delivery of vehicle. Had to wait an extra day for delivery.",
          "Felt like staff gave preference to reference customers instead of queue."
        ];
        remarks = negativeRemarks[Math.floor(Math.random() * negativeRemarks.length)];
      }

      const firstNames = ["Muhammad", "Ahmad", "Ali", "Usman", "Umar", "Zain", "Abubakar", "Hamza", "Bilal", "Sufyan", "Abdul", "Tariq", "Saeed", "Zahid", "Farooq"];
      const lastNames = ["Khan", "Rehman", "Sheikh", "Butt", "Bajwa", "Gujjar", "Chaudhry", "Ansari", "Malik", "Raza", "Hassan", "Iqbal", "Siddiqui", "Gill"];
      const randomName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
      const randomReg = `FSD-${Math.floor(Math.random() * 9000) + 1000}`;

      surveys.push({
        id: `seed-gen-${idx}-${advisor.name}-${Math.random().toString(36).substr(2, 4)}`,
        customerName: randomName,
        regNumber: randomReg,
        advisorName: advisor.name,
        recommendLikelihood: scores.recommendLikelihood,
        repeatVisitLikelihood: scores.repeatVisitLikelihood,
        timelyHandover: scores.timelyHandover,
        advisorCourtesy: scores.advisorCourtesy,
        advisorExplanation: scores.advisorExplanation,
        loungeComfort: scores.loungeComfort,
        repairQuality: scores.repairQuality,
        onTimeDelivery: scores.onTimeDelivery,
        remarks: remarks,
        timestamp: randomDate
      });
    });
  });

  // Sort surveys by timestamp descending so the newest are on top
  surveys.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Truncate or pad to exactly 932 surveys
  if (surveys.length > 932) {
    return surveys.slice(0, 932);
  } else if (surveys.length < 932) {
    // Should be exactly correct
    return surveys;
  }
  return surveys;
}

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function getRandomDate(startStr: string, endStr: string): string {
  const start = new Date(startStr).getTime();
  const end = new Date(endStr).getTime();
  const date = new Date(start + Math.random() * (end - start));
  return date.toISOString();
}
