const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@guideconnect.com';
  const password = 'admin12345';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('✅ Admin already exists:', email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      name: 'GuideConnect Admin',
      email,
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin created:');
  console.log('   Email:', email);
  console.log('   Password:', password);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });