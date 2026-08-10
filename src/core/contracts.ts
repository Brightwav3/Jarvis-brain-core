export type HealthState = 'healthy' | 'degraded' | 'unhealthy';

export type RuntimeError = {
  code: string;
  message: string;
  context: Record<string, unknown>;
  remediation: string;
};

export type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: RuntimeError };

export type VersionInfo = {
  identity: string;
  version: string;
};

export const createOk = <T>(data: T): ApiEnvelope<T> => ({
  ok: true,
  data,
});

export const createError = (
  code: string,
  message: string,
  context: Record<string, unknown>,
  remediation: string,
): ApiEnvelope<never> => ({
  ok: false,
  error: { code, message, context, remediation },
});
