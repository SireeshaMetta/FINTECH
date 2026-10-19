const { GoogleGenerativeAI } = require('@google/generative-ai');
const Expense = require('../models/Expense');

// Initialize Gemini AI Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'mock_key') {
    return null;
  }
  try {
    return new GoogleGenerativeAI(apiKey);
  } catch (err) {
    console.error('Failed to initialize GoogleGenerativeAI:', err.message);
    return null;
  }
};

// Helper for Mock Insights (fallback when Gemini API key is missing or invalid)
const getMockInsights = (expensesList) => {
  const totalSpent = expensesList.reduce((sum, exp) => sum + exp.amount, 0);
  const count = expensesList.length;

  return {
    summary: `Based on your recent ${count} transactions totaling $${totalSpent.toFixed(2)}, your financial standing is stable. The majority of your transactions are in typical day-to-day categories.`,
    suggestions: [
      'Consolidate shopping items into weekly batches to minimize transport costs.',
      'Audit subscription services under your "Bills" category to see if any can be trimmed.',
      'Consider moving 15% of your remaining monthly budget into a dedicated Savings Goal.',
    ],
    predictions: `Next month, we forecast a potential 5-8% increase in category spend if utility bills follow seasonal trends. We advise locking in a $150 threshold buffer.`,
    riskLevel: totalSpent > 2500 ? 'Moderate' : 'Low',
    scamAdvice: 'Keep alert: FinGuard detected zero suspicious billing codes or UPI velocity warnings in your ledger this week.',
  };
};

// @desc    Get AI Spending Insights
// @route   GET /api/ai/insights
// @access  Private
exports.getInsights = async (req, res, next) => {
  try {
    // Fetch user expenses
    const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 }).limit(100);

    if (expenses.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          summary: 'You have not registered any transactions yet. Add some expenses to generate personalized AI Insights!',
          suggestions: ['Add your first expense to begin.', 'Create a savings goal to trace progress.'],
          predictions: 'No predictions can be made yet.',
          riskLevel: 'Unknown',
          scamAdvice: 'Be cautious: never click on suspicious links in UPI request logs.',
        },
      });
    }

    const genAI = getGeminiClient();
    if (!genAI) {
      // Return mock data if API key is not present/valid
      const mockData = getMockInsights(expenses);
      return res.status(200).json({
        success: true,
        data: mockData,
        isMock: true,
      });
    }

    // Format expenses for AI prompt
    const formattedExpenses = expenses
      .map((e) => `- ${e.title}: $${e.amount} (${e.category}) on ${e.date.toISOString().split('T')[0]}`)
      .join('\n');

    const prompt = `
You are FinGuard AI, a Senior Financial Advisor. Analyze the user's spending data and return a JSON object with exactly the following structure:
{
  "summary": "a short 2-3 sentence overview of their spending patterns",
  "suggestions": ["list item 1", "list item 2", "list item 3"],
  "predictions": "a 1-2 sentence projection of their upcoming bills next month",
  "riskLevel": "Low", "Moderate", or "High"
}

Here are the user's transactions:
${formattedExpenses}

Provide only the valid JSON structure. Do not include markdown code block formatting or notes outside of the JSON object.
`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    try {
      const parsedData = JSON.parse(responseText.trim().replace(/^```json/, '').replace(/```$/, ''));
      res.status(200).json({
        success: true,
        data: parsedData,
      });
    } catch (parseError) {
      // Fallback if AI response format isn't clean JSON
      const mockData = getMockInsights(expenses);
      res.status(200).json({
        success: true,
        data: {
          ...mockData,
          rawResponse: responseText,
        },
        isMock: true,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Chat with AI Financial Assistant
// @route   POST /api/ai/chat
// @access  Private
exports.chatWithAssistant = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please include a message',
      });
    }

    const genAI = getGeminiClient();
    if (!genAI) {
      // Simulating chat answers
      const lowerMsg = message.toLowerCase();
      let reply = "I'm your FinGuard AI Assistant. How can I help you improve your security or budget?";
      if (lowerMsg.includes('budget') || lowerMsg.includes('spend')) {
        reply = "Creating category-wise budgets is a great way to start. Under the 'Budget' tab, you can set limits for Food, Transport, and Entertainment to control excess expenditures.";
      } else if (lowerMsg.includes('scam') || lowerMsg.includes('fraud')) {
        reply = "Always verify unsolicited messages claiming you won a sweepstakes or requesting verification of suspicious UPI transfers. FinGuard grades transaction risk levels to help secure your ledger.";
      } else if (lowerMsg.includes('save') || lowerMsg.includes('saving')) {
        reply = "Setting specific deadlines on your Savings Goals makes them actionable. We recommend starting with a small emergency reserve goal and contributing weekly.";
      }

      return res.status(200).json({
        success: true,
        reply,
        isMock: true,
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Format chat history for Gemini
    const chatSession = model.startChat({
      history: history.map((h) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      })),
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chatSession.sendMessage(message);
    const replyText = result.response.text();

    res.status(200).json({
      success: true,
      reply: replyText,
    });
  } catch (error) {
    next(error);
  }
};
