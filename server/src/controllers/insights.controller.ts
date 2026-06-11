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

// ✅ BULLETPROOF HELPER: Safely extracts the balance whether Mongoose uses a Map or a plain object
const getSafeBalance = (user: any, leaveName: string, defaultQuota: number) => {
  if (!user || !user.leaveBalances) return defaultQuota;
  
  let val;
  if (typeof user.leaveBalances.get === 'function') {
    // If it's a Mongoose Map
    val = user.leaveBalances.get(leaveName);
  } else {
    // If it's a plain Javascript Object
    val = user.leaveBalances[leaveName];
  }
  
  return (val !== undefined && val !== null) ? val : defaultQuota;
};

export const getEmployeeInsights = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const gender = req.user.gender?.toLowerCase();

    // Fetch all leave categories
    const leaveSettings = await LeaveSetting.find({});
    let leaveSummary = "Here is the summary of the employee's current leave balances:\n";

    leaveSettings.forEach(setting => {
      const name = setting.name.toLowerCase();
      
      // Filter out mismatched gender leaves
      if (gender === 'male' && name.includes('maternity')) return;
      if (gender === 'female' && name.includes('paternity')) return;

      const quota = setting.defaultDays;
      // ✅ Use our new helper function
      const balance = getSafeBalance(req.user, setting.name, quota);
      
      leaveSummary += `- ${setting.name}: ${balance} days remaining out of ${quota} total.\n`;
    });

    // Find when they last took ANY approved break
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

    // Construct the Prompt
    const prompt = `
      You are an empathetic, professional HR assistant inside a portal called Team Hub.
      The employee's name is ${req.user.firstName}.
      They ${lastLeaveText}.

      ${leaveSummary}

      Write a friendly 2-sentence proactive suggestion for their dashboard. 
      - First whenever the employee log in greet them by name and acknowledge their hard work.
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
    const gender = req.user.gender?.toLowerCase();

    const leaveSettings = await LeaveSetting.find({});
    let leaveSummary = "Employee Leave Balances:\n";

    leaveSettings.forEach(setting => {
      const name = setting.name.toLowerCase();
      
      // Filter out mismatched gender leaves
      if (gender === 'male' && name.includes('maternity')) return;
      if (gender === 'female' && name.includes('paternity')) return;

      const quota = setting.defaultDays;
      // ✅ Use our new helper function
      const balance = getSafeBalance(req.user, setting.name, quota);
      
      leaveSummary += `- ${setting.name}: ${balance} days remaining (Yearly Quota: ${quota})\n`;
    });

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: `You are an integrated HR assistant inside a portal called Team Hub. 
      You are talking to an employee named ${req.user.firstName}. 
      
      ${leaveSummary}
      
      Keep answers extremely brief, friendly, and helpful. Do not use markdown formatting like bolding or lists unless necessary. Answer questions directly based on the balances provided above.`
    });

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