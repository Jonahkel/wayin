const BASE_URL = 'http://localhost:3000';

// Updated test function to include a validation callback
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
    
    // Add a timeout so the test doesn't hang forever
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(fullUrl, { signal: controller.signal });
    clearTimeout(id);

    const contentType = res.headers.get("content-type");
    let data: any;

    // Only parse as JSON if the server says it's JSON
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = { message: await res.text() };
    }
    
    const statusPass = res.status === expectStatus;
    const validationPass = validate ? validate(data) : true;
    const pass = statusPass && validationPass;
    
    console.log(`   ${statusPass ? '✓' : '✗'} Status: ${res.status} (expected ${expectStatus})`);
    
    if (validate) {
      console.log(`   ${validationPass ? '✓' : '✗'} Data Validation: ${validationPass ? 'Passed' : 'Failed'}`);
    }

    // Print response preview
    if (Array.isArray(data)) {
      console.log(`   Response: Array with ${data.length} items`);
    } else if (data.error || data.message) {
      console.log(`   Response Message: ${data.error || data.message}`);
    }
    
    return pass;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.log(`   ✗ Error: ${message}`);
    return false;
  }
}

async function runTests() {
  console.log('Testing Search API...\n');
  
  const results = [
    await test(
      'Case: Error Message (No params)', 
      '/api/search', 
      400, 
      (data) => !!(data.error || data.message) // Expecting an error field
    ),

    // 2. TEST: No Results Found
    await test(
      'Case: No Results Found', 
      '/api/search?q=asdfghjkl12345', // Query unlikely to exist
      200, 
      (data) => Array.isArray(data) && data.length === 0
    ),

    // 3. TEST: Results Found
    await test(
      'Case: Results Found', 
      '/api/search?q=London', 
      200, 
      (data) => Array.isArray(data) && data.length > 0
    ),
    await test('No params - should fail', '/api/search', 400),
    await test('Search with query', '/api/search?q=restaurant', 200),
    await test('Search with location', '/api/search?q=park&lat=40&lon=-74', 200),
    await test('Search by amenity', '/api/search?amenity=cafe', 200),
    await test('Search by location and amenity', '/api/search?q=starbucks&amenity=cafe', 200),
  ];
  
  const passed = results.filter(r => r).length;
  const failed = results.filter(r => !r).length;
  
  console.log('\nDone!');
  console.log(`Passed: ${passed}, Failed: ${failed}`);
  
  // Exit with error code if any tests failed
  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();