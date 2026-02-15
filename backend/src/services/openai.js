import OpenAI from 'openai';

function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error('OpenAI API key is not configured. Set OPENAI_API_KEY in .env.');
  }
  return new OpenAI({ apiKey: key });
}

function parseRelativeDate(dateString) {
  const today = new Date();
  const normalized = dateString.toLowerCase().trim();
  
  if (normalized.includes('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  if (normalized.includes('today')) {
    return today.toISOString().split('T')[0];
  }

  const nextDayMatch = normalized.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);
  if (nextDayMatch) {
    const dayName = nextDayMatch[1];
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = daysOfWeek.indexOf(dayName);
    const currentDay = today.getDay();
    let daysUntilTarget = (targetDay - currentDay + 7) % 7;
    if (daysUntilTarget === 0) daysUntilTarget = 7; 
    
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + daysUntilTarget);
    return targetDate.toISOString().split('T')[0];
  }

  const thisDayMatch = normalized.match(/this\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);
  if (thisDayMatch) {
    const dayName = thisDayMatch[1];
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = daysOfWeek.indexOf(dayName);
    const currentDay = today.getDay();
    let daysUntilTarget = (targetDay - currentDay + 7) % 7;
    
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + daysUntilTarget);
    return targetDate.toISOString().split('T')[0];
  }

  const dayMatch = normalized.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
  if (dayMatch) {
    const dayName = dayMatch[1];
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = daysOfWeek.indexOf(dayName);
    const currentDay = today.getDay();
    let daysUntilTarget = (targetDay - currentDay + 7) % 7;
    if (daysUntilTarget === 0) daysUntilTarget = 7; 
    
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + daysUntilTarget);
    return targetDate.toISOString().split('T')[0];
  }

  const dateMatch = normalized.match(/\b(\d{1,2})(?:st|nd|rd|th)?(?:\s+(?:of\s+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*)?\b/);
  if (dateMatch) {
    const day = parseInt(dateMatch[1]);
    const monthStr = dateMatch[2];
    const month = monthStr ? new Date(monthStr + ' 1, 2000').getMonth() : today.getMonth();
    const year = today.getFullYear();
    
    const targetDate = new Date(year, month, day);
    if (targetDate < today) {
      targetDate.setFullYear(year + 1);
    }
    return targetDate.toISOString().split('T')[0];
  }
  
  return dateString; 
}

function fallbackExtractActionItems(text) {
  const items = [];
  const actionPatterns = [
    /(?:^|\n)\s*[-*•]\s*(.+?)(?=\n|$)/gi,
    /(?:^|\n)\s*\d+[.)]\s*(.+?)(?=\n|$)/gi,
    /(?:will|need to|have to|going to|should|must)\s+([^.\n]+?)(?=[.\n]|$)/gi,
    /(?:action|todo|to do|follow up|follow-up)\s*:?\s*([^.\n]+?)(?=[.\n]|$)/gi,
  ];
  
  const nameMatches = text.match(/Attendees:.*\n([\s\S]*?)(?=\n\n|\nDate:|$)/i);
  const participantNames = [];
  if (nameMatches) {
    const attendeesLine = nameMatches[1];
    const names = attendeesLine.match(/\b([A-Z][a-z]+)\b/g);
    if (names) {
      participantNames.push(...names);
    }
  }

  const contentNames = text.match(/\b([A-Z][a-z]+):\s*/g);
  if (contentNames) {
    const speakerNames = contentNames.map(match => match.replace(':', '').trim());
    participantNames.push(...speakerNames);
  }
  
  const uniqueNames = [...new Set(participantNames)];

  const ownerPatterns = [
    new RegExp(`\\b(${uniqueNames.join('|')})\\b\\s+(?:will|needs? to|should|must|going to|has to)`, 'gi'),
    /(?:I'll|I will|I need to|I have to|I'm going to)\s+([^.\n]+)/gi,
    /\b([A-Z][a-z]+)\b\s+(?:will|needs? to|should|must|going to|has to)/gi,
  ];

  const dueDatePatterns = [
    /(?:by|before|on)\s+(?:next\s+)?(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/gi,
    /(?:by|before|on)\s+(?:this\s+)?(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/gi,
    /(?:by|before|on)\s+tomorrow/gi,
    /(?:by|before|on)\s+today/gi,
    /(?:by|before|on)\s+(?:next\s+)?week/gi,
    /(?:by|before|on)\s+\d{1,2}(?:st|nd|rd|th)?(?:\s+(?:of\s+)?(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*)?/gi,
    /(?:by|before|on)\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?/gi,
  ];
  
  const seen = new Set();
  const normalize = (s) => s.replace(/\s+/g, ' ').trim();

  for (const re of actionPatterns) {
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(text)) !== null) {
      const fullMatch = m[0] || m[1];
      const task = normalize(m[1] || m[0]);
      
      if (task.length > 3 && task.length < 500 && !seen.has(task.toLowerCase())) {
        seen.add(task.toLowerCase());
        
        let owner = null;
        for (const ownerRe of ownerPatterns) {
          const ownerMatch = fullMatch.match(ownerRe);
          if (ownerMatch) {
            if (ownerMatch[0].startsWith('I')) {
              owner = 'Speaker';
            } else if (ownerMatch[1]) {
              owner = ownerMatch[1];
            }
            break;
          }
        }

        let dueDate = null;
        for (const dueRe of dueDatePatterns) {
          const dueMatch = fullMatch.match(dueRe);
          if (dueMatch) {
            dueDate = parseRelativeDate(dueMatch[0]);
            break;
          }
        }

        const tags = [];
        const taskLower = task.toLowerCase();
        if (taskLower.includes('develop') || taskLower.includes('code') || taskLower.includes('setup') || taskLower.includes('architecture') || taskLower.includes('api')) {
          tags.push('development');
        }
        if (taskLower.includes('design') || taskLower.includes('wireframe') || taskLower.includes('mockup') || taskLower.includes('responsive') || taskLower.includes('ui') || taskLower.includes('ux')) {
          tags.push('design');
        }
        if (taskLower.includes('research') || taskLower.includes('interview') || taskLower.includes('persona') || taskLower.includes('journey')) {
          tags.push('research');
        }
        if (taskLower.includes('test') || taskLower.includes('qa') || taskLower.includes('testing') || taskLower.includes('penetration')) {
          tags.push('testing');
        }
        if (taskLower.includes('client') || taskLower.includes('brand') || taskLower.includes('user')) {
          tags.push('client');
        }
        if (taskLower.includes('meeting') || taskLower.includes('review') || taskLower.includes('planning')) {
          tags.push('meeting');
        }
        if (taskLower.includes('document') || taskLower.includes('wiki') || taskLower.includes('documentation')) {
          tags.push('documentation');
        }
        if (taskLower.includes('mobile') || taskLower.includes('responsive')) {
          tags.push('mobile');
        }
        if (taskLower.includes('security') || taskLower.includes('authentication') || taskLower.includes('penetration')) {
          tags.push('security');
        }
        if (taskLower.includes('performance') || taskLower.includes('optimize') || taskLower.includes('load')) {
          tags.push('performance');
        }
        
        items.push({ task, owner, due_date: dueDate, tags });
      }
    }
  }

  if (items.length === 0) {
    const lines = text.split(/\n+/).map((l) => normalize(l)).filter((l) => l.length > 10 && l.length < 300);
    for (const line of lines.slice(0, 20)) {
      if (!seen.has(line.toLowerCase())) {
        seen.add(line.toLowerCase());
        items.push({ task: line, owner: null, due_date: null, tags: [] });
      }
    }
  }
  return items;
}

const EXTRACT_PROMPT = `You are a meeting assistant.
Extract all action items from the transcript.
Return only valid JSON in this format:

[
  {
    "task": "",
    "owner": null,
    "due_date": null,
    "tags": []
  }
]

Rules:
- Extract clear, actionable tasks
- Identify the person responsible (owner) - look for names like "John", "Sarah", "Emily", "Mike" or phrases like "I'll", "I need to", "I have to"
- Extract specific due dates - look for "by Monday", "by tomorrow", "by Wednesday", "next week", "this Friday", etc.
- Convert relative dates to specific dates when possible (e.g., "next Monday" -> actual date)
- If owner not found, use null
- If due date not found, use null
- Infer relevant tags from context (e.g., "development", "design", "client", "meeting", "documentation")
- Do not return any text outside JSON

Examples of good extraction:
- "John will set up the development environment by next Monday" -> task: "set up the development environment", owner: "John", due_date: "next Monday"
- "I need to create wireframes by Wednesday" -> task: "create wireframes", owner: "Speaker", due_date: "Wednesday"
- "Mike should send brand assets by tomorrow" -> task: "send brand assets", owner: "Mike", due_date: "tomorrow"`;

/**
 * Calls OpenAI to extract action items from transcript text.
 * @param {string} text - Raw transcript text
 * @returns {Promise<Array<{ task: string, owner: string|null, due_date: string|null, tags: string[] }>>}
 * @throws {Error} When API key is missing, OpenAI fails, or response is invalid JSON
 */
export async function extractActionItems(text) {

  const nameMatches = text.match(/Attendees:.*\n([\s\S]*?)(?=\n\n|\nDate:|$)/i);
  const participantNames = [];
  if (nameMatches) {
    const attendeesLine = nameMatches[1];
    const names = attendeesLine.match(/\b([A-Z][a-z]+)\b/g);
    if (names) {
      participantNames.push(...names);
    }
  }

  const contentNames = text.match(/\b([A-Z][a-z]+):\s*/g);
  if (contentNames) {
    const speakerNames = contentNames.map(match => match.replace(':', '').trim());
    participantNames.push(...speakerNames);
  }
  
  const uniqueNames = [...new Set(participantNames)];
  
  const dynamicPrompt = `You are a meeting assistant.
Extract all action items from the transcript.
Return only valid JSON in this format:

[
  {
    "task": "",
    "owner": null,
    "due_date": null,
    "tags": []
  }
]

Rules:
- Extract clear, actionable tasks
- Identify the person responsible (owner) - look for these names: ${uniqueNames.join(', ')} or phrases like "I'll", "I need to", "I have to"
- Extract specific due dates - look for "by Monday", "by tomorrow", "by Wednesday", "next week", "this Friday", "March 1st", etc.
- Convert relative dates to specific dates when possible
- If owner not found, use null
- If due date not found, use null
- Infer relevant tags from context (e.g., "development", "design", "research", "testing", "documentation", "api", "mobile", "security", "performance")
- Do not return any text outside JSON

Examples of good extraction:
- "Jessica: I need to complete the user research by this Friday" -> task: "complete the user research", owner: "Jessica", due_date: "this Friday"
- "Robert: I'll design the new API architecture by March 1st" -> task: "design the new API architecture", owner: "Robert", due_date: "March 1st"
- "Lisa: I have to implement responsive design by next Tuesday" -> task: "implement responsive design", owner: "Lisa", due_date: "next Tuesday"`;

  let completion;
  try {
    const openai = getOpenAI();
    completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You respond only with valid JSON arrays. No markdown, no explanation.' },
        { role: 'user', content: `${dynamicPrompt}\n\nTranscript:\n\n${text}` },
      ],
      temperature: 0.2,
    });
  } catch (apiErr) {
    const msg = apiErr?.message || String(apiErr);
    if (/api.key|invalid.api.key|incorrect.api.key|authentication/i.test(msg)) {
      throw new Error('Invalid or missing OpenAI API key. Check OPENAI_API_KEY in backend/.env');
    }
    if (/rate.limit|quota|usage|insufficient|exceeded/i.test(msg)) {
      return fallbackExtractActionItems(text);
    }
    if (/timeout|ETIMEDOUT|ECONNREFUSED/i.test(msg)) {
      return fallbackExtractActionItems(text);
    }
    throw new Error(msg || 'OpenAI request failed. Please try again.');
  }

  const raw = completion.choices?.[0]?.message?.content?.trim();
  if (!raw) {
    throw new Error('OpenAI returned an empty response. Please try again.');
  }

  const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error('Invalid JSON from OpenAI. Please try again.');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('OpenAI response was not a JSON array. Please try again.');
  }

  return parsed.map((item) => ({
    task: typeof item.task === 'string' ? item.task : String(item.task ?? ''),
    owner: item.owner == null || item.owner === '' ? null : String(item.owner),
    due_date: item.due_date == null || item.due_date === '' ? null : parseRelativeDate(String(item.due_date)),
    tags: Array.isArray(item.tags) ? item.tags.map((t) => String(t)).filter(Boolean) : [],
  }));
}
