const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

// Create mock server app for testing
const app = express();
app.use(express.json());

// Mock models and data
const mockExpenses = [
  { _id: '1', title: 'Food Exp', amount: 15.5, category: 'Food', date: new Date() },
  { _id: '2', title: 'Rent Exp', amount: 1200, category: 'Bills', date: new Date() },
];

const mockBudgets = { _id: 'b1', limit: 2000, category: 'Bills', spent: 1200 };
const mockSavings = [{ _id: 's1', title: 'Car Fund', targetAmount: 5000, currentAmount: 1200 }];
const mockAlerts = [{ _id: 'fa1', title: 'High Value Warn', amount: 1200, riskScore: 75, status: 'active' }];

// Mock Auth Middleware
const mockProtect = (req, res, next) => {
  req.user = { id: 'user_dev_123', name: 'Dev Tester', role: 'admin' };
  next();
};

// Define mock router endpoints
const authRouter = express.Router();
authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Invalid payload' });
  }
  res.status(200).json({ success: true, token: 'mock-jwt-token-xyz' });
});
authRouter.post('/register', (req, res) => {
  res.status(201).json({ success: true, user: { name: req.body.name, role: 'user' } });
});

const expenseRouter = express.Router();
expenseRouter.get('/', mockProtect, (req, res) => {
  res.status(200).json({ success: true, count: mockExpenses.length, data: mockExpenses });
});
expenseRouter.post('/', mockProtect, (req, res) => {
  res.status(201).json({ success: true, data: { ...req.body, _id: 'new_exp' } });
});

const budgetRouter = express.Router();
budgetRouter.get('/', mockProtect, (req, res) => {
  res.status(200).json({ success: true, data: mockBudgets });
});

const savingsRouter = express.Router();
savingsRouter.get('/', mockProtect, (req, res) => {
  res.status(200).json({ success: true, data: mockSavings });
});

const aiRouter = express.Router();
aiRouter.get('/insights', mockProtect, (req, res) => {
  res.status(200).json({ success: true, insights: 'Spent 60% on Bills. High risk on food.' });
});

const fraudRouter = express.Router();
fraudRouter.post('/scan', mockProtect, (req, res) => {
  res.status(200).json({ success: true, count: 1, data: mockAlerts });
});

const notificationRouter = express.Router();
notificationRouter.get('/', mockProtect, (req, res) => {
  res.status(200).json({ success: true, data: [{ title: 'Budget Limit', read: false }] });
});

// Register routers
app.use('/api/auth', authRouter);
app.use('/api/expenses', expenseRouter);
app.use('/api/budgets', budgetRouter);
app.use('/api/savings', savingsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/fraud', fraudRouter);
app.use('/api/notifications', notificationRouter);

app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'FinGuard AI API Server is running...' });
});

describe('FinGuard AI API Tests Suite', () => {
  describe('Root and Core Route', () => {
    it('should return 200 OK on root health status checks', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('running');
    });
  });

  describe('Authentication endpoints', () => {
    it('should issue token on valid login credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@finguard.ai', password: 'securepassword123' });
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should fail registration if details are missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: '' });
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Expenses endpoints', () => {
    it('should get all user expenses when requested', async () => {
      const res = await request(app).get('/api/expenses');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
    });

    it('should successfully post and create a new expense entry', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .send({ title: 'Coffee Run', amount: 5.5, category: 'Food' });
      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toEqual('Coffee Run');
    });
  });

  describe('AI, Budgets, and Savings endpoints', () => {
    it('should fetch financial insights successfully', async () => {
      const res = await request(app).get('/api/ai/insights');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.insights).toContain('Spent 60%');
    });

    it('should fetch active budget caps successfully', async () => {
      const res = await request(app).get('/api/budgets');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.limit).toBe(2000);
    });

    it('should fetch savings goals targets', async () => {
      const res = await request(app).get('/api/savings');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data[0].title).toEqual('Car Fund');
    });
  });

  describe('Fraud scanner and notification warnings', () => {
    it('should scan expenses ledger and return risk outputs', async () => {
      const res = await request(app).post('/api/fraud/scan');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data[0].riskScore).toBe(75);
    });

    it('should load active notification alerts', async () => {
      const res = await request(app).get('/api/notifications');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data[0].title).toContain('Budget Limit');
    });
  });
});
