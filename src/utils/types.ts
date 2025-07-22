export interface TestData {
  testName: string;
  status: string;
  sessionId: string;
  failureStep: string;
  exceptionMessage: string;
  failureReason: string;
  passedIn?: string;
  issueType?: string;
  rootCause?: string;
  responsibleQA?: string;
}