import { Request, Response, NextFunction } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LeaveRequest } from '../models/LeaveRequest.model.js';
import { IUser } from '../models/User.model.js'; 
import { LeaveSetting } from '../models/LeaveSetting.model.js';

interface AuthRequest extends Request {
  user?: IUser | any; 
}

// Initialize the Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const getEmployeeInsights = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    // 1. DYNAMICALLY FETCH ALL LEAVE CATEGORIES
    const leaveSettings = await LeaveSetting.find({});
    let leaveSummary = "Here is the summary of the employee's current leave balances:\n";

    // Loop through every leave type a manager has created
    leaveSettings.forEach(setting => {
      const quota = setting.defaultDays;
      // Find the user's balance, or default to the full quota if they haven't used any
      const balance = req.user.leaveBalances?.[setting.name] ?? quota;
      leaveSummary += `- ${setting.name}: ${balance} days remaining out of ${quota} total.\n`;
    });

    // 2. Find when they last took ANY approved break
    const lastLeave = await LeaveRequest.findOne({
      employeeId: req.user._id,
      status: 'approved' 
    }).sort({ endDate: -1 }); 

    let lastLeaveText = "hasn't taken any leave recently";
    if (lastLeave) {
      const lastLeaveDate = new Date(lastLeave.endDate);
      const daysSinceLastLeave = Math.floor((new Date().getTime() - lastLeaveDate.getTime()) / (1000 * 3600 * 24));
      lastLeaveText = `last took a break ${daysSinceLastLeave} days ago`;
    }

    // 3. Construct the Prompt with the dynamic list
    const prompt = `
      You are an empathetic, professional HR assistant inside a portal called Team Hub.
      The employee's name is ${req.user.firstName}.
      They ${lastLeaveText}.

      ${leaveSummary}

      Write a friendly 2-sentence proactive suggestion for their dashboard. 
      - Do NOT list all their leaves to them. Just look at the numbers and make a smart observation.
      - If they are running out of a major leave type (like Annual or Sick), advise them to plan carefully.
      - If they haven't taken a break in over 60 days, encourage them to use some time to recharge.
      - Keep the tone warm, human, and concise. Do not use hashtags or emojis.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    res.json({ suggestion: result.response.text() });

  } catch (error) {
    console.error("AI Insight Error:", error);
    res.json({ suggestion: "Take a deep breath and have a great day at work! Keep up the great effort." });
  }
};


// ==========================================
// CHAT FUNCTION
// ==========================================

export const chatWithEmployee = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { message, history } = req.body;

    // 1. DYNAMICALLY FETCH ALL LEAVES FOR THE CHATBOT CONTEXT
    const leaveSettings = await LeaveSetting.find({});
    let leaveSummary = "Employee Leave Balances:\n";

    leaveSettings.forEach(setting => {
      const quota = setting.defaultDays;
      const balance = req.user.leaveBalances?.[setting.name] ?? quota;
      leaveSummary += `- ${setting.name}: ${balance} days remaining (Yearly Quota: ${quota})\n`;
    });

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: `You are an integrated HR assistant inside a portal called Team Hub. 
      You are talking to an employee named ${req.user.firstName}. 
      
      ${leaveSummary}
      
      Keep answers extremely brief, friendly, and helpful. Do not use markdown formatting like bolding or lists unless necessary. Answer questions directly based on the balances provided above.`
    });

    // Validate history
    let validHistory = history || [];
    if (validHistory.length > 0 && validHistory[0].role === 'model') {
      validHistory = [
        { role: 'user', parts: [{ text: 'Hello, can you give me my proactive HR suggestion for today?' }] },
        ...validHistory
      ];
    }

    const chat = model.startChat({ history: validHistory });
    const result = await chat.sendMessage(message);

    res.json({ reply: result.response.text() });

  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ reply: "I'm having a little trouble connecting right now. Please try again later!" });
  }
};