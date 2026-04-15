import "dotenv/config";

const BASE_URL = "http://localhost:3000";

async function requestJson(url: string, init?: RequestInit) {
	const response = await fetch(`${BASE_URL}${url}`, init);
	const data = await response.json();
	return { response, data };
}

async function runTests() {
	console.log("\nTesting User Profile Picture Upload API...\n");

	const username = `picture_user_${Date.now()}`;
	const createdResponse = await requestJson("/api/auth", {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ username, mode: "signup" }),
	});

	if (createdResponse.response.status !== 200) {
		console.log(`  ✗ Setup user creation failed: ${JSON.stringify(createdResponse.data)}`);
		process.exit(1);
	}

	const userId = createdResponse.data.id;
	const formData = new FormData();
	formData.append("userId", userId);
	formData.append(
		"file",
		new Blob([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], {
			type: "image/png",
		}),
		"avatar.png"
	);

	const uploadResponse = await requestJson("/api/user/profile-picture", {
		method: "POST",
		body: formData,
	});

	console.log(
		uploadResponse.response.status === 201 ? "  ✓ Upload returned 201" : `  ✗ Upload returned ${uploadResponse.response.status}`
	);
	console.log(
		typeof uploadResponse.data.profileImageUrl === "string" ? "  ✓ Profile image URL returned" : "  ✗ Missing profile image URL"
	);

	if (uploadResponse.response.status !== 201) {
		process.exit(1);
	}

	const settingsResponse = await requestJson(`/api/user?id=${userId}`, {
		headers: { Accept: "application/json" },
	});

	console.log(
		settingsResponse.data.profileImageUrl === uploadResponse.data.profileImageUrl ? "  ✓ Profile image persisted" : "  ✗ Profile image did not persist"
	);

	process.exit(0);
}

runTests().catch((error) => {
	console.error("\n✗ Unexpected error:", error instanceof Error ? error.message : error);
	process.exit(1);
});