require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
const Organization = require('../models/Organization');
const Plant = require('../models/Plant');
const Group = require('../models/Group');
const Assignment = require('../models/Assignment');
const PlantationEvent = require('../models/PlantationEvent');
const Tree = require('../models/Tree');
const Inspection = require('../models/Inspection');
const { hashPassword } = require('../utils/password');
const logger = require('../config/logger');

async function seedData() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info('Connected to database for HP Evergreen seeding');

    // 1. Clear Existing Data to Start Clean
    logger.info('Clearing old mock data...');
    await User.deleteMany({});
    await Role.deleteMany({});
    await Organization.deleteMany({});
    await Plant.deleteMany({});
    await Group.deleteMany({});
    await Assignment.deleteMany({});
    await PlantationEvent.deleteMany({});
    await Tree.deleteMany({});
    await Inspection.deleteMany({});

    // 2. Create Roles
    logger.info('Seeding Roles...');
    const superAdminRoleObj = await new Role({
      name: 'SUPER_ADMIN',
      description: 'System-wide administrator with full access',
      isSystem: true
    }).save();

    const orgAdminRoleObj = await new Role({
      name: 'ORG_ADMIN',
      description: 'Organization administrator with limited group-level access',
      isSystem: true
    }).save();

    const volunteerRoleObj = await new Role({
      name: 'VOLUNTEER',
      description: 'Field officer/volunteer with plantation & inspection access',
      isSystem: true
    }).save();

    const citizenRoleObj = await new Role({
      name: 'CITIZEN',
      description: 'Local citizen/farmer tracking personal trees',
      isSystem: true
    }).save();

    // 3. Create Organizations
    logger.info('Seeding Organizations...');
    const hpForestOrg = await new Organization({
      name: 'Himachal Pradesh Forest Department',
      slug: 'hpforest',
      organizationType: 'GOVERNMENT',
      description: 'Government department responsible for forest ecosystem conservation in HP.',
      contactEmail: 'contact@hpforest.gov.in',
      contactPhone: '01772623155',
      address: 'Talland, Shimla, Himachal Pradesh 171001',
      status: 'ACTIVE'
    }).save();

    const proClimeOrg = await new Organization({
      name: 'ProClime Carbon Solutions',
      slug: 'proclime',
      organizationType: 'CSR',
      description: 'Singapore-based partner investing $7M in Him Evergreen carbon offsets.',
      contactEmail: 'info@proclime.com',
      contactPhone: '+6560000000',
      address: 'Marina Bay Sands, Singapore',
      status: 'ACTIVE'
    }).save();

    const kangraNgo = await new Organization({
      name: 'Kangra Community Forestry NGO',
      slug: 'kangraforest',
      organizationType: 'NGO',
      description: 'Local NGO coordinating village afforestation and Mahila Mandals.',
      contactEmail: 'contact@kangraforest.org',
      contactPhone: '01892222222',
      address: 'Kotwali Bazaar, Dharamsala, Himachal Pradesh 176215',
      status: 'ACTIVE'
    }).save();

    // 4. Create Users (Backward compatible credentials with updated display names & types)
    logger.info('Seeding Users...');
    
    // SuperAdmin
    const superAdminPassword = await hashPassword('Admin123!@#');
    const superAdmin = await new User({
      firstName: 'Himachal Forest',
      lastName: 'Super Admin',
      email: 'admin@school.com',
      passwordHash: superAdminPassword,
      roleId: superAdminRoleObj._id,
      userType: 'SUPER_ADMIN',
      status: 'ACTIVE',
      emailVerified: true
    }).save();

    // OrgAdmin (NGO Lead)
    const orgAdminPassword = await hashPassword('SchoolAdmin123!@#');
    const orgAdmin = await new User({
      firstName: 'Dharamsala NGO',
      lastName: 'Org Admin',
      email: 'schooladmin@school.com',
      passwordHash: orgAdminPassword,
      roleId: orgAdminRoleObj._id,
      organizationId: kangraNgo._id,
      userType: 'ORG_ADMIN',
      status: 'ACTIVE',
      emailVerified: true
    }).save();

    // Volunteer (Field Guard)
    const volunteerPassword = await hashPassword('Teacher123!@#');
    const volunteer = await new User({
      firstName: 'Palampur Guard',
      lastName: 'Volunteer',
      email: 'teacher@school.com',
      passwordHash: volunteerPassword,
      roleId: volunteerRoleObj._id,
      organizationId: hpForestOrg._id,
      userType: 'VOLUNTEER',
      status: 'ACTIVE',
      emailVerified: true
    }).save();

    // Citizen (Local Farmer)
    const citizenPassword = await hashPassword('Student123!@#');
    const citizen = await new User({
      firstName: 'Ramesh',
      lastName: 'Himalayan Farmer',
      email: 'student@school.com',
      passwordHash: citizenPassword,
      roleId: citizenRoleObj._id,
      organizationId: kangraNgo._id,
      userType: 'CITIZEN',
      status: 'ACTIVE',
      emailVerified: true
    }).save();

    // 5. Create Native HP Plants/Species
    logger.info('Seeding Plant Species...');
    const deodar = await new Plant({
      name: 'Deodar (Himalayan Cedar)',
      scientificName: 'Cedrus deodara',
      category: 'FOREST',
      description: 'State tree of Himachal Pradesh. High wood density, excellent for structural ecosystems and carbon sequestration.'
    }).save();

    const banOak = await new Plant({
      name: 'Ban Oak',
      scientificName: 'Quercus leucotrichophora',
      category: 'FOREST',
      description: 'Crucial Himalayan broadleaved species essential for ground water recharge and soil retention.'
    }).save();

    const harad = await new Plant({
      name: 'Harad',
      scientificName: 'Terminalia chebula',
      category: 'MEDICINAL',
      description: 'Highly valued agroforestry tree with wide medicinal use in Triphala. Fits well into rural farm bunds.'
    }).save();

    const kail = await new Plant({
      name: 'Kail (Blue Pine)',
      scientificName: 'Pinus wallichiana',
      category: 'FOREST',
      description: 'Conifer pine species native to mountain slopes. Very fast-growing and vital for carbon-offset targets.'
    }).save();

    // 6. Create Community Groups (Mahila/Yuvak Mandals)
    logger.info('Seeding Community Groups...');
    const gauriMandal = await new Group({
      groupName: 'Gauri Mahila Mandal (Palampur)',
      groupType: 'Mahila Mandal',
      village: 'Palampur Rural',
      panchayat: 'Palampur',
      district: 'Kangra',
      leaderName: 'Gauri Devi',
      mobile: '9876543210',
      membersCount: 25,
      status: 'Active',
      organizationId: kangraNgo._id
    }).save();

    const shaktiMandal = await new Group({
      groupName: 'Shakti Yuvak Mandal (Dharamsala)',
      groupType: 'Yuvak Mandal',
      village: 'McLeod Ganj',
      panchayat: 'Dharamsala',
      district: 'Kangra',
      leaderName: 'Rajesh Kumar',
      mobile: '9876543211',
      membersCount: 18,
      status: 'Active',
      organizationId: kangraNgo._id
    }).save();

    // 7. Create Target Assignments
    logger.info('Seeding Target Assignments...');
    const assignment1 = await new Assignment({
      groupId: gauriMandal._id,
      landArea: 6.5, // 6.5 hectares
      targetPlants: 600,
      species: ['Deodar (Himalayan Cedar)', 'Ban Oak'],
      assignedOfficer: volunteer._id,
      organizationId: kangraNgo._id,
      status: 'IN_PROGRESS',
      actualPlantsPlanted: 420
    }).save();

    const assignment2 = await new Assignment({
      groupId: shaktiMandal._id,
      landArea: 4.0, // 4 hectares
      targetPlants: 400,
      species: ['Kail (Blue Pine)', 'Harad'],
      assignedOfficer: volunteer._id,
      organizationId: hpForestOrg._id,
      status: 'PENDING',
      actualPlantsPlanted: 0
    }).save();

    // 8. Create Plantation Events
    logger.info('Seeding Plantation Events...');
    const driveEvent = await new PlantationEvent({
      assignmentId: assignment1._id,
      eventName: 'Palampur Monsoon Greening Drive 2026',
      eventDate: new Date('2026-05-15'),
      location: 'Palampur Valley Forest Area',
      latitude: 32.1126,
      longitude: 76.5369,
      organizedBy: volunteer._id,
      organizer: 'Gauri Devi',
      remarks: 'Excellent participation by local Mahila Mandal. Weather was humid and supportive for tree roots.',
      status: 'COMPLETED',
      expectedParticipants: 40,
      actualParticipants: 35,
      treesPlanted: 420
    }).save();

    // 9. Seed Individual Trees with Precise Coordinates around Kangra/Palampur/Dharamsala
    logger.info('Seeding Trees...');
    const treeData = [
      { id: 'TR-DEO-1001', lat: 32.1128, lng: 76.5371, status: 'HEALTHY', stage: 'SAPLING', species: deodar._id },
      { id: 'TR-DEO-1002', lat: 32.1125, lng: 76.5367, status: 'GROWING', stage: 'SEEDLING', species: deodar._id },
      { id: 'TR-OAK-1003', lat: 32.1130, lng: 76.5375, status: 'HEALTHY', stage: 'YOUNG', species: banOak._id },
      { id: 'TR-OAK-1004', lat: 32.1120, lng: 76.5360, status: 'WEAK', stage: 'SAPLING', species: banOak._id },
      { id: 'TR-DEO-1005', lat: 32.1135, lng: 76.5380, status: 'DEAD', stage: 'SAPLING', species: deodar._id }
    ];

    const seededTrees = [];
    for (const data of treeData) {
      const tree = await new Tree({
        treeId: data.id,
        assignmentId: assignment1._id,
        eventId: driveEvent._id,
        speciesId: data.species,
        groupId: gauriMandal._id,
        plantedBy: citizen._id,
        plantedDate: new Date('2026-05-15'),
        location: 'Palampur Watershed Block B',
        latitude: data.lat,
        longitude: data.lng,
        status: data.status,
        growthStage: data.stage,
        verificationStatus: data.status === 'DEAD' ? 'PENDING' : 'VERIFIED',
        verificationDate: new Date('2026-05-20'),
        verifiedBy: volunteer._id,
        remarks: data.status === 'WEAK' ? 'Needs additional watering due to steep slope.' : ''
      }).save();
      seededTrees.push(tree);
    }

    // 10. Seed Inspections for Monitoring
    logger.info('Seeding Inspections...');
    
    // Completed inspection for the WEAK tree
    await new Inspection({
      treeId: seededTrees[3]._id,
      assignedTo: volunteer._id,
      assignedBy: superAdmin._id,
      scheduledDate: new Date('2026-05-28'),
      status: 'COMPLETED',
      priority: 'HIGH',
      treeStatus: 'WEAK',
      healthScore: 4,
      remarks: 'Soil surrounding the roots is extremely dry. Water channel needs reconstruction.'
    }).save();

    // Pending inspection for the DEAD tree to demo audit workflow
    await new Inspection({
      treeId: seededTrees[4]._id,
      assignedTo: volunteer._id,
      assignedBy: superAdmin._id,
      scheduledDate: new Date('2026-06-05'),
      status: 'PENDING',
      priority: 'CRITICAL',
      treeStatus: 'DEAD',
      healthScore: 1,
      remarks: 'Sapling completely withered. Sapling replacement required.'
    }).save();

    logger.info('Seed data completed successfully!');
    
    console.log('\n=== HP EVERGREEN SEED COMPLETED ===');
    console.log('Credentials (Same for backward compatibility):');
    console.log('- Super Admin: admin@school.com / Admin123!@#');
    console.log('- Org Admin (NGO): schooladmin@school.com / SchoolAdmin123!@#');
    console.log('- Volunteer (Guard): teacher@school.com / Teacher123!@#');
    console.log('- Citizen (Farmer): student@school.com / Student123!@#');
    console.log('====================================\n');
    
    process.exit(0);

  } catch (error) {
    logger.error('HP Evergreen Seeding failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

// Run seeding
seedData();

