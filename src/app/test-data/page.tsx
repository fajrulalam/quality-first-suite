"use client";

export default function TestDataPage() {
  return <div>Test Data Page - temporarily disabled</div>;
}

// import React, { useState } from 'react';
// import Link from 'next/link';
// import Image from 'next/image';
// import { toast, Toaster } from 'react-hot-toast';
// import { CurlGenerator, TokenData as CurlTokenData } from '@/utils/curlGenerator';
//
// interface ApiResponse {
//   status: 'success' | 'error' | 'skipped';
//   message: string;
//   data?: any;
// }
//
// interface TokenData {
//   accessToken?: string;
//   refreshToken?: string;
//   loginToken?: string;
//   authCode?: string;
//   mfaToken?: string;
//   otpId?: string;
//   passCode?: string;
//   skipToAuthCodeVerify?: boolean;
//   [key: string]: string | boolean | undefined;
// }
//
// interface ApiStep {
//   id: string;
//   name: string;
//   description: string;
//   status: 'pending' | 'loading' | 'completed' | 'error' | 'skipped';
//   response?: ApiResponse;
//   showResponse?: boolean;
// }
//
// // Function to generate cURL command for a specific API step using our utility class
// const generateCurlCommand = (step: string, tokens: TokenData) => {
//   try {
//     return CurlGenerator.generateFromEndpoint(step, tokens as CurlTokenData);
//   } catch (error) {
//     console.error(`Error generating curl for ${step}:`, error);
//     // Fallback to a generic API call for any errors
//     const baseUrl = window.location.origin;
//     const apiUrl = `${baseUrl}/api/test-data/${step}`;
//     return `curl -X POST \
//   ${apiUrl} \
//   -H "Content-Type: application/json" \
//   -d '${JSON.stringify(tokens, null, 2) || "{}"}'`;
//   }
// };
//
// // Function to copy text to clipboard
// const copyToClipboard = async (text: string) => {
//   try {
//     await navigator.clipboard.writeText(text);
//     return true;
//   } catch (err) {
//     console.error('Failed to copy: ', err);
//     return false;
//   }
// };
//
// export default function CreateHotelOrder() {
//   const [isProcessing, setIsProcessing] = useState<boolean>(false);
//   const [isPaused, setIsPaused] = useState<boolean>(false);
//   const [currentStep, setCurrentStep] = useState<number>(0);
//   const [tokenData, setTokenData] = useState<TokenData>({});
//   const [steps, setSteps] = useState<ApiStep[]>([
//     { id: 'session', name: 'Get Session', description: 'Retrieving tiket.com member session', status: 'pending', showResponse: false },
//     { id: 'login', name: 'Login', description: 'Authenticating with Blibli ticket', status: 'pending', showResponse: false },
//     { id: 'mfaMethods', name: 'MFA Methods', description: 'Getting available MFA methods', status: 'pending', showResponse: false },
//     { id: 'generateOtp', name: 'Generate OTP', description: 'Generating one-time password', status: 'pending', showResponse: false },
//     { id: 'verifyOtp', name: 'Verify OTP', description: 'Verifying one-time password', status: 'pending', showResponse: false },
//     { id: 'submitMfa', name: 'Submit MFA', description: 'Submitting multi-factor authentication', status: 'pending', showResponse: false },
//     { id: 'verifyAuthCode', name: 'Verify Auth Code', description: 'Verifying authentication code', status: 'pending', showResponse: false },
//     { id: 'serviceTicket', name: 'Service Ticket', description: 'Getting service ticket for authentication', status: 'pending', showResponse: false },
//     { id: 'activeOrderList', name: 'Active Orders', description: 'Retrieving list of active orders', status: 'pending', showResponse: false },
//     { id: 'hotelRoom', name: 'Hotel Room', description: 'Searching for hotel rooms', status: 'pending', showResponse: false },
//     { id: 'hotelPrebook', name: 'Hotel Prebook', description: 'Pre-booking for hotel', status: 'pending', showResponse: false },
//     { id: 'hotelBook', name: 'Hotel Book', description: 'Booking hotel room', status: 'pending', showResponse: false },
//     { id: 'paymentDetail', name: 'Payment Detail', description: 'Getting payment details', status: 'pending', showResponse: false },
//   ]);
//
//   // Calculate progress percentage
//   const getProgressPercentage = () => {
//     const totalSteps = steps.length;
//     const completedSteps = steps.filter(step => step.status === 'completed' || step.status === 'skipped').length;
//     return Math.round((completedSteps / totalSteps) * 100);
//   };
//
//   const updateStepStatus = (stepId: string, status: ApiStep['status'], response?: ApiResponse) => {
//     setSteps((prevSteps) =>
//       prevSteps.map((step) =>
//         step.id === stepId ? { ...step, status, ...(response && { response }) } : step
//       )
//     );
//   };
//
//
//   // Toggle response visibility for a step
//   const toggleResponseVisibility = (id: string) => {
//     setSteps(prevSteps => prevSteps.map(step =>
//       step.id === id ? { ...step, showResponse: !step.showResponse } : step
//     ));
//   };
//
//   const processStep = async (step: ApiStep, currentTokens: TokenData = tokenData) => {
//     updateStepStatus(step.id, 'loading');
//
//     try {
//       // Use the provided tokens or fall back to current tokenData
//       const tokensToUse = currentTokens || tokenData;
//
//       // Log request for debugging
//       console.log(`Sending request to /api/test-data/${step.id}`, {
//         step: step.id,
//         requestBody: tokensToUse,
//         hasLoginToken: !!tokensToUse.loginToken,
//         loginToken: tokensToUse.loginToken,
//         hasSkipFlag: !!tokensToUse.skipToAuthCodeVerify
//       });
//
//       const response = await fetch(`/api/test-data/${step.id}`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(tokensToUse),
//       });
//
//       // Get the complete response as text first to ensure we have the raw data
//       const responseText = await response.text();
//
//       // Try to parse as JSON
//       let result;
//       try {
//         result = JSON.parse(responseText);
//         console.log(`Response from ${step.id}:`, result);
//       } catch (parseError) {
//         console.error(`Error parsing JSON for ${step.id}:`, parseError, responseText);
//         result = {
//           status: 'error',
//           message: 'Failed to parse API response',
//           rawResponse: responseText
//         };
//       }
//
//
//       // Save any tokens from the response and return updated tokens
//       let updatedTokens = { ...currentTokens };
//       if (result) {
//         // Handle both wrapped and raw API responses
//         const dataSource = result.data || result; // For raw APIs, the data is at the root level
//
//         // Extract tokens directly without using saveTokens to avoid state timing issues
//         if (dataSource.accessToken) updatedTokens.accessToken = dataSource.accessToken;
//         if (dataSource.refreshToken) updatedTokens.refreshToken = dataSource.refreshToken;
//         if (dataSource.loginToken) updatedTokens.loginToken = dataSource.loginToken;
//         if (dataSource.authCode) updatedTokens.authCode = dataSource.authCode;
//         if (dataSource.mfaToken) updatedTokens.mfaToken = dataSource.mfaToken;
//         if (dataSource.otpId) updatedTokens.otpId = dataSource.otpId;
//         if (dataSource.passCode) updatedTokens.passCode = dataSource.passCode;
//         if (dataSource.skipToAuthCodeVerify) updatedTokens.skipToAuthCodeVerify = dataSource.skipToAuthCodeVerify;
//
//         // For raw API responses, also check nested data
//         if (dataSource.data) {
//           if (dataSource.data.passCode) updatedTokens.passCode = dataSource.data.passCode;
//           if (dataSource.data.otpId) updatedTokens.otpId = dataSource.data.otpId;
//           if (dataSource.data.authCode) updatedTokens.authCode = dataSource.data.authCode;
//           if (dataSource.data.token) updatedTokens.mfaToken = dataSource.data.token;
//         }
//
//         console.log('Updated tokens after step:', updatedTokens);
//         setTokenData(updatedTokens);
//       }
//
//       // Handle both wrapped and raw API responses
//       let stepStatus: 'completed' | 'error' | 'skipped';
//       let isSuccess = false;
//
//       if (result && result.status === 'success') {
//         // Old wrapped format
//         stepStatus = 'completed';
//         isSuccess = true;
//       } else if (result && result.status === 'skipped') {
//         // Old wrapped format
//         stepStatus = 'skipped';
//         isSuccess = true;
//       } else if (result && result.code === 'SUCCESS') {
//         // Raw API format
//         stepStatus = 'completed';
//         isSuccess = true;
//       } else if (result && (result.code || result.message)) {
//         // Raw API format with error
//         stepStatus = 'error';
//         isSuccess = false;
//       } else {
//         stepStatus = 'error';
//         isSuccess = false;
//       }
//
//       updateStepStatus(
//         step.id,
//         stepStatus,
//         result // Store the complete API response
//       );
//
//       // Return both success status and updated tokens
//       return {
//         success: isSuccess,
//         tokens: updatedTokens
//       };
//     } catch (error) {
//       console.error(`Error in step ${step.id}:`, error);
//       updateStepStatus(step.id, 'error', {
//         status: 'error',
//         message: error instanceof Error ? error.message : 'An unknown error occurred',
//       });
//       return {
//         success: false,
//         tokens: currentTokens
//       };
//     }
//   };
//
//   const continueProcess = async () => {
//     // Set processing state
//     setIsProcessing(true);
//
//     // Clear the paused state
//     setIsPaused(false);
//
//     // Store a local variable to track pause state to avoid state update delays
//     let localIsPaused = false;
//
//     // Update the pause handler to set our local variable
//     handleTogglePause = () => {
//       localIsPaused = true;
//       setIsPaused(true);
//     };
//
//     // Process remaining steps with local token tracking
//     let currentTokens = { ...tokenData };
//
//     for (let i = currentStep; i < steps.length && !localIsPaused; i++) {
//       console.log(`Processing step ${i}: ${steps[i].id}`);
//       console.log('Current tokens before step:', currentTokens);
//
//       const result = await processStep(steps[i], currentTokens);
//
//       if (!result.success) {
//         console.log(`Step ${steps[i].id} failed`);
//         setIsProcessing(false);
//         break;
//       }
//
//       // Update local tokens with the ones returned from the step
//       currentTokens = result.tokens;
//
//       // Add delays for specific steps
//       if (steps[i].id === 'generateOtp') {
//         console.log('Adding 15-20 second delay after Generate OTP...');
//         await new Promise(resolve => setTimeout(resolve, 15000 + Math.random() * 5000)); // 15-20 seconds
//       } else if (steps[i].id === 'verifyOtp' && i + 1 < steps.length && steps[i + 1].id === 'submitMfa') {
//         console.log('Adding 15-20 second delay before Submit MFA...');
//         await new Promise(resolve => setTimeout(resolve, 15000 + Math.random() * 5000)); // 15-20 seconds
//       }
//
//       // Handle conditional flow logic
//       if (steps[i].id === 'login') {
//         // Check if we need to skip MFA steps based on login response
//         const loginStep = steps.find(s => s.id === 'login');
//         const shouldSkipMFA = loginStep?.response?.data?.skipToAuthCodeVerify === true;
//
//         if (shouldSkipMFA) {
//           console.log('Direct auth code found, skipping MFA steps');
//
//           // Find the index of verifyAuthCode step
//           const verifyAuthCodeIndex = steps.findIndex(s => s.id === 'verifyAuthCode');
//
//           if (verifyAuthCodeIndex > -1) {
//             // Mark skipped steps as skipped (mfaMethods, generateOtp, verifyOtp, submitMfa)
//             const stepsToSkip = ['mfaMethods', 'generateOtp', 'verifyOtp', 'submitMfa'];
//             stepsToSkip.forEach(stepId => {
//               updateStepStatus(stepId, 'skipped', {
//                 status: 'skipped',
//                 message: 'Skipped due to direct auth code flow',
//                 data: {
//                   reason: 'Authentication completed directly, no MFA required'
//                 }
//               });
//             });
//
//             // Jump to verifyAuthCode step
//             i = verifyAuthCodeIndex - 1; // -1 because loop will increment i
//             console.log(`Skipping to step ${verifyAuthCodeIndex}: ${steps[verifyAuthCodeIndex].id}`);
//           }
//         }
//       }
//
//       // Only increment if we haven't paused
//       if (!localIsPaused) {
//         setCurrentStep(i + 1);
//       }
//
//       // Check if we need to pause
//       if (localIsPaused) {
//         console.log('Process paused');
//         break;
//       }
//
//       // Small delay between steps for better UX
//       if (i < steps.length - 1 && !localIsPaused) {
//         await new Promise(resolve => setTimeout(resolve, 800));
//       }
//     }
//
//     // Check if we completed all steps
//     if (currentStep >= steps.length - 1 && !localIsPaused) {
//       setIsProcessing(false);
//       alert('Process completed successfully!');
//     }
//   };
//
//   let handleTogglePause = () => {
//     setIsPaused(prev => !prev);
//   };
//   const handleCreateOrder = async () => {
//     if (isProcessing && !isPaused) return;
//
//     if (isPaused) {
//       // Resume the process
//       continueProcess();
//       return;
//     }
//
//     console.log('Starting new order process');
//
//     // Reset all steps to pending
//     setSteps(steps.map(step => ({
//       ...step,
//       status: 'pending',
//       response: undefined,
//       showResponse: false
//     })));
//
//     // Reset token data
//     setTokenData({});
//
//     // Start from the beginning
//     setCurrentStep(0);
//
//     // Start the process with the first step
//     setTimeout(() => {
//       continueProcess();
//     }, 100); // Small timeout to ensure state updates have been applied
//   };
//
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-[var(--tiket-light-blue)] to-white">
//       <Toaster position="top-right" />
//       {/* Header Section */}
//       <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-20">
//             <div className="flex items-center">
//               <Image
//                 src="/tiketcom logo.png"
//                 alt="Tiket.com Logo"
//                 width={120}
//                 height={40}
//                 className="h-10 w-auto"
//               />
//               <span className="ml-3 text-2xl font-bold text-[var(--tiket-blue)]">
//                 Create Hotel Order
//               </span>
//             </div>
//             <div className="flex items-center space-x-4">
//               <Link
//                 href="/"
//                 className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[var(--tiket-blue)] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 shadow-md hover:shadow-lg"
//               >
//                 Back to Home
//               </Link>
//             </div>
//           </div>
//         </div>
//       </header>
//
//       <main className="container mx-auto px-4 py-8">
//         <div className="glass-card mb-8">
//           <div className="flex justify-between items-center mb-8">
//             <div>
//               <h2 className="text-2xl font-bold">Hotel Order Test Data</h2>
//               <p className="text-gray-600">
//                 Create a test hotel order by triggering a chain of API calls
//               </p>
//             </div>
//             <div className="flex space-x-3">
//               {isProcessing && !isPaused ? (
//                 <button
//                   onClick={handleTogglePause}
//                   className="px-6 py-3 rounded-lg text-white font-semibold shadow-md transition-all bg-yellow-500 hover:bg-yellow-600 hover:shadow-lg"
//                 >
//                   Pause
//                 </button>
//               ) : null}
//               <button
//                 onClick={isPaused ? handleTogglePause : handleCreateOrder}
//                 disabled={isProcessing && !isPaused}
//                 className={`px-6 py-3 rounded-lg text-white font-semibold shadow-md transition-all ${
//                   isProcessing && !isPaused
//                     ? "bg-gray-400 cursor-not-allowed"
//                     : isPaused
//                     ? "bg-amber-500 hover:bg-amber-600 hover:shadow-lg"
//                     : "bg-[var(--tiket-blue)] hover:bg-blue-600 hover:shadow-lg"
//                 }`}
//               >
//                 {isPaused ? "Resume" : isProcessing ? "Processing..." : "Create"}
//               </button>
//             </div>
//           </div>
//
//           {/* Progress bar */}
//           <div className="mb-6">
//             <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
//               <div
//                 className="h-full bg-[var(--tiket-blue)] transition-all duration-500 ease-in-out"
//                 style={{ width: `${getProgressPercentage()}%` }}
//               ></div>
//             </div>
//             <div className="text-right text-sm text-gray-600 mt-1">
//               {Math.floor(getProgressPercentage())}% Complete
//             </div>
//           </div>
//
//           {/* Steps display */}
//           <div className="space-y-4 mb-8">
//             {steps.map((step, index) => {
//               const isActive = index === currentStep;
//               const isPast = index < currentStep;
//
//               return (
//                 <div
//                   key={step.id}
//                   className={`p-4 border rounded-lg transition-all ${
//                     isActive
//                       ? "border-[var(--tiket-blue)] bg-blue-50 shadow-md"
//                       : isPast
//                       ? "border-green-200 bg-green-50"
//                       : "border-gray-200"
//                   }`}
//                 >
//                   <div className="flex items-start">
//                     <div
//                       className={`w-6 h-6 rounded-full flex items-center justify-center text-white mr-3 flex-shrink-0 ${
//                         step.status === 'completed'
//                           ? "bg-green-500"
//                           : step.status === 'loading'
//                           ? "bg-blue-500"
//                           : step.status === 'error'
//                           ? "bg-red-500"
//                           : step.status === 'skipped'
//                           ? "bg-yellow-500"
//                           : "bg-gray-300"
//                       }`}
//                     >
//                       {step.status === 'completed' ? (
//                         "✓"
//                       ) : step.status === 'error' ? (
//                         "!"
//                       ) : step.status === 'skipped' ? (
//                         "→"
//                       ) : (
//                         index + 1
//                       )}
//                     </div>
//                     <div className="flex-grow relative">
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <h4 className="font-bold">
//                             {step.name}
//                             {step.status === 'loading' && (
//                               <span className="ml-2 inline-block animate-pulse">⋯</span>
//                             )}
//                           </h4>
//                           <p className="text-sm text-gray-600">{step.description}</p>
//                         </div>
//
//                         {/* Copy cURL button - only show for completed or error steps */}
//                         {(step.status === 'completed' || step.status === 'error') && (
//                           <button
//                             className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded flex items-center"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               try {
//                                 const curlCmd = generateCurlCommand(step.id, tokenData);
//                                 copyToClipboard(curlCmd).then(success => {
//                                   if (success) {
//                                     toast.success(`cURL command for ${step.name} copied to clipboard`);
//                                   } else {
//                                     toast.error('Failed to copy cURL command');
//                                   }
//                                 });
//                               } catch (error) {
//                                 console.error(`Error generating curl command for ${step.id}:`, error);
//                                 toast.error(`Error generating cURL command: ${error instanceof Error ? error.message : 'Unknown error'}`);
//                               }
//                             }}
//                             title="Copy cURL command"
//                           >
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
//                             </svg>
//                             Copy cURL
//                           </button>
//                         )}
//                       </div>
//
//                       {/* Response display for completed, error, or skipped steps */}
//                       {step.response && (step.status === 'completed' || step.status === 'error' || step.status === 'skipped') && (
//                         <div className="mt-2">
//                           <button
//                             className="text-xs text-blue-600 hover:underline"
//                             onClick={() => toggleResponseVisibility(step.id)}
//                           >
//                             {step.showResponse ? "Hide Response" : "Show Response"}
//                           </button>
//
//                           {step.showResponse && (
//                             <pre className={`mt-2 p-3 rounded-md text-xs overflow-auto max-h-40 ${
//                               step.status === 'completed' ? "bg-green-100" :
//                               step.status === 'error' ? "bg-red-100" :
//                               step.status === 'skipped' ? "bg-yellow-100" : ""
//                             }`}>
//                               {JSON.stringify(step.response, null, 2)}
//                             </pre>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//
//           {/* Token data display */}
//           <div className="bg-gray-50 p-4 rounded-lg">
//             <h3 className="text-lg font-semibold mb-2">Current Token Data:</h3>
//             <pre className="whitespace-pre-wrap text-sm">
//               {JSON.stringify(tokenData, null, 2) || "No tokens available yet"}
//             </pre>
//           </div>
//         </div>
//       </main>
//
//       <style jsx global>{`
//         :root {
//           --tiket-blue: #0064d2;
//           --tiket-light-blue: #e6f0fa;
//           --tiket-yellow: #ffd400;
//           --glass-bg: rgba(255, 255, 255, 0.8);
//           --glass-border: rgba(255, 255, 255, 0.3);
//           --shadow-color: rgba(0, 0, 0, 0.1);
//           --text-primary: #1a202c;
//           --text-secondary: #4a5568;
//         }
//         .glass-card {
//           background: var(--glass-bg);
//           backdrop-filter: blur(10px);
//           -webkit-backdrop-filter: blur(10px);
//           border-radius: 16px;
//           border: 1px solid var(--glass-border);
//           box-shadow: 0 8px 32px 0 var(--shadow-color);
//           padding: 2rem;
//           transition: all 0.3s ease;
//         }
//         .glass-card:hover {
//           box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.15);
//           transform: translateY(-2px);
//         }
//       `}</style>
//     </div>
//   );
// }
