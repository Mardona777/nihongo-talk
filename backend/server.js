require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const OpenAI = require("openai");
const db = require("./db");

const app = express();

const PORT = process.env.PORT || 5001;
// ========================================
// OPENAI
// ========================================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log("AI model: gpt-5.6-luna");

// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());
app.use(express.json());

// ========================================
// TEST
// ========================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Nihongo Talk Backend is working!",
  });
});

// ========================================
// HEALTH CHECK
// ========================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend connected successfully!",
  });
});

// ========================================
// REGISTER
// ========================================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, level } = req.body;

    if (!name || !email || !password || !level) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const checkSql = `
      SELECT id
      FROM users
      WHERE email = ?
    `;

    db.query(checkSql, [email], async (error, results) => {
      if (error) {
        console.error("Register check error:", error);

        return res.status(500).json({
          success: false,
          message: "Database error.",
        });
      }

      if (results.length > 0) {
        return res.status(409).json({
          success: false,
          message: "This email is already registered.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const insertSql = `
        INSERT INTO users
        (name, email, password, level)
        VALUES (?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [name, email, hashedPassword, level],
        (insertError, result) => {
          if (insertError) {
            console.error(
              "Register insert error:",
              insertError
            );

            return res.status(500).json({
              success: false,
              message: "Could not create account.",
            });
          }

          return res.status(201).json({
            success: true,
            message: "Account created successfully!",
            userId: result.insertId,
          });
        }
      );
    });
  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
});

// ========================================
// LOGIN
// ========================================

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const sql = `
      SELECT
        id,
        name,
        email,
        password,
        level
      FROM users
      WHERE email = ?
    `;

    db.query(sql, [email], async (error, results) => {
      if (error) {
        console.error("Login database error:", error);

        return res.status(500).json({
          success: false,
          message: "Database error.",
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      const user = results[0];

      const passwordMatch = await bcrypt.compare(
        password,
        user.password
      );

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      res.json({
        success: true,
        message: "Login successful!",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          level: user.level,
        },
      });
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
});

// ========================================
// AI TEST
// ========================================

app.get("/api/ai/test", async (req, res) => {
  try {
    const response = await openai.responses.create({
      model: "gpt-5.6-luna",
      input: `
Create ONE simple Japanese conversation question
for an N5 learner.

Return ONLY the Japanese question.
No explanation.
`,
    });

    const question = response.output_text?.trim();

    if (!question) {
      return res.status(500).json({
        success: false,
        message: "AI returned an empty response.",
      });
    }

    res.json({
      success: true,
      question,
    });
  } catch (error) {
    console.error("AI TEST ERROR:", error);

    res.status(500).json({
      success: false,
      message: "AI request failed.",
      error: error.message,
    });
  }
});

// ========================================
// AI — GENERATE 20 RANDOM QUESTIONS
// ========================================

app.post("/api/ai/questions", async (req, res) => {
  try {
    const {
      scenario,
      level = "N5",
      count = 20,
    } = req.body;

    if (!scenario) {
      return res.status(400).json({
        success: false,
        message: "Scenario is required.",
      });
    }

    // Har doim 20 ta
    const questionCount = 20;

    console.log("========================================");
    console.log("Generating 20 AI questions...");
    console.log("Scenario:", scenario);
    console.log("Level:", level);
    console.log("========================================");

    const prompt = `
You are an expert Japanese conversation teacher.

Create EXACTLY 20 DIFFERENT Japanese speaking-practice questions.

Scenario:
${scenario}

Student level:
${level}

VERY IMPORTANT:

1. Create exactly 20 questions.
2. Every question MUST be different.
3. Do NOT repeat the same question.
4. Do NOT create tiny variations of the same question.
5. Each question must test a different conversational situation.
6. Questions should feel natural in real Japanese conversation.
7. Match the student's level.
8. Include an English translation.
9. Include one natural example answer.
10. Questions must be suitable for speaking practice.
11. Do not number the questions.
12. Return ONLY valid JSON.
13. Do NOT use markdown.
14. Do NOT use code fences.

Use this exact structure:

{
  "questions": [
    {
      "japanese": "Japanese question",
      "translation": "English translation",
      "expected": "Natural Japanese example answer"
    }
  ]
}

You MUST return exactly 20 objects.
`;

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",
      input: prompt,
    });

    const text = response.output_text?.trim();

    console.log("Raw AI response:");
    console.log(text);

    if (!text) {
      return res.status(500).json({
        success: false,
        message: "AI returned an empty response.",
      });
    }

    let parsedData;

    try {
      parsedData = JSON.parse(text);
    } catch (error) {
      console.error("JSON parse error:", error);

      return res.status(500).json({
        success: false,
        message: "AI returned invalid JSON.",
      });
    }

    const generatedQuestions =
      Array.isArray(parsedData.questions)
        ? parsedData.questions
        : [];

    // ========================================
    // NORMALIZE
    // ========================================

    const normalizedQuestions = generatedQuestions
      .map((question) => {
        if (typeof question === "string") {
          return {
            japanese: question.trim(),
            translation: "",
            expected: "",
          };
        }

        return {
          japanese: String(
            question.japanese ||
              question.question ||
              ""
          ).trim(),

          translation: String(
            question.translation || ""
          ).trim(),

          expected: String(
            question.expected || ""
          ).trim(),
        };
      })
      .filter((question) => question.japanese);

    // ========================================
    // REMOVE DUPLICATES
    // ========================================

    const uniqueQuestions = [];
    const seen = new Set();

    for (const question of normalizedQuestions) {
      const normalized = question.japanese
        .replace(/\s+/g, "")
        .toLowerCase();

      if (!seen.has(normalized)) {
        seen.add(normalized);
        uniqueQuestions.push(question);
      }
    }

    console.log(
      "AI generated:",
      normalizedQuestions.length
    );

    console.log(
      "Unique questions:",
      uniqueQuestions.length
    );

    // ========================================
    // MUST HAVE 20
    // ========================================

    if (uniqueQuestions.length < 20) {
      return res.status(500).json({
        success: false,
        message:
          "AI did not generate 20 unique questions. Please try again.",
        generated: uniqueQuestions.length,
      });
    }

    // ========================================
    // EXACTLY 20
    // ========================================

    const finalQuestions =
      uniqueQuestions.slice(0, 20);

    console.log("Final 20 questions:");

    finalQuestions.forEach((question, index) => {
      console.log(
        `${index + 1}. ${question.japanese}`
      );
    });

    return res.json({
      success: true,
      questions: finalQuestions,
      count: finalQuestions.length,
    });
  } catch (error) {
    console.error("AI QUESTIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "AI question generation failed.",
      error: error.message,
    });
  }
});

// ========================================
// AI — EVALUATE ANSWER
// ========================================

app.post("/api/ai/evaluate", async (req, res) => {
  try {
    const {
      scenario,
      question,
      expected,
      answer,
      level = "N5",
    } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message:
          "Question and answer are required.",
      });
    }

    console.log("========================================");
    console.log("Evaluating answer...");
    console.log("Question:", question);
    console.log("Answer:", answer);
    console.log("========================================");

    const prompt = `
You are an expert Japanese language teacher.

Evaluate a student's Japanese speaking answer.

Scenario:
${scenario || "conversation"}

Student level:
${level}

Question:
${question}

Expected example:
${expected || "No example provided."}

Student answer:
${answer}

Evaluate fairly.

Consider:
- Grammar
- Vocabulary
- Relevance
- Naturalness
- Communication effectiveness

IMPORTANT:
- The student's answer does NOT need to match the expected answer.
- Accept other natural answers.
- Match evaluation to the student's level.
- Give a score from 0 to 100.
- Give short useful feedback.
- Return ONLY JSON.
- No markdown.
- No code fences.

Return:

{
  "score": 85,
  "feedback": "Good answer! Your meaning is clear."
}
`;

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",
      input: prompt,
    });

    const text = response.output_text?.trim();

    console.log("Raw evaluation:");
    console.log(text);

    if (!text) {
      return res.status(500).json({
        success: false,
        message:
          "AI returned an empty evaluation.",
      });
    }

    let evaluation;

    try {
      evaluation = JSON.parse(text);
    } catch (error) {
      console.error(
        "Evaluation JSON parse error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "AI returned invalid evaluation JSON.",
      });
    }

    let score = Number(evaluation.score);

    if (!Number.isFinite(score)) {
      score = 50;
    }

    score = Math.max(
      0,
      Math.min(100, Math.round(score))
    );

    const feedback =
      evaluation.feedback ||
      "Good job! Keep practicing Japanese.";

    return res.json({
      success: true,
      score,
      feedback,
    });
  } catch (error) {
    console.error(
      "AI EVALUATION ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "AI evaluation failed.",
      error: error.message,
    });
  }
});

// ========================================
// SAVE PRACTICE SESSION
// ========================================

app.post("/api/practice", (req, res) => {
  const {
    user_id,
    scenario,
    score,
    total_steps,
  } = req.body;

  console.log("Practice data received:", {
    user_id,
    scenario,
    score,
    total_steps,
  });

  if (
    !user_id ||
    !scenario ||
    score === undefined ||
    !total_steps
  ) {
    return res.status(400).json({
      success: false,
      message:
        "All practice fields are required.",
    });
  }

  const sql = `
    INSERT INTO practice_sessions
    (
      user_id,
      scenario,
      score,
      total_steps
    )
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      user_id,
      scenario,
      score,
      total_steps,
    ],
    (error, result) => {
      if (error) {
        console.error(
          "Practice save error:",
          error
        );

        return res.status(500).json({
          success: false,
          message:
            "Could not save practice session.",
        });
      }

      console.log(
        "Practice saved. ID:",
        result.insertId
      );

      return res.status(201).json({
        success: true,
        message:
          "Practice session saved successfully!",
        sessionId: result.insertId,
      });
    }
  );
});

// ========================================
// GET PRACTICE STATISTICS + HISTORY
// ========================================

app.get(
  "/api/practice/stats/:userId",
  (req, res) => {
    const { userId } = req.params;

    console.log(
      "Getting practice statistics for user:",
      userId
    );

    const statsSql = `
      SELECT
        COUNT(*) AS practiceSessions,
        ROUND(AVG(score), 0) AS averageScore,
        COUNT(*) AS completed
      FROM practice_sessions
      WHERE user_id = ?
    `;

    db.query(
      statsSql,
      [userId],
      (statsError, statsResults) => {
        if (statsError) {
          console.error(
            "Stats error:",
            statsError
          );

          return res.status(500).json({
            success: false,
            message:
              "Could not get statistics.",
          });
        }

        const stats = statsResults[0];

        const historySql = `
          SELECT
            id,
            scenario,
            score,
            total_steps,
            completed_at
          FROM practice_sessions
          WHERE user_id = ?
          ORDER BY completed_at DESC
          LIMIT 10
        `;

        db.query(
          historySql,
          [userId],
          (historyError, historyResults) => {
            if (historyError) {
              console.error(
                "History error:",
                historyError
              );

              return res.status(500).json({
                success: false,
                message:
                  "Could not get practice history.",
              });
            }

            const daysSql = `
              SELECT DISTINCT
                DATE(completed_at) AS practiceDate
              FROM practice_sessions
              WHERE user_id = ?
              ORDER BY practiceDate DESC
            `;

            db.query(
              daysSql,
              [userId],
              (daysError, dayResults) => {
                if (daysError) {
                  console.error(
                    "Practice days error:",
                    daysError
                  );

                  return res.status(500).json({
                    success: false,
                    message:
                      "Could not get practice days.",
                  });
                }

                let practiceStreak = 0;

                if (dayResults.length > 0) {
                  const dates = dayResults.map(
                    (item) => {
                      const date = new Date(
                        item.practiceDate
                      );

                      date.setHours(
                        0,
                        0,
                        0,
                        0
                      );

                      return date;
                    }
                  );

                  const today = new Date();

                  today.setHours(
                    0,
                    0,
                    0,
                    0
                  );

                  const firstDate = dates[0];

                  const differenceFromToday =
                    Math.floor(
                      (today - firstDate) /
                        (1000 * 60 * 60 * 24)
                    );

                  if (
                    differenceFromToday === 0 ||
                    differenceFromToday === 1
                  ) {
                    practiceStreak = 1;

                    for (
                      let i = 1;
                      i < dates.length;
                      i++
                    ) {
                      const difference =
                        Math.floor(
                          (dates[i - 1] -
                            dates[i]) /
                            (1000 *
                              60 *
                              60 *
                              24)
                        );

                      if (difference === 1) {
                        practiceStreak++;
                      } else {
                        break;
                      }
                    }
                  }
                }

                const responseData = {
                  success: true,

                  stats: {
                    practiceSessions:
                      Number(
                        stats.practiceSessions
                      ) || 0,

                    averageScore:
                      stats.averageScore !== null
                        ? Number(
                            stats.averageScore
                          )
                        : 0,

                    completed:
                      Number(
                        stats.completed
                      ) || 0,

                    practiceStreak,
                    streak: practiceStreak,
                  },

                  history: historyResults,
                };

                console.log(
                  "Practice statistics:",
                  responseData
                );

                return res.json(
                  responseData
                );
              }
            );
          }
        );
      }
    );
  }
);

// ========================================
// 404
// ========================================

app.use((req, res) => {
  console.log(
    "404:",
    req.method,
    req.originalUrl
  );

  res.status(404).json({
    success: false,
    message: "API endpoint not found.",
    endpoint: req.originalUrl,
  });
});

// ========================================
// GLOBAL ERROR
// ========================================

app.use((error, req, res, next) => {
  console.error(
    "Global server error:",
    error
  );

  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

// ========================================
// START SERVER
// ========================================

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `Backend running on port ${PORT}`
    );

    console.log(
      "AI model: gpt-5.6-luna"
    );

    console.log(
      "Waiting for requests..."
    );
  }
);