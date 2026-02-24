const BASE_URL = 'http://localhost:3000';

async function test(name: string, url: string, expectStatus = 200): Promise<boolean> {
  try {
    const fullUrl = BASE_URL + url;
    console.log(`\n📍 ${name}`);
    console.log(`   URL: ${fullUrl}`);
    
    const res = await fetch(fullUrl);
    const data = await res.json();
    const pass = res.status === expectStatus;
    
    console.log(`   ${pass ? '✓' : '✗'} Status: ${res.status} ${pass ? '(expected)' : `(expected ${expectStatus})`}`);
    
    // Print response preview
    if (Array.isArray(data)) {
      console.log(`   Response: Array with ${data.length} items`);
      if (data.length > 0) {
        const first = data[0];
        console.log(`   First item: ${first.display_name || first.name || JSON.stringify(first).substring(0, 80)}`);
      }
    } else if (data.error) {
      console.log(`   Response: Error - ${data.error}`);
    } else {
      console.log(`   Response: ${JSON.stringify(data).substring(0, 100)}...`);
    }
    
    return pass;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.log(`\n📍 ${name}`);
    console.log(`   URL: ${BASE_URL + url}`);
    console.log(`   ✗ Error: ${message}`);
    return false;
  }
}

async function runTests() {
  console.log('Testing Search API...\n');
  
  const results = [
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
  }
}

runTests();