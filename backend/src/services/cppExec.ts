import { config } from '../config/index.js';

// Judge0-compatible status codes
export const StatusCode = {
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT_EXCEEDED: 5,
  COMPILATION_ERROR: 6,
  RUNTIME_ERROR_SIGSEGV: 7,
  RUNTIME_ERROR_OTHER: 11,
} as const;

export interface ExecuteResult {
  stdout: string;
  stderr: string;
  status: { id: number; description: string };
  time: number;
  memory: number;
  compileOutput?: string;
}

export interface TestCase {
  input: string;
  output: string;
  isHidden?: boolean;
}

export interface TestResult {
  testCase: number;
  passed: boolean;
  isHidden: boolean;
  input?: string;
  expected?: string;
  actual?: string;
  time: number;
  memory: number;
  status: { id: number; description: string };
  compileOutput?: string;
}

/**
 * Execute C++ code with given input
 */
export async function executeCode(
  sourceCode: string,
  stdin: string,
  timeLimit: number = 5.0,
  memoryLimit: number = 256000
): Promise<ExecuteResult> {
  const url = `${config.cppExec.url}/submissions`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (config.cppExec.apiKey) {
    headers['X-API-Key'] = config.cppExec.apiKey;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      source_code: sourceCode,
      stdin,
      time_limit: timeLimit,
      memory_limit: memoryLimit,
    }),
    signal: AbortSignal.timeout(config.cppExec.timeout),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`CppExec service error: ${response.status} - ${errorText}`);
  }

  const result = await response.json() as {
    stdout?: string;
    stderr?: string;
    status: { id: number; description: string };
    time: number;
    memory: number;
    compile_output?: string;
  };

  return {
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    status: result.status,
    time: result.time,
    memory: result.memory,
    compileOutput: result.compile_output,
  };
}

/**
 * Run code against multiple test cases
 */
export async function runTestCases(
  sourceCode: string,
  testCases: TestCase[],
  timeLimit: number = 5.0,
  memoryLimit: number = 256000
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];

    try {
      const execResult = await executeCode(sourceCode, tc.input, timeLimit, memoryLimit);

      // Check for compilation error (only need to check once)
      if (execResult.status.id === StatusCode.COMPILATION_ERROR) {
        // Return compilation error for all remaining test cases
        for (let j = i; j < testCases.length; j++) {
          results.push({
            testCase: j + 1,
            passed: false,
            isHidden: testCases[j].isHidden || false,
            time: 0,
            memory: 0,
            status: execResult.status,
            compileOutput: execResult.compileOutput,
            ...(testCases[j].isHidden ? {} : {
              input: testCases[j].input,
              expected: testCases[j].output,
              actual: '',
            }),
          });
        }
        break;
      }

      // Compare output (trim whitespace for comparison)
      const actualOutput = execResult.stdout.trim();
      const expectedOutput = tc.output.trim();
      const passed = execResult.status.id === StatusCode.ACCEPTED && actualOutput === expectedOutput;

      // Update status if output doesn't match
      const finalStatus = passed
        ? execResult.status
        : execResult.status.id === StatusCode.ACCEPTED
          ? { id: StatusCode.WRONG_ANSWER, description: 'Wrong Answer' }
          : execResult.status;

      results.push({
        testCase: i + 1,
        passed,
        isHidden: tc.isHidden || false,
        time: execResult.time,
        memory: execResult.memory,
        status: finalStatus,
        ...(tc.isHidden ? {} : {
          input: tc.input,
          expected: tc.output,
          actual: execResult.stdout,
        }),
      });
    } catch (error) {
      // Handle network/timeout errors
      results.push({
        testCase: i + 1,
        passed: false,
        isHidden: tc.isHidden || false,
        time: 0,
        memory: 0,
        status: {
          id: StatusCode.RUNTIME_ERROR_OTHER,
          description: error instanceof Error ? error.message : 'Unknown error',
        },
        ...(tc.isHidden ? {} : {
          input: tc.input,
          expected: tc.output,
          actual: '',
        }),
      });
    }
  }

  return results;
}
