import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma/client';

const prisma = new PrismaClient();

let passed = 0;
let failed = 0;

function check(name: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.log(`  ✗ ${name}${detail ? `: ${detail}` : ''}`);
    failed++;
  }
}

async function runTests() {
  console.log('\nTesting Database (Prisma)...\n');

  let userId: number;
  let locationId: number;
  let reviewId: number;

  // --- Create User ---
  console.log('📍 Create User');
  const user = await prisma.user.create({
    data: {
      username: `test_user_${Date.now()}`,
      profileImageUrl: null,
    },
  });
  userId = user.id;
  check('User created', !!user.id);
  check('Username stored', user.username.startsWith('test_user_'));

  // --- Create Location ---
  console.log('\n📍 Create Location');
  const location = await prisma.location.create({
    data: {
      id : 123,
      name: 'Test Venue',
      address: '123 Main St',
      city: 'Ann Arbor',
      state: 'MI',
      zip: '48104',
      latitude: 42.2808,
      longitude: -83.7462,
      reviewCount: 0,
    },
  });
  locationId = location.id;
  check('Location created', !!location.id);
  check('Name stored', location.name === 'Test Venue');
  check('Coordinates stored', location.latitude === 42.2808 && location.longitude === -83.7462);

  // --- Create Review ---
  console.log('\n📍 Create Review');
  const review = await prisma.review.create({
    data: {
      title: 'Great accessibility',
      rating: 5,
      comment: 'Ramps, wide aisles, very accessible.',
      userId,
      locationId,
    },
  });
  reviewId = review.id;
  check('Review created', !!review.id);
  check('Rating stored', review.rating === 5);
  check('Linked to user', review.userId === userId);
  check('Linked to location', review.locationId === locationId);

  // --- Read back with relations ---
  console.log('\n📍 Read Review with relations');
  const full = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { user: true, location: true },
  });
  check('Review found', !!full);
  check('User relation loaded', full?.user?.id === userId);
  check('Location relation loaded', full?.location?.id === locationId);

  // --- Cleanup ---
  console.log('\n📍 Cleanup');
  await prisma.review.delete({ where: { id: reviewId } });
  await prisma.location.delete({ where: { id: locationId } });
  await prisma.user.delete({ where: { id: userId } });
  check('Test data deleted', true);

  // --- Summary ---
  console.log(`\n${'='.repeat(32)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests()
  .catch((err) => {
    console.error('\n✗ Unexpected error:', err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
