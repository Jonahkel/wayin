import "dotenv/config";

const BASE_URL = "http://localhost:3000";

async function requestJson(url: string, init?: RequestInit) {
	const response = await fetch(`${BASE_URL}${url}`, {
		...init,
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			...(init?.headers ?? {}),
		},
	});

	const data = await response.json();
	return { response, data };
}

async function runTests() {
	console.log("\nTesting User Settings API...\n");

	const username = `settings_user_${Date.now()}`;
	const profileImageUrl = "https://example.com/avatar.png";
	const updatedUsername = `${username}_updated`;

	const createdResponse = await requestJson("/api/auth", {
		method: "POST",
		body: JSON.stringify({ username, mode: "signup" }),
	});

	if (createdResponse.response.status !== 200) {
		console.log(`  ✗ Setup user creation failed: ${JSON.stringify(createdResponse.data)}`);
		process.exit(1);
	}

	const userId = Number(createdResponse.data.id);

	console.log("📍 GET current settings");
	const getResponse = await requestJson(`/api/user?id=${userId}`);
	console.log(
		getResponse.response.status === 200 ? "  ✓ GET returned 200" : `  ✗ GET returned ${getResponse.response.status}`
	);
	console.log(
		getResponse.data.username === username ? "  ✓ Username matches" : `  ✗ Username mismatch: ${getResponse.data.username}`
	);
	console.log(
		getResponse.data.isPrivate === false ? "  ✓ Default privacy is public" : `  ✗ Default privacy mismatch: ${getResponse.data.isPrivate}`
	);

	console.log("\n📍 PATCH settings");
	const patchResponse = await requestJson("/api/user", {
		method: "PATCH",
		body: JSON.stringify({
			id: userId,
			username: updatedUsername,
			profileImageUrl,
			isPrivate: true,
		}),
	});

	console.log(
		patchResponse.response.status === 200 ? "  ✓ PATCH returned 200" : `  ✗ PATCH returned ${patchResponse.response.status}`
	);
	console.log(
		patchResponse.data.username === updatedUsername ? "  ✓ Username updated" : `  ✗ Username mismatch: ${patchResponse.data.username}`
	);
	console.log(
		patchResponse.data.profileImageUrl === profileImageUrl ? "  ✓ Profile image updated" : `  ✗ Profile image mismatch: ${patchResponse.data.profileImageUrl}`
	);
	console.log(
		patchResponse.data.isPrivate === true ? "  ✓ Privacy updated to private" : `  ✗ Privacy mismatch: ${patchResponse.data.isPrivate}`
	);

	if (patchResponse.response.status !== 200) {
		process.exit(1);
	}

	console.log("\n📍 GET updated settings");
	const updatedGetResponse = await requestJson(`/api/user?id=${userId}`);
	console.log(
		updatedGetResponse.data.username === updatedUsername ? "  ✓ Updated username persisted" : "  ✗ Updated username did not persist"
	);
	console.log(
		updatedGetResponse.data.isPrivate === true ? "  ✓ Updated privacy persisted" : "  ✗ Updated privacy did not persist"
	);

	await requestJson("/api/user", {
		method: "PATCH",
		body: JSON.stringify({
			id: userId,
			username,
			profileImageUrl: null,
			isPrivate: false,
		}),
	});

	process.exit(0);
}

runTests().catch((error) => {
	console.error("\n✗ Unexpected error:", error instanceof Error ? error.message : error);
	process.exit(1);
});