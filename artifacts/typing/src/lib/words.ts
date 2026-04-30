export const WORDS = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
  "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
  "is", "are", "was", "were", "been", "has", "had", "does", "did", "doing",
  "system", "program", "number", "part", "problem", "school", "state", "family", "group", "country",
  "hand", "water", "place", "point", "home", "room", "mother", "father", "child", "world",
  "company", "business", "fact", "line", "right", "left", "form", "life", "car", "book",
  "thing", "night", "word", "story", "fact", "month", "lot", "study", "kind", "issue",
  "name", "idea", "result", "body", "minute", "friend", "city", "job", "game", "team",
  "kid", "parent", "student", "history", "party", "result", "change", "morning", "reason", "research",
  "girl", "guy", "moment", "air", "teacher", "force", "education", "foot", "boy", "age",
  "policy", "music", "process", "market", "food", "office", "door", "health", "person", "art",
  "war", "history", "party", "result", "change", "morning", "reason", "research", "girl", "guy"
];

export const QUOTES = [
  "The only way to do great work is to love what you do.",
  "Stay hungry, stay foolish.",
  "In the middle of difficulty lies opportunity.",
  "Happiness is not something ready made. It comes from your own actions.",
  "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.",
  "Simplicity is the ultimate sophistication.",
  "Design is not just what it looks like and feels like. Design is how it works.",
  "Life is 10% what happens to you and 90% how you react to it.",
  "The best way to predict the future is to invent it.",
  "Nothing is impossible, the word itself says 'I'm possible'!",
  "Whatever you are, be a good one.",
  "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
  "Act as if what you do makes a difference. It does.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Believe you can and you're halfway there.",
  "If you want to live a happy life, tie it to a goal, not to people or things.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "You must be the change you wish to see in the world.",
  "Do what you can, with what you have, where you are.",
  "It is never too late to be what you might have been."
];

export const CODE_SNIPPETS = [
  "const sum = (a, b) => a + b;\nconsole.log(sum(5, 10));",
  "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)",
  "interface User {\n  id: string;\n  name: string;\n  email: string;\n}",
  "function App() {\n  return (\n    <div>Hello World</div>\n  );\n}",
  "document.querySelectorAll('.btn').forEach(btn => {\n  btn.addEventListener('click', () => console.log('Clicked!'));\n});",
  "import { useState, useEffect } from 'react';\n\nexport function useMount() {\n  useEffect(() => {\n    console.log('Mounted');\n  }, []);\n}",
  "class Animal {\n  constructor(name) {\n    this.name = name;\n  }\n  speak() {\n    console.log(`${this.name} makes a noise.`);\n  }\n}",
  "try {\n  const res = await fetch('/api/data');\n  const data = await res.json();\n} catch (err) {\n  console.error(err);\n}",
  "SELECT id, username, created_at\nFROM users\nWHERE active = true\nORDER BY created_at DESC\nLIMIT 10;",
  "body {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  background: #f0f0f0;\n}",
  "const uniqueArray = [...new Set([1, 2, 2, 3, 4, 4, 5])];",
  "x = [1, 2, 3, 4, 5]\ny = [i**2 for i in x if i % 2 == 0]",
  "export const handler = async (event, context) => {\n  return {\n    statusCode: 200,\n    body: JSON.stringify({ message: 'Success' })\n  };\n};",
  "Rust:\nfn main() {\n    println!(\"Hello, world!\");\n}",
  "Go:\nfunc main() {\n    fmt.Println(\"Hello, World!\")\n}"
];

export const PUNCTUATION_NUMBERS = [
  "100%", "2024", "hello, world!", "$50.00", "what?", "wait...", "user_name123", "(hello)", "[wow]", "{json}", 
  "1,000,000", "A+!", "B-", "C#", "C++", "3.14159", "24/7", "9:00 AM", "12:00 PM", "50-50",
  "a-b-c", "x, y, z", "http://", "https://", "www.example.com", "user@email.com", "<br />", "<h1>", "&&", "||"
];

export function generateWords(mode: string, count: number = 50): string {
  let sourceArray: string[] = [];
  
  if (mode === 'quotes') {
    return QUOTES[Math.floor(Math.random() * QUOTES.length)];
  } else if (mode === 'code') {
    return CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
  } else if (mode === 'punctuation') {
    sourceArray = PUNCTUATION_NUMBERS;
  } else {
    sourceArray = WORDS;
  }

  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(sourceArray[Math.floor(Math.random() * sourceArray.length)]);
  }
  return result.join(' ');
}

// PRNG for daily challenge
export function splitmix32(a: number) {
    return function() {
      a |= 0; a = a + 0x9e3779b9 | 0;
      var t = a ^ a >>> 16;
      t = Math.imul(t, 0x21f0aaad);
      t = t ^ t >>> 15;
      t = Math.imul(t, 0x735a2d97);
      return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
    }
}

export function getDailyChallengeWords(): string {
  const date = new Date();
  const seed = parseInt(`${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`);
  const random = splitmix32(seed);
  
  const result = [];
  for (let i = 0; i < 50; i++) {
    const index = Math.floor(random() * WORDS.length);
    result.push(WORDS[index]);
  }
  return result.join(' ');
}
