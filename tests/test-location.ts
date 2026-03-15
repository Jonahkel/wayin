export {};

const BASE_URL = 'http://localhost:3000';

async function test(
  name: string,
  url: string,
  expectStatus = 200,
  validate?: (data: any) => boolean
): Promise<boolean> {
  try {
    const fullUrl = BASE_URL + url;
    console.log(`\n📍 ${name}`);
    console.log(`   URL: ${fullUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(fullUrl, { 
      signal: controller.signal,
      headers: { "Accept": "application/json" }
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get("content-type");
    let data: any;

    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      // If we got HTML by mistake, this captures it as a string
      data = { message: "Received non-JSON response (likely HTML)" };
    }

    const statusPass = res.status === expectStatus;
    const validationPass = validate ? validate(data) : true;
    const pass = statusPass && validationPass;

    console.log(`   ${statusPass ? '✅' : '❌'} Status: ${res.status} (expected ${expectStatus})`);
    
    if (validate) {
      console.log(`   ${validationPass ? '✅' : '❌'} Data Validation: ${validationPass ? 'Passed' : 'Failed'}`);
    }

    return pass;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.log(`   ❌ Error: ${message}`);
    return false;
  }
}

async function runTests() {
  console.log('------------------------------------------');
  console.log('🚀 STARTING VENUE API VALIDATION');
  console.log('------------------------------------------');

  const results = [
    // 1. THE PRIMARY TEST CASE: University of Michigan
    // Updated URL to hit the API endpoint with query param
    await test(
      'Case: University of Michigan (R3990210)',
      '/api/venue?id=R3990210', 
      200,
      (data) => {
        // Our API returns the raw Nominatim array
        const item = Array.isArray(data) ? data[0] : data;
        
        const nameMatches = 
          item?.display_name?.toLowerCase().includes("university of michigan") || 
          item?.name?.toLowerCase().includes("university of michigan");
        
        const postcodeMatches = item?.address?.postcode === "48109";

        if (!nameMatches) console.log(`      ⚠️  Actual Name: ${item?.name || item?.display_name || 'Undefined'}`);
        if (!postcodeMatches) console.log(`      ⚠️  Actual Postcode: ${item?.address?.postcode || 'Undefined'}`);

        return !!(item && nameMatches && postcodeMatches);
      }
    ),

    // 2. ERROR HANDLING TEST: Missing ID
    await test(
      'Case: Missing ID parameter',
      '/api/venue',
      400, // Our API returns 400 for missing ID
      (data) => !!(data.error)
    ),

    // 3. ERROR HANDLING TEST: Invalid ID
    await test(
      'Case: Invalid ID format',
      '/api/venue?id=not_a_real_id',
      404, // Our API returns 404 if Nominatim finds nothing
      (data) => !!(data.error)
    )
  ];

  const passed = results.filter(r => r).length;
  const failed = results.filter(r => !r).length;

  console.log('\n------------------------------------------');
  console.log('📊 TEST SUMMARY');
  console.log(`   Total: ${results.length}`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log('------------------------------------------\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests();