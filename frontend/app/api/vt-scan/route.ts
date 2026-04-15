import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/vt-scan
 * Scans a URL using VirusTotal API v3.
 * The API key is kept server-side and never exposed to the client.
 */
export async function POST(request: NextRequest) {
  const { url } = await request.json();

  if (!url || typeof url !== "string") {
    return NextResponse.json(
      { error: "URL is required and must be a string." },
      { status: 400 }
    );
  }

  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) {
    console.error("VIRUSTOTAL_API_KEY is not set in environment variables.");
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 }
    );
  }

  // Normalize URL: Ensure it has a protocol, otherwise VT will likely return 404
  let normalizedUrl = url;
  if (!/^https?:\/\//i.test(url)) {
    normalizedUrl = `http://${url}`;
  }

  // VirusTotal API v3 requires URL ID to be Base64URL encoded (URL-safe, no padding)
  // Node.js Buffer supports 'base64url' directly
  const urlId = Buffer.from(normalizedUrl).toString("base64url");

  const vtUrl = `https://www.virustotal.com/api/v3/urls/${urlId}`;

  console.log("--- VirusTotal Request ---");
  console.log(`URL: ${vtUrl}`);
  console.log(`Method: GET`);
  console.log(`Headers: { "x-apikey": "${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}" }`);

  const vtResponse = await fetch(vtUrl, {
    method: "GET",
    headers: {
      "x-apikey": apiKey,
    },
  });

  console.log(`--- VirusTotal Response Status: ${vtResponse.status} ${vtResponse.statusText} ---`);

  if (!vtResponse.ok) {
    if (vtResponse.status === 404) {
      console.log("VirusTotal: URL not found (404). Returning fallback score.");
      // URL not found in VirusTotal database (never scanned).
      // Return a safe fallback mock score without triggering an error.
      return NextResponse.json({
        score: 45, // Default fallback
        stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, timeout: 0 }
      });
    }

    const errorText = await vtResponse.text();
    console.error(`VirusTotal API error: ${vtResponse.status} - ${errorText}`);
    return NextResponse.json(
      { error: `VirusTotal scan failed with status ${vtResponse.status}.` },
      { status: vtResponse.status }
    );
  }

  const vtData = await vtResponse.json();
  console.log("--- VirusTotal Response Data ---");
  console.log(JSON.stringify(vtData, null, 2));

  const attributes = vtData?.data?.attributes ?? {};
  const stats = attributes.last_analysis_stats ?? {};
  const reputation = attributes.reputation ?? 0;
  const categories = attributes.categories ?? {};

  const malicious = stats.malicious ?? 0;
  const suspicious = stats.suspicious ?? 0;

  /**
   * REFINED RISK SCORE CALCULATION
   * 1. Core hits: Malicious adds 30 pts, Suspicious adds 10 pts.
   * 2. Thresholds:
   *    - 3+ malicious = Critical (min 85)
   *    - 1-2 malicious = Warning (min 65)
   * 3. Reputation Impact: Negative reputation adds risk (abs(rep) * 5).
   * 4. Category Analysis: If categories include "phishing", "malicious", etc -> add 20 pts.
   */
  let calculatedScore = (malicious * 30) + (suspicious * 10);

  if (malicious >= 3) {
    calculatedScore = Math.max(calculatedScore, 85);
  } else if (malicious >= 1) {
    calculatedScore = Math.max(calculatedScore, 65);
  }

  // Reputation (Votes from VT community)
  if (reputation < 0) {
    calculatedScore += Math.abs(reputation) * 5;
  } else if (reputation > 5) {
    calculatedScore -= 10; // Slightly decrease risk for high positive reputation
  }

  // Check for malicious categories across engines
  const maliciousKeywords = ['phishing', 'malicious', 'malware', 'scam', 'fraud'];
  const hasMaliciousCategory = Object.values(categories).some(cat =>
    maliciousKeywords.some(keyword => String(cat).toLowerCase().includes(keyword))
  );
  if (hasMaliciousCategory) {
    calculatedScore += 20;
  }

  // Final score normalized between 0-100
  const score = Math.min(Math.max(calculatedScore, 0), 100);


  return NextResponse.json({
    score,
    stats: {
      malicious,
      suspicious,
      harmless: stats.harmless ?? 0,
      undetected: stats.undetected ?? 0,
      timeout: stats.timeout ?? 0,
    },
  });
}
