import { NextResponse } from "next/server";

export const dynamic = 'force-static';

export async function POST() {
  return NextResponse.json({ message: "Chat endpoint temporarily disabled" });
}
//
// // Initialize Gemini
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//
// interface Message {
//   role: "user" | "assistant";
//   content: string;
//   timestamp: string;
//   processSteps?: ProcessStep[];
// }
//
// interface ProcessStep {
//   step: string;
//   status: "running" | "completed" | "error";
//   details?: string;
// }
//
// interface ConfluencePage {
//   id: string;
//   title: string;
//   content?: string;
//   space: { name: string; key: string };
//   url: string;
//   relevanceScore?: number;
// }
//
// // Estimate token count (rough approximation: 1 token ≈ 4 characters)
// function estimateTokens(text: string): number {
//   return Math.ceil(text.length / 4);
// }
//
// // Function to create enhanced Gemini prompt with better formatting
// function createEnhancedGeminiPrompt(
//   userQuestion: string,
//   documents: ConfluencePage[],
//   conversationHistory: Message[] = [],
//   mode: "qa" | "testcase" = "qa"
// ) {
//   let contextPrompt = "";
//
//   if (conversationHistory.length > 0) {
//     contextPrompt = `\n\n<conversation_history>
// Previous conversation for context:
// ${conversationHistory
//   .slice(-4)
//   .map((msg) => `${msg.role}: ${msg.content}`)
//   .join("\n")}
// </conversation_history>`;
//   }
//
//   const documentContent = documents
//     .map(
//       (doc) => `<document>
// <title>${doc.title}</title>
// <space>${doc.space.name}</space>
// <relevance_score>${doc.relevanceScore || 0}/10</relevance_score>
// <content>
// ${doc.content}
// </content>
// </document>`
//     )
//     .join("\n\n");
//
//   const rolePrompt = mode === "qa"
//     ? `<role>
// You are a helpful SQA assistant for Tiket.com. You provide clear, actionable guidance based on the company's documentation. Your responses should be practical, easy to understand, and well-formatted.
// </role>`
//     : `<role>
// You are a test case generator for Tiket.com. Your task is to create concise, effective test cases based on the documentation provided.
// </role>`;
//
//   const instructionsPrompt = mode === "qa"
//     ? `<instructions>
// 1. Read the user's question carefully and analyze all provided documents.
// 2. Create a comprehensive, well-structured answer that directly addresses the user's question.
// 3. Use ONLY the information from the provided documents - do not add external knowledge.
// 4. Format your response using clear headings, bullet points, and numbered steps where appropriate.
// 5. For every major point or procedure, cite the source document using: **[Document Title]**
// 6. If you need to reference multiple documents, synthesize the information coherently.
// 7. Use simple, clear language that any team member can understand.
// 8. Structure your response with:
//    - A brief direct answer to the question
//    - Detailed step-by-step procedures (if applicable)
//    - Important notes or warnings
//    - Related processes or considerations
// 9. If the documents don't contain sufficient information, say: "Based on the available documentation, I found some relevant information but may not have complete details. Here's what I can tell you:"
// 10. End with sources used for reference.
// </instructions>`
//     : `<instructions>
// 1. Read the user's question carefully and analyze all provided documents.
// 2. Create clear, concise test cases in a one-line format.
// 3. Each test case should start with "Verify ..."
// 4. Each test case should include the context, steps, and expected outcome in a single sentence.
// 5. Make sure the test cases are specific and testable.
// 6. Focus on functionality described in the documentation.
// 7. Create test cases that cover:
//    - Happy path scenarios
//    - Edge cases and error conditions
//    - Performance considerations if mentioned
//    - Security aspects if relevant
// 8. Group similar test cases together.
// 9. If the documents don't contain sufficient information, note what additional information would be needed.
// 10. Format each test case on a new line, making them easy to copy and use in a test case management system.
// </instructions>`;
//
//   return `${rolePrompt}
//
// ${instructionsPrompt}
//
// <documents>
// ${documentContent}
// </documents>
// ${contextPrompt}
//
// <task>
// <question>
// ${userQuestion}
// </question>
//
// Please provide a well-formatted, helpful response:`;
// }
//
// // Function to rank pages by relevance using Gemini
// async function rankPagesByRelevance(
//   userQuery: string,
//   pages: ConfluencePage[]
// ): Promise<ConfluencePage[]> {
//   if (pages.length <= 1) return pages;
//
//   const rankingPrompt = `You are helping rank Confluence pages by relevance to a user's question.
//
// User Question: "${userQuery}"
//
// Pages to rank:
// ${pages
//   .map((page, idx) => `${idx + 1}. "${page.title}" - ${page.space.name}`)
//   .join("\n")}
//
// Rate each page from 1-10 based on how likely it is to contain information that answers the user's question. Consider:
// - Title relevance to the question
// - Space context (TD = Tech Directorate likely has processes)
// - Likely content based on the title
//
// Respond with ONLY a JSON array of scores in the same order: [score1, score2, score3, ...]
// Example: [8, 3, 9, 2]`;
//
//   try {
//     const result = await model.generateContent(rankingPrompt);
//     const response = result.response.text().trim();
//
//     // Extract JSON array from response
//     const match = response.match(/\[([\d,\s]+)\]/);
//     if (match) {
//       const scores = match[1].split(",").map((s) => parseInt(s.trim()));
//
//       // Assign scores and sort by relevance
//       const rankedPages = pages.map((page, idx) => ({
//         ...page,
//         relevanceScore: scores[idx] || 1,
//       }));
//
//       return rankedPages.sort(
//         (a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0)
//       );
//     }
//   } catch (error) {
//     console.error("Error ranking pages:", error);
//   }
//
//   // Fallback: return original order with default scores
//   return pages.map((page) => ({ ...page, relevanceScore: 5 }));
// }
//
// // --- START: CQL Generation Refactor ---
//
// // Original hardcoded CQL generation logic
// function generateEnhancedCQLWithoutLLM(userQuery: string): string[] {
//   const query = userQuery.toLowerCase();
//   const queries: string[] = [];
//
//   // Strategy 1: Specific scenarios
//   if (query.includes("defect") && query.includes("production")) {
//     queries.push(
//       '(title ~ "defect" OR title ~ "bug") AND (text ~ "production" OR title ~ "production")'
//     );
//     queries.push('title ~ "SOP" AND text ~ "production"');
//   }
//
//   // Strategy 2: Direct keyword matching
//   if (query.includes("defect") || query.includes("bug")) {
//     queries.push('title ~ "SOP" AND (title ~ "defect" OR title ~ "bug")');
//     queries.push('title ~ "defect" OR title ~ "bug"');
//   }
//
//   if (query.includes("production") || query.includes("prod")) {
//     queries.push('text ~ "production" OR title ~ "production"');
//   }
//
//   if (
//     query.includes("process") ||
//     query.includes("procedure") ||
//     query.includes("sop")
//   ) {
//     queries.push('title ~ "SOP" OR title ~ "process"');
//   }
//
//   // Strategy 3: Fallback searches
//   queries.push('title ~ "SOP"'); // Get all SOPs
//
//   // Remove duplicates
//   return [...new Set(queries)];
// }
//
// // New LLM-powered CQL generation
// async function generateEnhancedCQLWithGemini(userQuery: string): Promise<string[]> {
//   const cqlGenerationPrompt = `
//     You are an expert in Confluence Query Language (CQL). Your task is to generate a diverse set of 3 to 5 CQL queries to find the most relevant documents for a user's question. The queries should be effective and use different strategies.
//
//     **User's Question:** "${userQuery}"
//
//     **CQL Generation Guidelines:**
//     1.  **Broad Match:** Start with a query that uses OR for keywords to capture a wide range of documents.
//     2.  **Specific Match:** Create a query that uses AND to find documents containing all key concepts.
//     3.  **Title-Focused:** Generate a query that heavily weights terms found in the document title.
//     4.  **Synonym/Related-Term Expansion:** Think of related terms. For "bug report," consider "defect," "issue," "incident."
//     5.  **Process-Oriented:** If the question implies a process, search for terms like "SOP," "procedure," "guideline," or "how to."
//
//     **Example User Question:** "How do I handle production defects?"
//     **Example Output:**
//     [
//       "(title ~ \"defect\" OR title ~ \"bug\") AND (text ~ \"production\" OR title ~ \"prod\")",
//       "title ~ \"SOP\" AND text ~ \"production defect\"",
//       "text ~ \"handle production defects\" OR text ~ \"production bug procedure\"",
//       "title ~ \"Production Issue Guideline\""
//     ]
//
//     Now, generate the CQL queries for the user's question above.
//     **Respond with ONLY a valid JSON array of strings.**
//   `;
//
//   try {
//     const result = await model.generateContent(cqlGenerationPrompt);
//     const responseText = result.response.text().trim();
//
//     // Extract JSON array from the response
//     const match = responseText.match(/(\[[\s\S]*\])/);
//     if (match) {
//       const queries = JSON.parse(match[0]);
//       // Basic validation to ensure it's an array of strings
//       if (Array.isArray(queries) && queries.every(q => typeof q === 'string')) {
//         return queries.slice(0, 5); // Return up to 5 queries
//       }
//     }
//     console.error("LLM did not return a valid JSON array for CQL queries. Falling back.", responseText);
//   } catch (error) {
//     console.error("Error generating CQL with Gemini:", error);
//   }
//
//   // Fallback to the non-LLM version if the LLM fails
//   return generateEnhancedCQLWithoutLLM(userQuery);
// }
//
// // --- END: CQL Generation Refactor ---
//
// // Simplified working page retrieval (based on the working test-cql-fixed.js)
// async function getConfluencePages(
//   cqlQueries: string[]
// ): Promise<ConfluencePage[]> {
//   const allPages: ConfluencePage[] = [];
//   const seenPageIds = new Set<string>();
//
//   for (const cql of cqlQueries.slice(0, 3)) {
//     // Limit to 3 queries
//     try {
//       const pages = await getSingleQueryPages(cql, 2); // Get 2 pages per query
//
//       for (const page of pages) {
//         if (!seenPageIds.has(page.id)) {
//           seenPageIds.add(page.id);
//           allPages.push(page);
//         }
//       }
//
//       if (allPages.length >= 6) break; // Limit total pages to 6
//     } catch (error) {
//       console.error("Error with CQL query:", cql, error);
//     }
//   }
//
//   return allPages;
// }
//
// // Working single query page retrieval (simplified from test-cql-fixed.js)
// async function getSingleQueryPages(
//   cql: string,
//   limit: number = 2
// ): Promise<ConfluencePage[]> {
//   return new Promise((resolve, reject) => {
//     const mcpServer = spawn("npx", ["-y", "@zereight/mcp-confluence"], {
//       env: {
//         ...process.env,
//         CONFLUENCE_URL: process.env.CONFLUENCE_URL,
//         JIRA_URL: process.env.JIRA_URL,
//         CONFLUENCE_API_MAIL: process.env.CONFLUENCE_API_MAIL,
//         CONFLUENCE_API_KEY: process.env.CONFLUENCE_API_KEY,
//         CONFLUENCE_IS_CLOUD: process.env.CONFLUENCE_IS_CLOUD,
//       },
//       stdio: ["pipe", "pipe", "pipe"],
//     });
//
//     const searchRequest = {
//       jsonrpc: "2.0",
//       id: 1,
//       method: "tools/call",
//       params: {
//         name: "execute_cql_search",
//         arguments: { cql, limit },
//       },
//     };
//
//     let allDataReceived = "";
//     const pages: ConfluencePage[] = [];
//     let searchResults: any[] = [];
//     let pagesProcessed = 0;
//
//     mcpServer.stdin.write(JSON.stringify(searchRequest) + "\n");
//
//     mcpServer.stdout.on("data", (data) => {
//       allDataReceived += data.toString();
//
//       const lines = allDataReceived.split("\n");
//
//       for (let i = 0; i < lines.length - 1; i++) {
//         const line = lines[i].trim();
//         if (line) {
//           try {
//             const response = JSON.parse(line);
//
//             if (response.id === 1) {
//               // Search results
//               const resultsData = JSON.parse(response.result.content[0].text);
//               searchResults = resultsData.results || [];
//
//               if (searchResults.length === 0) {
//                 mcpServer.kill();
//                 resolve([]);
//                 return;
//               }
//
//               // Request content for first page
//               requestPageContent(0);
//             } else if (response.id > 1) {
//               // Page content response
//               const pageData = JSON.parse(response.result.content[0].text);
//               const pageIndex = response.id - 2;
//
//               if (pageData && pageData.body && pageData.body.storage) {
//                 // Clean content (same as working version)
//                 let content = pageData.body.storage.value
//                   .replace(/<h([1-6])>/g, "\n\n## ")
//                   .replace(/<\/h[1-6]>/g, "\n")
//                   .replace(/<p>/g, "\n")
//                   .replace(/<\/p>/g, "")
//                   .replace(/<ul>/g, "\n")
//                   .replace(/<\/ul>/g, "")
//                   .replace(/<li>/g, "\n• ")
//                   .replace(/<\/li>/g, "")
//                   .replace(/<strong>/g, "**")
//                   .replace(/<\/strong>/g, "**")
//                   .replace(/<[^>]*>/g, "")
//                   .replace(/\n\s*\n/g, "\n\n")
//                   .trim()
//                   .substring(0, 5000); // Limit content length
//
//                 pages.push({
//                   id: pageData.id,
//                   title: pageData.title,
//                   content: content,
//                   space: pageData.space,
//                   url: `https://borobudur.atlassian.net/wiki${pageData._links.webui}`,
//                 });
//               }
//
//               pagesProcessed++;
//
//               // Request next page or finish
//               if (pagesProcessed < Math.min(searchResults.length, limit)) {
//                 requestPageContent(pagesProcessed);
//               } else {
//                 mcpServer.kill();
//                 resolve(pages);
//               }
//             }
//           } catch (e) {
//             // Continue parsing
//           }
//         }
//       }
//
//       allDataReceived = lines[lines.length - 1];
//     });
//
//     function requestPageContent(index: number) {
//       if (index < searchResults.length) {
//         const pageContentRequest = {
//           jsonrpc: "2.0",
//           id: index + 2,
//           method: "tools/call",
//           params: {
//             name: "get_page_content",
//             arguments: { pageId: searchResults[index].id },
//           },
//         };
//
//         mcpServer.stdin.write(JSON.stringify(pageContentRequest) + "\n");
//       }
//     }
//
//     mcpServer.stderr.on("data", (data) => {
//       console.error("MCP Error:", data.toString());
//     });
//
//     setTimeout(() => {
//       mcpServer.kill();
//       resolve(pages);
//     }, 15000);
//   });
// }
//
// export async function POST(request: NextRequest) {
//   try {
//     const { message, conversationHistory = [], mode = "qa" } = await request.json();
//
//     const processSteps: ProcessStep[] = [
//       { step: "Generating multiple CQL search strategies", status: "running" },
//       { step: "Searching Confluence (top 3 strategies)", status: "running" },
//       { step: "Ranking pages by relevance using LLM", status: "running" },
//       { step: "Selecting top 3 most relevant pages", status: "running" },
//       { step: "Generating enhanced response", status: "running" },
//     ];
//
//     // Step 1: Generate CQL strategies using the new Gemini-powered function
//     const cqlQueries = await generateEnhancedCQLWithGemini(message);
//     console.log("--- Generated CQL Queries: ---\n", cqlQueries);
//     processSteps[0] = {
//       step: "Generating multiple CQL search strategies",
//       status: "completed",
//       details: `Generated ${cqlQueries.length} search strategies`,
//     };
//
//     // Step 2: Search with multiple queries
//     const allPages = await getConfluencePages(cqlQueries);
//     console.log(
//       "--- Relevant Confluence Pages Found: ---\n",
//       allPages.map((p) => p.title)
//     );
//     processSteps[1] = {
//       step: "Searching Confluence (top 3 strategies)",
//       status: "completed",
//       details: `Found ${allPages.length} pages`,
//     };
//
//     if (allPages.length === 0) {
//       return NextResponse.json({
//         reply:
//           "I couldn't find relevant information in the knowledge base for your question. You might want to try rephrasing your question or checking if the information exists in our Confluence space.",
//         processSteps: [
//           ...processSteps.slice(0, 2),
//           {
//             step: "Ranking pages by relevance using LLM",
//             status: "completed",
//             details: "No pages to rank",
//           },
//           {
//             step: "Selecting top 3 most relevant pages",
//             status: "completed",
//             details: "No pages to select",
//           },
//           {
//             step: "Generating enhanced response",
//             status: "completed",
//             details: 'Generated "not found" response',
//           },
//         ],
//       });
//     }
//
//     // Step 3: Rank pages by relevance
//     const rankedPages = await rankPagesByRelevance(message, allPages);
//     console.log(
//       "--- Ranked Pages (by title): ---\n",
//       rankedPages.map((p) => `${p.title} (Score: ${p.relevanceScore})`)
//     );
//     processSteps[2] = {
//       step: "Ranking pages by relevance using LLM",
//       status: "completed",
//       details: `Ranked ${rankedPages.length} pages`,
//     };
//
//     // Step 4: Select top 3 pages
//     const selectedPages = rankedPages
//       .slice(0, 3)
//       .filter((page) => page.content && page.content.trim().length > 50);
//     processSteps[3] = {
//       step: "Selecting top 3 most relevant pages",
//       status: "completed",
//       details: `Selected ${selectedPages.length} pages with content`,
//     };
//
//     if (selectedPages.length === 0) {
//       return NextResponse.json({
//         reply:
//           "I found some pages but couldn't extract meaningful content from them. Please try rephrasing your question.",
//         processSteps: [
//           ...processSteps.slice(0, 4),
//           {
//             step: "Generating enhanced response",
//             status: "completed",
//             details: "No usable content found",
//           },
//         ],
//       });
//     }
//
//     // Step 5: Generate enhanced response
//     const geminiPrompt = createEnhancedGeminiPrompt(
//       message,
//       selectedPages,
//       conversationHistory,
//       mode as "qa" | "testcase"
//     );
//     console.log("--- Final Gemini Prompt: ---\n", geminiPrompt);
//     const result = await model.generateContent(geminiPrompt);
//     const response = result.response.text();
//
//     processSteps[4] = {
//       step: "Generating enhanced response",
//       status: "completed",
//       details: `Generated response from ${selectedPages.length} sources`,
//     };
//
//     return NextResponse.json({
//       reply: response,
//       processSteps,
//       sourceDocuments: selectedPages.map((page) => ({
//         title: page.title,
//         url: page.url,
//         space: page.space.name,
//         relevanceScore: page.relevanceScore,
//       })),
//       searchDetails: {
//         totalPagesFound: allPages.length,
//         pagesUsed: selectedPages.length,
//         tokensUsed: selectedPages.reduce(
//           (sum, page) => sum + estimateTokens(page.content || ""),
//           0
//         ),
//       },
//     });
//   } catch (error) {
//     console.error("Enhanced API Error:", error);
//     return NextResponse.json(
//       {
//         reply:
//           "I encountered an error while processing your request. Please try again.",
//         error: error instanceof Error ? error.message : "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }
