import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.3-70b-versatile";

function isProbablyUrl(input: string) {
  const s = input.trim();
  if (!s) return false;
  return /^https?:\/\/\S+$/i.test(s) || /^www\.\S+$/i.test(s);
}

function stripUrls(input: string) {
  return input.replace(/https?:\/\/\S+/gi, " ").replace(/\bwww\.\S+/gi, " ");
}

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Missing GROQ_API_KEY. Add it to your environment and restart the dev server." },
        { status: 500 }
      );
    }

    const { profileData, targetJob } = await req.json();

    if (!profileData || typeof profileData !== "string") {
      return NextResponse.json({ error: "profileData must be a string" }, { status: 400 });
    }

    const effectiveTargetJob =
      typeof targetJob === "string" && targetJob.trim()
        ? targetJob.trim()
        : "Software Engineer (AI & Full-Stack Development)";

    // Data Validation: if it's basically only a URL (no pasteable text), we can't scrape.
    const nonUrlText = stripUrls(profileData).trim();
    const nonUrlWordCount = nonUrlText ? nonUrlText.split(/\s+/).filter(Boolean).length : 0;
    if (isProbablyUrl(profileData) || nonUrlWordCount < 20) {
      return NextResponse.json({
        roast:
          "Empty profiles don’t get jobs. A LinkedIn URL with no actual ‘About’ or ‘Experience’ text is basically a business card with no name.",
        score: 1,
        headline_suggestions: [
          "Paste your About section here (I can’t scrape URLs)",
          "Add 2–3 quantified achievements (then re-run this roast)",
          "Include core skills + target role keywords",
        ],
        summary_rewrite:
          "I can’t analyze a LinkedIn URL directly. Paste your ‘About’ section and 2–3 recent ‘Experience’ bullet points here, and I’ll tailor a roast + rewrite to your real skills and keywords.",
        action_plan: [
          "Paste your About + 2–3 Experience bullets (with metrics).",
          "List your top 10 skills/tools you actually use.",
          "Add 3 achievements with numbers (impact, scale, %).",
          "Add relevant keywords for your target role.",
          "Rewrite headline to include role + niche + proof.",
          "Tighten Experience bullets to Action + Metric + Outcome.",
          "Re-run analysis with the pasted text.",
        ],
        linkedin_post:
          "Today I learned the fastest way to improve your LinkedIn isn’t ‘hacks’—it’s clarity.\n\nIf your profile is basically just a link with no substance, recruiters can’t evaluate you.\n\nThis week I’m rewriting my About and Experience with real outcomes and numbers.\n\nIf you’re doing the same, share one measurable win from your last project.",
        skill_gap: {
          missing_keywords: [],
          recommended_skills: [],
          match_percentage: 0,
        },
      });
    }

    const prompt = `
Analyze the following profile text (NOT a URL scrape; use ONLY what's written):
"""
${profileData}
"""

Target job (use this to compute match_percentage):
"""
${effectiveTargetJob}
"""

CRITICAL INSTRUCTIONS:
- Data grounding: Use ONLY skills/years/keywords explicitly present in the profile text. If it isn't in the text, don't invent it.
- If the profile mentions years of experience, reflect that; if it doesn't, do NOT guess years.
- Anti-generic rule: Do NOT use placeholder phrases like "Innovative solutions" or "highly motivated" unless those exact phrases appear in the profile.
- Contextual analysis: Every field must be uniquely tailored to the skills, years of experience, industries, tools, and keywords found in the profile text.
- Skill gap relevance: Match the user's domain (e.g. Designer => Figma/UI/UX). Do not default to unrelated tech skills unless present.
- Target job alignment: Compute skill_gap.match_percentage by comparing the user's explicitly-listed skills/keywords against the target job ONLY.
- Output format: Return ONLY a valid JSON object with the schema below. No markdown, no preamble.

JSON schema (exact keys):
{
  "roast": "string",
  "score": number,
  "headline_suggestions": ["string", "string", "string"],
  "summary_rewrite": "string",
  "action_plan": ["string","string","string","string","string","string","string"],
  "linkedin_post": "string",
  "skill_gap": {
    "missing_keywords": ["string","string","string","string"],
    "recommended_skills": ["string","string","string"],
    "match_percentage": number
  }
}

Additional constraints:
- headline_suggestions must be exactly 3 items.
- action_plan must be exactly 7 items, actionable and specific to this person + target job.
- missing_keywords must be exactly 4 items and must come from the target job requirements that are NOT present in the profile text.
- recommended_skills must be exactly 3 items and must be directly tied to the user's current background + the target job.
- match_percentage must be an integer 0-100.
`;

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a witty LinkedIn expert and career coach. You ONLY output valid JSON that matches the given schema. Follow the anti-generic and data-grounding rules strictly."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7, // Thori creativity roast ke liye
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) throw new Error("Empty response from Groq");

    const parsedData = JSON.parse(content);

    return NextResponse.json(parsedData);

  } catch (error) {
    console.error("Groq API Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to analyze profile (unknown error)";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}