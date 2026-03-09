/**
 * One-time script: create and set current academic year for the first school in DB.
 * Run from project root: node scripts/seedAcademicYear.js
 *
 * Optional env: SEED_ACADEMIC_YEAR_NAME=2025-2026 (default: 2024-2025)
 *               SEED_SCHOOL_ID=<mongoid> to target a specific school
 */
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

// Ensure we load .env from project root when run as: node scripts/seedAcademicYear.js
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('../src/config/db');
const School = require('../src/models/School');
const AcademicYear = require('../src/models/AcademicYear');

const DEFAULT_NAME = '2024-2025';
const DEFAULT_START = '2024-04-01';
const DEFAULT_END = '2025-03-31';

async function seed() {
  await connectDB();

  let schoolId = process.env.SEED_SCHOOL_ID;
  if (!schoolId) {
    const firstSchool = await School.findOne().select('_id name').lean();
    if (!firstSchool) {
      console.error('No school found in DB. Create a school (e.g. register) first.');
      process.exit(1);
    }
    schoolId = firstSchool._id;
    console.log('Using first school:', firstSchool.name, schoolId.toString());
  } else {
    const school = await School.findById(schoolId).select('name').lean();
    if (!school) {
      console.error('SEED_SCHOOL_ID school not found.');
      process.exit(1);
    }
    console.log('Using school:', school.name, schoolId.toString());
  }

  const existing = await AcademicYear.getCurrentYear(schoolId);
  if (existing) {
    console.log('Current academic year already set:', existing.name);
    await mongoose.disconnect();
    process.exit(0);
  }

  const name = process.env.SEED_ACADEMIC_YEAR_NAME || DEFAULT_NAME;
  const startDate = new Date(process.env.SEED_START_DATE || DEFAULT_START);
  const endDate = new Date(process.env.SEED_END_DATE || DEFAULT_END);

  const year = await AcademicYear.create({
    name,
    schoolId,
    startDate,
    endDate,
    isCurrent: true,
    isActive: true,
  });

  console.log('Created and set current academic year:', year.name, year._id.toString());
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
