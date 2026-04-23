import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:2222';

function getCoreCandidates() {
  return Array.from(
    new Set(
      [
        process.env.NEXT_PUBLIC_CORE_API_URL,
        process.env.CORE_API_URL,
        'http://127.0.0.1:2122',
        'http://127.0.0.1:3333',
      ].filter(Boolean),
    ),
  ) as string[];
}

export async function GET() {
  const checkedAt = new Date().toISOString();

  try {
    const cookieStore = await cookies();
    const jwtToken = cookieStore.get('jwt')?.value;
    const authHeaders = jwtToken
      ? {
          Cookie: `jwt=${jwtToken}`,
        }
      : undefined;

    const nestResponse = await fetch(`${API_URL}/session/me`, {
      headers: authHeaders,
      cache: 'no-store',
    });

    let mailGateway:
      | {
          ok: boolean;
          status?: string;
          error?: string;
          issues?: string[];
          checkedAt?: string;
          authRequired?: boolean;
          tokenConfigured?: boolean;
          requestSigningRequired?: boolean;
          requestSigningConfigured?: boolean;
          allowedTimestampSkewSeconds?: number;
          nonceTtlSeconds?: number;
          rateLimitWindowSeconds?: number;
          rateLimitMaxRequests?: number;
          maxRequestBytes?: number;
        }
      | undefined;

    if (jwtToken) {
      try {
        const response = await fetch(`${API_URL}/admin/mailbox/security`, {
          headers: authHeaders,
          cache: 'no-store',
        });

        if (response.ok) {
          const payload = await response.json();
          mailGateway = {
            ok: Boolean(payload.ok),
            status: payload.status,
            issues: Array.isArray(payload.issues) ? payload.issues : [],
            checkedAt: payload.checkedAt,
            authRequired: Boolean(payload.authRequired),
            tokenConfigured: Boolean(payload.tokenConfigured),
            requestSigningRequired: Boolean(payload.requestSigningRequired),
            requestSigningConfigured: Boolean(payload.requestSigningConfigured),
            allowedTimestampSkewSeconds:
              typeof payload.allowedTimestampSkewSeconds === 'number'
                ? payload.allowedTimestampSkewSeconds
                : undefined,
            nonceTtlSeconds:
              typeof payload.nonceTtlSeconds === 'number'
                ? payload.nonceTtlSeconds
                : undefined,
            rateLimitWindowSeconds:
              typeof payload.rateLimitWindowSeconds === 'number'
                ? payload.rateLimitWindowSeconds
                : undefined,
            rateLimitMaxRequests:
              typeof payload.rateLimitMaxRequests === 'number'
                ? payload.rateLimitMaxRequests
                : undefined,
            maxRequestBytes:
              typeof payload.maxRequestBytes === 'number'
                ? payload.maxRequestBytes
                : undefined,
            error: typeof payload.error === 'string' ? payload.error : undefined,
          };
        } else {
          mailGateway = {
            ok: false,
            status: 'down',
            error: `Mailbox security check returned ${response.status}`,
            checkedAt: new Date().toISOString(),
          };
        }
      } catch (error) {
        mailGateway = {
          ok: false,
          status: 'down',
          error:
            error instanceof Error
              ? error.message
              : 'Mailbox security check failed',
          checkedAt: new Date().toISOString(),
        };
      }
    } else {
      mailGateway = {
        ok: false,
        status: 'down',
        error: 'Missing admin authentication token for mailbox security check',
        checkedAt: new Date().toISOString(),
      };
    }

    let coreStatus:
      | {
          ok: boolean;
          url?: string;
          error?: string;
          status?: string;
          service?: string;
          timestamp?: string;
        }
      | undefined;

    for (const candidate of getCoreCandidates()) {
      try {
        const response = await fetch(`${candidate}/health`, {
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          coreStatus = {
            ok: true,
            url: candidate,
            status: data.status,
            service: data.service,
            timestamp: data.ts,
          };
          break;
        }

        coreStatus = {
          ok: false,
          url: candidate,
          error: `Health check returned ${response.status}`,
        };
      } catch (error) {
        coreStatus = {
          ok: false,
          url: candidate,
          error: error instanceof Error ? error.message : 'Core API unavailable',
        };
      }
    }

    return NextResponse.json({
      checkedAt,
      nest: {
        ok: nestResponse.ok,
        url: API_URL,
        error: nestResponse.ok ? undefined : `Session check returned ${nestResponse.status}`,
      },
      mailGateway: mailGateway || {
        ok: false,
        status: 'down',
        error: 'Mailbox security status is unavailable',
      },
      core: coreStatus || {
        ok: false,
        error: 'No core API candidate responded',
      },
    });
  } catch (error) {
    console.error('System status error:', error);
    return NextResponse.json(
      {
        checkedAt,
        nest: {
          ok: false,
          url: API_URL,
          error: 'Failed to check backend session',
        },
        mailGateway: {
          ok: false,
          status: 'down',
          error: 'Failed to check mailbox gateway security',
        },
        core: {
          ok: false,
          error: error instanceof Error ? error.message : 'Failed to check core API',
        },
      },
      { status: 200 },
    );
  }
}
