import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');

  // Check or create demo user
  const demoEmail = 'demo@fintrack.app';
  let demoUser = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        email: demoEmail,
        password: hashedPassword,
        name: 'Mounika',
        currency: '₹',
        theme: 'dark',
        accountType: 'Personal Account',
        monthlyIncomeGoal: 80000,
      },
    });
    console.log('✅ Created demo user: demo@fintrack.app');
  } else {
    console.log('ℹ️ Demo user exists. Updating demo dataset...');
    // Clean old records for clean seed
    await prisma.transaction.deleteMany({ where: { userId: demoUser.id } });
    await prisma.budget.deleteMany({ where: { userId: demoUser.id } });
    await prisma.savingsGoal.deleteMany({ where: { userId: demoUser.id } });
    await prisma.notification.deleteMany({ where: { userId: demoUser.id } });
  }

  // Current Month Transactions (Income: ₹80,000, Expenses: ₹42,500, Balance: ₹37,500)
  const transactionsData = [
    {
      userId: demoUser.id,
      title: 'TechCorp Salary',
      amount: 75000,
      type: 'income',
      category: 'Salary',
      date: `${currentYear}-${currentMonth}-01`,
      paymentMethod: 'Bank Transfer',
      notes: 'Monthly payroll deposit',
    },
    {
      userId: demoUser.id,
      title: 'Freelance UI Consultation',
      amount: 5000,
      type: 'income',
      category: 'Freelance',
      date: `${currentYear}-${currentMonth}-03`,
      paymentMethod: 'UPI',
      notes: 'Design review for SaaS dashboard',
    },
    {
      userId: demoUser.id,
      title: 'Apartment Rent',
      amount: 18000,
      type: 'expense',
      category: 'Rent & Housing',
      date: `${currentYear}-${currentMonth}-01`,
      paymentMethod: 'Bank Transfer',
      notes: 'Monthly flat rent paid to landlord',
    },
    {
      userId: demoUser.id,
      title: 'Organic Grocery Mart',
      amount: 6500,
      type: 'expense',
      category: 'Groceries',
      date: `${currentYear}-${currentMonth}-04`,
      paymentMethod: 'Credit Card',
      notes: 'Weekly pantry restocking and vegetables',
    },
    {
      userId: demoUser.id,
      title: 'Zara Fashion & Apparel',
      amount: 4500,
      type: 'expense',
      category: 'Shopping',
      date: `${currentYear}-${currentMonth}-08`,
      paymentMethod: 'Credit Card',
      notes: 'Work wardrobe essentials',
    },
    {
      userId: demoUser.id,
      title: 'Weekend Dining with Friends',
      amount: 3500,
      type: 'expense',
      category: 'Food & Dining',
      date: `${currentYear}-${currentMonth}-06`,
      paymentMethod: 'Credit Card',
      notes: 'Barbeque dinner outing',
    },
    {
      userId: demoUser.id,
      title: 'Fuel & Commute Recharge',
      amount: 3200,
      type: 'expense',
      category: 'Transport',
      date: `${currentYear}-${currentMonth}-10`,
      paymentMethod: 'UPI',
      notes: 'Metro card topup & petrol',
    },
    {
      userId: demoUser.id,
      title: 'Electricity & High-Speed WiFi',
      amount: 2800,
      type: 'expense',
      category: 'Utilities',
      date: `${currentYear}-${currentMonth}-12`,
      paymentMethod: 'UPI',
      notes: 'Bescom bill & ACT Fiber broadband',
    },
    {
      userId: demoUser.id,
      title: 'Pharmacy & Wellness Checkup',
      amount: 2000,
      type: 'expense',
      category: 'Healthcare',
      date: `${currentYear}-${currentMonth}-14`,
      paymentMethod: 'Debit Card',
      notes: 'Vitamins and routine prescriptions',
    },
    {
      userId: demoUser.id,
      title: 'Netflix & Spotify Premium',
      amount: 1500,
      type: 'expense',
      category: 'Entertainment',
      date: `${currentYear}-${currentMonth}-15`,
      paymentMethod: 'Credit Card',
      notes: 'Monthly digital entertainment subscriptions',
    },
    {
      userId: demoUser.id,
      title: 'Swiggy Food Delivery',
      amount: 500,
      type: 'expense',
      category: 'Food & Dining',
      date: `${currentYear}-${currentMonth}-02`,
      paymentMethod: 'UPI',
      notes: 'Dinner combo with dessert',
    },
  ];

  // Seed past 5 months for historical analytics
  for (let i = 1; i <= 5; i++) {
    const pastDate = new Date(currentYear, now.getMonth() - i, 1);
    const pastYM = `${pastDate.getFullYear()}-${String(pastDate.getMonth() + 1).padStart(2, '0')}`;
    const baseInc = 70000 + i * 1500;
    const baseExp = 38000 + (i % 3) * 2000;

    transactionsData.push({
      userId: demoUser.id,
      title: 'TechCorp Salary',
      amount: baseInc,
      type: 'income',
      category: 'Salary',
      date: `${pastYM}-01`,
      paymentMethod: 'Bank Transfer',
      notes: 'Monthly payroll',
    });
    transactionsData.push({
      userId: demoUser.id,
      title: 'Apartment Rent',
      amount: 18000,
      type: 'expense',
      category: 'Rent & Housing',
      date: `${pastYM}-01`,
      paymentMethod: 'Bank Transfer',
      notes: 'Monthly flat rent',
    });
    transactionsData.push({
      userId: demoUser.id,
      title: 'Groceries & Household',
      amount: baseExp - 18000,
      type: 'expense',
      category: 'Groceries',
      date: `${pastYM}-05`,
      paymentMethod: 'Credit Card',
      notes: 'Monthly groceries',
    });
  }

  await prisma.transaction.createMany({ data: transactionsData });
  console.log(`✅ Seeded ${transactionsData.length} transactions`);

  // Budgets
  const budgetsData = [
    { userId: demoUser.id, category: 'Rent & Housing', monthlyLimit: 20000 },
    { userId: demoUser.id, category: 'Groceries', monthlyLimit: 8000 },
    { userId: demoUser.id, category: 'Food & Dining', monthlyLimit: 5000 },
    { userId: demoUser.id, category: 'Shopping', monthlyLimit: 6000 },
    { userId: demoUser.id, category: 'Utilities', monthlyLimit: 3500 },
    { userId: demoUser.id, category: 'Transport', monthlyLimit: 4000 },
    { userId: demoUser.id, category: 'Entertainment', monthlyLimit: 2500 },
    { userId: demoUser.id, category: 'Healthcare', monthlyLimit: 3000 },
  ];
  await prisma.budget.createMany({ data: budgetsData });
  console.log(`✅ Seeded ${budgetsData.length} budgets`);

  // Savings Goals
  const savingsData = [
    {
      userId: demoUser.id,
      title: 'Emergency Fund',
      targetAmount: 150000,
      currentAmount: 90000,
      category: 'Security',
      targetDate: '2026-12-31',
      icon: '🛡️',
    },
    {
      userId: demoUser.id,
      title: 'Goa Vacation',
      targetAmount: 35000,
      currentAmount: 22500,
      category: 'Travel',
      targetDate: '2026-11-20',
      icon: '🏖️',
    },
    {
      userId: demoUser.id,
      title: 'New MacBook Pro M3',
      targetAmount: 180000,
      currentAmount: 110000,
      category: 'Gadgets',
      targetDate: '2027-03-31',
      icon: '💻',
    },
  ];
  await prisma.savingsGoal.createMany({ data: savingsData });
  console.log(`✅ Seeded ${savingsData.length} savings goals`);

  // Notifications
  const notificationsData = [
    {
      userId: demoUser.id,
      title: 'Rent Payment Recorded',
      message: '₹18,000 was recorded for Apartment Rent.',
      type: 'info',
      read: false,
    },
    {
      userId: demoUser.id,
      title: 'Budget Alert',
      message: 'Food & Dining has reached 80% of its monthly limit.',
      type: 'warning',
      read: false,
    },
    {
      userId: demoUser.id,
      title: 'Savings Milestone',
      message: 'Emergency Fund passed 60% of target!',
      type: 'success',
      read: true,
    },
  ];
  await prisma.notification.createMany({ data: notificationsData });
  console.log(`✅ Seeded ${notificationsData.length} notifications`);

  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
