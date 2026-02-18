#!/usr/bin/env node

/**
 * apify-fetch.js
 * 
 * Fetch content from X/Twitter, Instagram, or Threads using Apify actors.
 * 
 * Usage: node apify-fetch.js --url "https://x.com/user/status/123" --platform "twitter"
 * 
 * Environment:
 *   APIFY_API_TOKEN - Apify API token
 */

const https = require('https');

const ACTORS = {
  twitter: 'apidojo/tweet-scraper',
  x: 'apidojo/tweet-scraper',
  instagram: 'apify/instagram-scraper',
  threads: 'curious_coder/threads-scraper'
};

function detectPlatform(url) {
  if (url.includes('x.com') || url.includes('twitter.com')) return 'twitter';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('threads.net')) return 'threads';
  return null;
}

function httpRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function runActor(actorId, input, token) {
  const encodedActor = encodeURIComponent(actorId);
  const body = JSON.stringify(input);
  
  // Start the actor run
  const startRes = await httpRequest({
    hostname: 'api.apify.com',
    path: `/v2/acts/${encodedActor}/runs?token=${token}&waitForFinish=120`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  }, body);

  if (startRes.status !== 201) {
    throw new Error(`Actor start failed: ${JSON.stringify(startRes.data)}`);
  }

  const datasetId = startRes.data?.data?.defaultDatasetId;
  if (!datasetId) {
    throw new Error('No dataset ID returned');
  }

  // Fetch results
  const dataRes = await httpRequest({
    hostname: 'api.apify.com',
    path: `/v2/datasets/${datasetId}/items?token=${token}&limit=5`,
    method: 'GET'
  });

  return dataRes.data;
}

function buildInput(platform, url) {
  switch (platform) {
    case 'twitter':
    case 'x':
      return {
        startUrls: [url],
        maxItems: 1,
        addUserInfo: true
      };
    case 'instagram':
      return {
        directUrls: [url],
        resultsLimit: 1
      };
    case 'threads':
      return {
        urls: [url],
        maxItems: 1
      };
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

function extractContent(platform, data) {
  if (!Array.isArray(data) || data.length === 0) {
    return { text: '', author: '', error: 'No data returned' };
  }
  
  const item = data[0];
  
  switch (platform) {
    case 'twitter':
    case 'x':
      return {
        text: item.full_text || item.text || item.tweet?.full_text || '',
        author: item.user?.screen_name || item.author?.userName || '',
        metrics: {
          likes: item.favorite_count || item.likeCount || 0,
          retweets: item.retweet_count || item.retweetCount || 0
        }
      };
    case 'instagram':
      return {
        text: item.caption || '',
        author: item.ownerUsername || '',
        metrics: {
          likes: item.likesCount || 0,
          comments: item.commentsCount || 0
        }
      };
    case 'threads':
      return {
        text: item.text || item.caption || '',
        author: item.author?.username || item.ownerUsername || '',
        metrics: {}
      };
    default:
      return { text: JSON.stringify(item).slice(0, 2000), author: '' };
  }
}

async function main() {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i += 2) {
    args[argv[i].replace(/^--/, '')] = argv[i + 1] || '';
  }

  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    console.error(JSON.stringify({ success: false, error: 'APIFY_API_TOKEN required' }));
    process.exit(1);
  }

  const url = args.url;
  if (!url) {
    console.error(JSON.stringify({ success: false, error: '--url required' }));
    process.exit(1);
  }

  const platform = args.platform || detectPlatform(url);
  if (!platform || !ACTORS[platform]) {
    console.error(JSON.stringify({ success: false, error: `Unsupported platform for URL: ${url}` }));
    process.exit(1);
  }

  try {
    const input = buildInput(platform, url);
    const data = await runActor(ACTORS[platform], input, token);
    const content = extractContent(platform, data);
    
    console.log(JSON.stringify({
      success: true,
      platform,
      url,
      ...content
    }));
  } catch (err) {
    console.error(JSON.stringify({
      success: false,
      error: err.message
    }));
    process.exit(1);
  }
}

main();
